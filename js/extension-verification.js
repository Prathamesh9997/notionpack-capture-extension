window.addEventListener('message' , function (event) {
    if(event.origin !== "https://notionpack.com" || event.data.source !== "notionpack") return;
    event.source.postMessage({ extensionInstalled: true , source: 'notionpack-chrome-extension' });
})
