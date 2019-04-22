/* global chrome */
(function() {
  "use strict";

  function injectScript(scriptURLorName) {
    const s = document.createElement('script');
    s.src = chrome.runtime.getURL(scriptURLorName);
    (document.head || document.documentElement).appendChild(s);
  }

  injectScript("finally.js");
  injectScript("pool.js");
  injectScript("dry.js");
  injectScript("ownerdelete.js");

  document.addEventListener('updateContext', function (e) {
    chrome.runtime.sendMessage(e.detail);
  });
  chrome.runtime.onMessage.addListener(msg => {
    const {contextType} = msg;
    if (contextType) {
      const event = new CustomEvent("contextRunner", {detail: {contextType}});
      document.dispatchEvent(event);
    }
  });
})();
