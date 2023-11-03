const handleField = document.getElementById("handle");
const tagsField = document.getElementById("tags");
const linkField = document.getElementById("copiedLink");
const saveButton = document.getElementById("saveButton");
const formContent = document.getElementById("form-content");
const tagError = document.getElementById("tag-error");

function getDataFromLocalStorage() {
  return chrome.storage.local.get().then((result) => {
    return result;
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  const { url, accessToken } = await getDataFromLocalStorage();
  if (accessToken) {
    linkField.value = url;
    tweetUrl = url;

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${accessToken}`);

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
    };

    const response = await fetch(
      "https://notionpack.com/api/v1/twitter/database/",
      requestOptions
    )
      .then((res) => {
        return res.json();
      })
      .catch((error) => {
        console.log(error);
      });

    const databaseList = response.results;
    if (databaseList.length) {
      for (let i = 0; i < databaseList.length; i++) {
        const newOption = document.createElement("option");
        newOption.text =
          databaseList[i].database_handle +
          " " +
          "(" +
          databaseList[i].database_name +
          ")";
        newOption.value = databaseList[i].database_handle;
        newOption.selected = databaseList[i].is_default_database;
        handleField.appendChild(newOption);
      }
    } else {
      const newElement = `
      <article class="form-content" id="form-content" style="justify-content:center;align-items:center">
        <img src="../icons/icon128.png" alt="np-icon" />
        <h3 style="text-align: center">The Notion database is missing. Please navigate to the NotionPack and generate a new database before attempting to save tweets.</h3>
      </article>
      `;
      formContent.outerHTML = newElement;
    }
  }
});

async function saveToNotion(requestBody) {
  saveButton.classList.add("btn-loading");
  const myHeaders = new Headers();
  const { accessToken } = await getDataFromLocalStorage();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${accessToken}`);
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(requestBody),
  };

  return new Promise(function (resolve, reject) {
    fetch("https://notionpack.com/api/v1/twitter/save/", requestOptions)
      .then((res) => {
        resolve(res.json());
        saveButton.classList.remove("btn-loading");
      })
      .catch((error) => {
        alert("Failed");
        reject(error);
        saveButton.classList.remove("btn-loading");
      });
  });
}

saveButton?.addEventListener("click", async () => {
  const regex = /#\w+/g;
  const handleValue = handleField.value;
  const tagsValue = tagsField.value;
  const tweetLink = linkField.value;
  const formattedTags = tagsValue?.replace(/\s/g, "");
  const matches = formattedTags?.match(regex);
  const isValid = !tagsValue
    ? true
    : matches?.length === formattedTags?.split(",").length;

  const requestBody = formattedTags
    ? {
        url: tweetLink,
        database_handle: handleValue,
        tags: formattedTags,
      }
    : {
        url: tweetLink,
        database_handle: handleValue,
      };

  if (tweetLink) {
    tagError.textContent = "";

    if (isValid) {
      const response = await saveToNotion(requestBody);
      if (response.message) {
        const newElement =
          response.message === "TWEET Saved!"
            ? `
      <article class="form-content" id="form-content" style="justify-content:center;align-items:center">
        <img src="../icons/icon128.png" alt="np-icon" />
        <h2>Tweet has been saved successfully.</h2>
      </article>
      `
            : `
      <article class="form-content" id="form-content" style="justify-content:center;align-items:center">
        <img src="../icons/icon128.png" alt="np-icon" />
        <h2>Thread has been saved successfully.</h2>
      </article>
      `;
        formContent.outerHTML = newElement;
      } else {
        const newElement = `
      <article class="form-content" id="form-content" style="justify-content:center;align-items:center">
        <img src="../icons/icon128.png" alt="np-icon" />
        <h2>Something went wrong. Please try again.</h2>
      </article>
      `;
        formContent.outerHTML = newElement;
      }
    } else {
      tagError.textContent = `Kindly specify tags in the requested format, such as "#tag1,#tag2"`;
    }
  } else {
    const newElement = `
      <article class="form-content" id="form-content" style="justify-content:center;align-items:center">
        <img src="../icons/icon128.png" alt="np-icon" />
        <h2>Tweet link not found. Please try again.</h2>
      </article>
      `;
    formContent.outerHTML = newElement;
  }
});
