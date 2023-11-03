chrome.runtime.onMessage.addListener((message) => {
  chrome.storage.local.set({
    url: message.tweetUrl,
  });
});

function connectWithWebApp() {
  const root = document.querySelector("#root");
  root.setAttribute("data-extension-installed", true);
  root.setAttribute("data-extension-authenticated", true);
  return JSON.stringify(localStorage);
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") {
    if (
      tab.url === "https://notionpack.com/dashboard/" ||
      tab.url === "https://notionpack.com/capture" ||
      tab.url === "https://notionpack.com/capture/kindle-highlights/" ||
      tab.url === "https://notionpack.com/capture/twitter-pocket/"
    ) {
      chrome.scripting.executeScript(
        {
          target: { tabId },
          func: connectWithWebApp,
        },
        async (injectionResults) => {
          const stateString = JSON.parse(injectionResults[0].result).state;
          const stateObject = JSON.parse(stateString);
          chrome.storage.local
            .set({
              accessToken: stateObject.authUser.userTokenData.access_token,
            })
            .then((res) => console.log(res));
        }
      );
    }
  }
});
