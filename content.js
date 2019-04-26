/* global chrome */
"use strict";

function injectScript(scriptURLorName) {
  const s = document.createElement('script');
  s.src = chrome.runtime.getURL(scriptURLorName);
  s.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(s);
}

injectScript("lib/finally.js");
injectScript("lib/pool.js");
injectScript("lib/dry.js");
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
