/* global chrome */
"use strict";

function heartbeat(success, failure) {
  // Stacko's best bucko: https://stackoverflow.com/a/23895822/8774873
  chrome.runtime.sendMessage({heartbeat: true}, function() {
    if (chrome.runtime.lastError) {
      failure();
    }
    else {
      success();
    }
  });
}

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

const handleContext = function(e) {
  chrome.runtime.sendMessage(e.detail);
};

const handleRunner = function(msg) {
  heartbeat(
    function() { // hearbeat success
      const {contextType} = msg;
      if (contextType) {
        const event = new CustomEvent("contextRunner", {detail: {contextType}});
        document.dispatchEvent(event);
      }
    },
    function() { // hearbeat failure
      chrome.runtime.onMessage.removeListener(handleRunner);
      document.removeEventListener("updateContext", handleContext);
    }
  );
};
chrome.runtime.onMessage.addListener(handleRunner);
document.addEventListener('updateContext', handleContext);
