console.log("MutationObserver:Start");

const onMutation = (mutations) => {
  // mo.disconnect();
  for (const { addedNodes } of mutations) {
    for (const node of addedNodes) {
      if (node) {
        if (node.dataset && node.dataset.testid) {
          if (node.dataset.testid == "cellInnerDiv") {
            // Get tweet link
            let hrefs = [];
            const tweets = node.querySelectorAll("[data-testid='tweet']");
            const outerHTMLContent = tweets?.[0]?.outerHTML;
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = outerHTMLContent;
            const anchorElements = tempDiv.querySelectorAll("a");

            if (anchorElements.length) {
              for (let i = 0; i < anchorElements.length; i++) {
                const hrefVal = anchorElements[i].getAttribute("href");
                if (window.location.href.includes("status")) {
                  hrefs.push(window.location.href);
                } else {
                  hrefVal.includes("status") &&
                    hrefVal.includes("analytics") &&
                    hrefs.push(
                      "https://twitter.com" + hrefVal.split("/analytics")[0]
                    );
                }
              }
            }

            // Create and append button on each tweet

            //font-awesome cdn
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.href =
              "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css";
            document.head.appendChild(link);

            // Save icon
            const saveIcon = document.createElement("i");
            saveIcon.className = "far fa-save";
            saveIcon.style.cssText = `
              color: #71767b;
              font-size: 16px;
            `;

            // Button
            const button = document.createElement("button");
            button.style.cssText = `
              position: absolute;
              bottom: 7.5px;
              right: 85px;
              display: inline-block;
              padding: 4px;
              border-radius: 0.25rem;
              border: none;
              background-color: inherit;
              cursor: pointer;
            `;
            button.appendChild(saveIcon);

            // Tooltip
            const tooltip = document.createElement("p");
            tooltip.style.cssText = `
              padding: 4px 6px;
              border-radius: 2px;
              color: white;
              background-color: #536471;
              position: absolute;
              bottom: 40px;
              right: 55px;
              font-size: 12px;
              margin: 0;
              display: none;
            `;
            tooltip.textContent = "Save to notion";
            tweets?.[0]?.append(button, tooltip);

            // Button hover states
            button.addEventListener("mouseover", function () {
              saveIcon.style.color = "#1d9bf0";
              tooltip.style.display = "block";
            });

            button.addEventListener("mouseout", function () {
              saveIcon.style.color = "#71767b";
              tooltip.style.display = "none";
            });

            // Handle button click, e.g., save the tweet
            button.addEventListener("click", async function () {
              if (hrefs?.[0]) {
                chrome.runtime.sendMessage(
                  { tweetUrl: hrefs?.[0] },
                  (response) => {
                    console.log("Data sent to extension");
                  }
                );

                let offsetX,
                  offsetY,
                  isDragging = false;

                const isAccessTokenAvailable = await chrome.storage.local
                  .get()
                  .then((result) => "accessToken" in result);

                // Popup
                const parentDiv = document.createElement("div");
                parentDiv.id = "dialog-fnjckhboamnndabpdgknoofcbgfijfim";
                parentDiv.role = "dialog";
                parentDiv.style.cssText = `
                  all: unset;
                  transition: 0.04s ease;
                  background: white;
                  border: 0px;
                  border-radius: 5px;
                  clip: auto;
                  display: block;
                  overflow: hiiden;
                  position: fixed;
                  right: 12px;
                  top: 12px;
                  user-select: none;
                  width: 420px;
                  z-index: 2147483647;
                  background-color: transperant;
                `;

                parentDiv.addEventListener("mousedown", (e) => {
                  isDragging = true;
                  offsetX = e.clientX - parentDiv.getBoundingClientRect().left;
                  offsetY = e.clientY - parentDiv.getBoundingClientRect().top;
                  parentDiv.style.zIndex = 2;
                });

                document.addEventListener("mousemove", (e) => {
                  if (isDragging) {
                    parentDiv.style.left = e.clientX - offsetX + "px";
                    parentDiv.style.top = e.clientY - offsetY + "px";
                  }
                });

                document.addEventListener("mouseup", () => {
                  isDragging = false;
                  parentDiv.style.zIndex = 1;
                });

                const headerDiv = document.createElement("div");
                headerDiv.id = "dialog-top-fnjckhboamnndabpdgknoofcbgfijfim";
                headerDiv.style.cssText = `
                  all:unset; 
                  align-items: center;
                  background-color: rgb(255, 255, 255);
                  box-shadow: rgb(234, 234, 234) 0px -1px inset;
                  cursor: grab; 
                  display: inline-flex;
                  height: 40px;
                  left: 0px;
                  padding: 0px 8px 0px 12px;
                  position: absolute; 
                  right: 0px;
                  top: 0px;
                `;

                const titleDiv = document.createElement("div");
                titleDiv.style.cssText = `
                  all:unset; 
                  color: rgb(51, 51, 51);  
                  font-family: -apple-system, system-ui, BlinkMacSystemFont;, Roboto, Oxygen-Sans, Ubuntu, Cantarell; Helvetica, sans-serif, Apple Color, &quot;Segoe UI Segoe UI, sans-serif;    
                  font-size: 13px;     
                  font-weight: 500;
                  flex: 1 1 0%;
                  line-height: 15px;    
                  margin: 0px;
                  padding: 0px 0px 0px 8px;
                `;
                titleDiv.textContent = "NotionPack Capture";

                const closeIconParentDiv = document.createElement("div");
                closeIconParentDiv.style.cssText = `
                  display:flex; 
                  gap: 4px; 
                  align-items:center;
                  cursor: pointer;
                `;

                const closeIconDiv = document.createElement("div");
                closeIconDiv.style.cssText = `
                  all:unset; 
                  color: rgba(0, 0, 0, 0.5);
                  border-radius: 999px;
                  cursor: pointer;
                  padding: 6px;
                  margin-left:-2px; 
                  opacity:1;
                `;

                const closeSVG = document.createElementNS(
                  "http://www.w3.org/2000/svg",
                  "svg"
                );
                closeSVG.setAttribute("width", "16");
                closeSVG.setAttribute("height", "16");
                closeSVG.style.cssText = `
                  margin-top: 6px
                `;
                const path = document.createElementNS(
                  "http://www.w3.org/2000/svg",
                  "path"
                );
                path.setAttribute(
                  "d",
                  "M13.0539 4.55972C13.2434 4.37015 13.2432 4.05082 13.0461 3.85373L12.3456 3.15325C12.1401 2.94773 11.8325 2.95269 11.6396 3.14551L8.09968 6.68547L4.55972 3.14551C4.37015 2.95593 4.05082 2.95616 3.85373 3.15325L3.15325 3.85373C2.94773 4.05925 2.95269 4.36691 3.14551 4.55972L6.68547 8.09968L3.14551 11.6396C2.95593 11.8292 2.95616 12.1485 3.15325 12.3456L3.85373 13.0461C4.05925 13.2516 4.36691 13.2467 4.55972 13.0539L8.09968 9.5139L11.6396 13.0539C11.8292 13.2434 12.1485 13.2432 12.3456 13.0461L13.0461 12.3456C13.2516 12.1401 13.2467 11.8325 13.0539 11.6396L9.5139 8.09968L13.0539 4.55972Z"
                );
                path.setAttribute("fill", "black");
                closeSVG.appendChild(path);

                const iframeElement = document.createElement("iframe");
                iframeElement.id = "iframe-fnjckhboamnndabpdgknoofcbgfijfim";
                iframeElement.src = isAccessTokenAvailable
                  ? "chrome-extension://fnjckhboamnndabpdgknoofcbgfijfim/popup/popup.html"
                  : "chrome-extension://fnjckhboamnndabpdgknoofcbgfijfim/popup/authentication.html";

                iframeElement.sandbox =
                  "allow-scripts allow-same-origin allow-forms allow-popups";
                iframeElement.style.cssText = `
                  color: unset; 
                  font: unset; 
                  font-palette: unset; 
                  font-synthesis: unset; 
                  forced-color-adjust: unset; 
                  text-orientation: unset; 
                  text-rendering: unset; 
                  -webkit-font-smoothing: unset; 
                  -webkit-locale: unset; 
                  -webkit-text-orientation: unset; 
                  -webkit-writing-mode: unset; 
                  writing-mode: unset; 
                  zoom: unset; 
                  accent-color: unset; 
                  place-content: unset; 
                  place-items: unset; 
                  place-self: unset; 
                  alignment-baseline: unset; 
                  animation-composition: unset; 
                  animation: unset; 
                  app-region: unset; 
                  appearance: unset; 
                  aspect-ratio: unset; 
                  backdrop-filter: unset; 
                  backface-visibility: unset; 
                  background: rgb(239, 238, 245); 
                  background-blend-mode: unset; 
                  baseline-shift: unset; 
                  baseline-source: unset; 
                  block-size: unset; 
                  border-block: unset; 
                  border: 0px; 
                  border-radius: unset; 
                  border-collapse: unset; 
                  border-end-end-radius: unset; 
                  border-end-start-radius: unset; 
                  border-inline: unset; 
                  border-start-end-radius: unset; 
                  border-start-start-radius: unset; 
                  inset: unset; 
                  box-shadow: unset; 
                  box-sizing: unset; 
                  break-after: unset; 
                  break-before: unset; 
                  break-inside: unset; 
                  buffered-rendering: unset; 
                  caption-side: unset; 
                  caret-color: unset;
                   clear: unset;
                   clip: auto; clip-path: unset;
                   clip-rule: unset;
                   color-interpolation: unset;
                   color-interpolation-filters: unset;
                   color-rendering: unset;
                   color-scheme: none !important; columns: unset;
                   column-fill: unset;
                   gap: unset;
                   column-rule: unset;
                   column-span: unset;
                   contain: unset;
                   contain-intrinsic-block-size: unset;
                   contain-intrinsic-size: unset;
                   contain-intrinsic-inline-size: unset;
                   container: unset;
                   content: unset;
                   content-visibility: unset;
                   counter-increment: unset;
                   counter-reset: unset;
                   counter-set: unset;
                   cursor: unset;
                   cx: unset;
                   cy: unset;
                   d: unset;
                   display: block; dominant-baseline: unset;
                   empty-cells: unset;
                   fill: unset;
                   fill-opacity: unset;
                   fill-rule: unset;
                   filter: unset;
                   flex: unset;
                   flex-flow: unset;
                   float: unset;
                   flood-color: unset;
                   flood-opacity: unset;
                   grid: unset;
                   grid-area: unset;
                   height: 400px; 
                   hyphenate-character: unset;
                   hyphenate-limit-chars: unset;
                   hyphens: unset;
                   image-orientation: unset;
                   image-rendering: unset;
                   initial-letter: unset;
                   inline-size: unset;
                   inset-block: unset;
                   inset-inline: unset;
                   isolation: unset;
                   letter-spacing: unset;
                   lighting-color: unset;
                   line-break: unset;
                   list-style: unset;
                   margin-block: unset;
                   margin-bottom: unset;
                   margin-inline: unset;
                   margin-left: unset;
                   margin-right: unset;
                   margin-top: 40px; 
                   marker: unset;
                   mask: unset;
                   mask-type: unset;
                   math-depth: unset;
                   math-shift: unset;
                   math-style: unset;
                   max-block-size: unset;
                   max-height: unset;
                   max-inline-size: unset;
                   max-width: unset;
                   min-block-size: unset;
                   min-height: unset;
                   min-inline-size: unset;
                   min-width: unset;
                   mix-blend-mode: unset;
                   object-fit: unset;
                   object-position: unset;
                   object-view-box: unset;
                   offset: unset;
                   opacity: 1; order: unset;
                   orphans: unset;
                   outline: unset;
                   outline-offset: unset;
                   overflow-anchor: unset;
                   overflow-clip-margin: unset;
                   overflow-wrap: unset;
                   overflow: unset;
                   overlay: unset;
                   overscroll-behavior-block: unset;
                   overscroll-behavior-inline: unset;
                   overscroll-behavior: unset;
                   padding-block: unset;
                   padding: unset;
                   padding-inline: unset;
                   page: unset;
                   page-orientation: unset;
                   paint-order: unset;
                   perspective: unset;
                   perspective-origin: unset;
                   pointer-events: unset;
                   position: unset;
                   quotes: unset;
                   r: unset;
                   resize: unset;
                   rotate: unset;
                   ruby-position: unset;
                   rx: unset;
                   ry: unset;
                   scale: unset;
                   scroll-behavior: unset;
                   scroll-margin-block: unset;
                   scroll-margin: unset;
                   scroll-margin-inline: unset;
                   scroll-padding-block: unset;
                   scroll-padding: unset;
                   scroll-padding-inline: unset;
                   scroll-snap-align: unset;
                   scroll-snap-stop: unset;
                   scroll-snap-type: unset;
                   scroll-timeline: unset;
                   scrollbar-gutter: unset;
                   shape-image-threshold: unset;
                   shape-margin: unset;
                   shape-outside: unset;
                   shape-rendering: unset;
                   size: unset;
                   speak: unset;
                   stop-color: unset;
                   stop-opacity: unset;
                   stroke: unset;
                   stroke-dasharray: unset;
                   stroke-dashoffset: unset;
                   stroke-linecap: unset;
                   stroke-linejoin: unset;
                   stroke-miterlimit: unset;
                   stroke-opacity: unset;
                   stroke-width: unset;
                   tab-size: unset;
                   table-layout: unset;
                   text-align: unset;
                   text-align-last: unset;
                   text-anchor: unset;
                   text-combine-upright: unset;
                   text-decoration: unset;
                   text-decoration-skip-ink: unset;
                   text-emphasis: unset;
                   text-emphasis-position: unset;
                   text-indent: unset;
                   text-overflow: unset;
                   text-shadow: unset;
                   text-size-adjust: unset;
                   text-transform: unset;
                   text-underline-offset: unset;
                   text-underline-position: unset;
                   white-space: unset;
                   timeline-scope: unset;
                   touch-action: unset;
                   transform: unset;
                   transform-box: unset;
                   transform-origin: unset;
                   transform-style: unset;
                   transition: opacity 0.4s ease 0s; 
                   translate: unset;
                   user-select: unset;
                   vector-effect: unset;
                   vertical-align: unset;
                   view-timeline: unset;
                   view-timeline-inset: unset;
                   view-transition-name: unset;
                   visibility: unset;
                   border-spacing: unset;
                   -webkit-box-align: unset;
                   -webkit-box-decoration-break: unset;
                   -webkit-box-direction: unset;
                   -webkit-box-flex: unset;
                   -webkit-box-ordinal-group: unset;
                   -webkit-box-orient: unset;
                   -webkit-box-pack: unset;
                   -webkit-box-reflect: unset;
                   -webkit-line-break: unset;
                   -webkit-line-clamp: unset;
                   -webkit-mask-box-image: unset;
                   -webkit-mask: unset;
                   -webkit-mask-composite: unset;
                   -webkit-print-color-adjust: unset;
                   -webkit-rtl-ordering: unset;
                   -webkit-ruby-position: unset;
                   -webkit-tap-highlight-color: unset;
                   -webkit-text-combine: unset;
                   -webkit-text-decorations-in-effect: unset;
                   -webkit-text-fill-color: unset;
                   -webkit-text-security: unset;
                   -webkit-text-stroke: unset; closeIconDiv.appendChild(closeIcon);
                closeIconParentDiv.appendChild(closeIconDiv);
                   -webkit-user-drag: unset;
                   -webkit-user-modify: unset;
                   widows: unset;
                   width: 100%; will-change: unset;
                   word-break: unset;
                   word-spacing: unset;
                   x: unset;
                   y: unset;
                   z-index: unset;
                `;

                closeIconDiv.appendChild(closeSVG);
                closeIconParentDiv.appendChild(closeIconDiv);
                headerDiv.append(titleDiv, closeIconParentDiv);
                parentDiv.append(headerDiv, iframeElement);
                document.body.appendChild(parentDiv);

                closeIconParentDiv.addEventListener("click", () => {
                  document.body.removeChild(parentDiv);
                });
              } else {
                alert("Link not found for this tweet!");
              }
            });
          }
        }
      }
    }
  }
};

const observe = () => {
  mo.observe(document, {
    subtree: true,
    childList: true,
  });
};

const mo = new MutationObserver(onMutation);

observe();
