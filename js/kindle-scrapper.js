function getDataFromLocalStorage() {
  return chrome.storage.local
    .get(["accessToken", "userId", "hasKindleDb"])
    .then((result) => {
      return result;
    });
}

function convertDate(dateString) {
  const [, month, date, year] = dateString.split(" ");
  const monthValue = new Date(`${month} 1, ${year}`).getMonth() + 1;
  const formattedMonth = monthValue.toString().padStart(2, "0");
  const formattedDate = date.slice(0, -1).padStart(2, "0");
  return `${year}-${formattedMonth}-${formattedDate}`;
}

async function getBooksList() {
  const response = await fetch("https://read.amazon.com/notebook");
  const htmlText = await response.text();
  const booksPage = new DOMParser().parseFromString(htmlText, "text/html");
  const booksList = [];
  booksPage
    .querySelectorAll(".a-row.kp-notebook-library-each-book.aok-hidden")
    .forEach((book) => {
      const annotatedValue = booksPage.querySelector(
        `#kp-notebook-annotated-date-${book.id}`
      ).value;
      const lastHighlightedDate = convertDate(annotatedValue);
      booksList.push({ id: book.id, lastHighlightedDate });
    });
  return booksList;
}

async function updateToNotion(requestBody) {
  const myHeaders = new Headers();
  const { accessToken } = await getDataFromLocalStorage();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${accessToken}`);
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify([...requestBody]),
  };
  return new Promise(function (resolve, reject) {
    fetch(
      "https://notionpack.com/api/v1/kindle/sync-highlights/",
      requestOptions
    )
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
}

const highlightApi = (bookId) =>
  `https://read.amazon.com/notebook?asin=${bookId}&contentLimitState=&`;

const loader = document.createElement("div");
loader.innerHTML = "<div></div><div></div><div></div><div></div>";
loader.classList.add("ring-loader");

const overlay = document.createElement("div");
overlay.classList.add("overlay");

const syncText = document.createElement("p");
syncText.classList.add("overlay-text");
syncText.textContent = "Syncing...";

function appendChildren() {
  overlay.appendChild(syncText);
  overlay.appendChild(loader);
  document.body.appendChild(overlay);
}

function removeChild() {
  document.body.removeChild(overlay);
}

function convertBookFromHTMLtoJS(htmlText, id) {
  const data = {
    highlights: [],
  };
  const highlightsPage = new DOMParser().parseFromString(htmlText, "text/html");
  data.book_id = id;
  data.cover = highlightsPage
    .querySelector(".kp-notebook-cover-image-border")
    .getAttribute("src");
  data.title = highlightsPage.querySelector(
    ".a-spacing-top-small.a-color-base.kp-notebook-selectable.kp-notebook-metadata"
  ).textContent;
  data.author = highlightsPage.querySelector(
    ".a-spacing-none.a-spacing-top-micro"
  ).textContent;
  data.url = highlightsPage
    .querySelector(".a-link-normal.kp-notebook-printable")
    .getAttribute("href");
  highlightsPage.querySelectorAll("#kp-annotation-location").forEach((info) => {
    data.highlights.push({
      location: info.getAttribute("value"),
      url: `https://read.amazon.com/notebook`,
    });
  });
  highlightsPage.querySelectorAll("#highlight").forEach((info, index) => {
    data.highlights[index].content = info.textContent;
  });
  data.count = data.highlights.length;
  return data;
}

async function getSingleBookWithId(id, lastHighlightedDate) {
  return new Promise(function (resolve) {
    fetch(highlightApi(id))
      .then((res) => res.text())
      .then((htmlText) => {
        const bookData = { ...convertBookFromHTMLtoJS(htmlText, id) };
        bookData.last_highlighted = lastHighlightedDate;
        resolve(bookData);
      });
  });
}

async function getHighlights() {
  const params = new URLSearchParams(window.location.search);
  const redirectURL = params.get("redirect-url");
  if (redirectURL) {
    appendChildren();
  }
  const booksList = await getBooksList();
  const booksListForStorage = {};
  const bookFetchPromises = [];
  for (const { id, lastHighlightedDate } of booksList) {
    bookFetchPromises.push(getSingleBookWithId(id, lastHighlightedDate));
  }
  const booksForUpdate = [];
  const allBooksData = await Promise.all(bookFetchPromises);
  for (const book of allBooksData) {
    booksListForStorage[book.book_id] = {
      lastHighlightedDate: book.last_highlighted,
      numberOfHighlights: book.count,
    };
    booksForUpdate.push(book);
  }

  if (booksForUpdate.length > 0) {
    await updateToNotion(booksForUpdate).then(() => {
      chrome.storage.local.set({
        lastSyncedInfo: booksListForStorage,
      });
    });
  }
  if (redirectURL) {
    document.body.removeChild(overlay);
    window.location.href = `${redirectURL}?book=${booksList.length}`;
  }
}

(async () => {
  await getHighlights();
  setInterval(async () => {
    await getHighlights();
  }, 900000);
})();
