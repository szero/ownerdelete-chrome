/* global chrome */
"use strict";

const documentURLs = ["https://volafile.org/r/*", "https://volafile.io/r/*"];
const targetURLs = ["https://volafile.org/get/*", "https://volafile.io/get/*"];
let areCreated = false;
const createContexts = function() {
  if (!areCreated) {
    chrome.contextMenus.create({
      "title": "Select All Files From User",
      "id": "selectByUser",
      "type": "normal",
      "contexts": ["link"],
      "visible": true,
      "documentUrlPatterns": documentURLs,
      "targetUrlPatterns": targetURLs
    });
    chrome.contextMenus.create({
      "title": "Select All",
      "id": "selectAll",
      "type": "normal",
      "contexts": ["link", "page"],
      "visible": true,
      "documentUrlPatterns": documentURLs,
      "targetUrlPatterns": targetURLs
    });
    chrome.contextMenus.create({
      "title": "Select None",
      "id": "selectNone",
      "type": "normal",
      "contexts": ["link", "page"],
      "visible": true,
      "documentUrlPatterns": documentURLs,
      "targetUrlPatterns": targetURLs
    });
    chrome.contextMenus.create({
      "title": "Invert Selection",
      "id": "invertSelection",
      "type": "normal",
      "contexts": ["link", "page"],
      "visible": true,
      "documentUrlPatterns": documentURLs,
      "targetUrlPatterns": targetURLs
    });
    chrome.contextMenus.create({
      "title": "Select Duplicate Files",
      "id": "selectDupes",
      "type": "normal",
      "contexts": ["link", "page"],
      "visible": true,
      "documentUrlPatterns": documentURLs,
      "targetUrlPatterns": targetURLs
    });
    chrome.contextMenus.create({
      "title": "Select All Whitename Files",
      "id": "selectWhitename",
      "type": "normal",
      "contexts": ["link", "page"],
      "visible": true,
      "documentUrlPatterns": documentURLs,
      "targetUrlPatterns": targetURLs
    });
    chrome.contextMenus.create({
      "title": "Select All Files For IP",
      "id": "selectByIP",
      "type": "normal",
      "contexts": ["link"],
      "visible": false,
      "documentUrlPatterns": documentURLs,
      "targetUrlPatterns": targetURLs
    });
    areCreated = true;
  }
};

chrome.contextMenus.onClicked.addListener(info => {
  chrome.tabs.query({active: true, currentWindow: true, url: documentURLs}, tabs => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {contextType: info.menuItemId});
    }
  });
  //chrome.contextMenus.update("selectByIP", {visible: false});
});
const addonTabs = new Set();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.heartbeat) {
    sendResponse(message);
    return;
  }
  const {contextType, isOwner} = message;
  if (areCreated && typeof contextType !== "undefined" && isOwner) {
    const opts = {};
    switch (contextType) {
    case "selectByUser":
      opts.title = `Select All Files From ${message.data}`;
      break;
    case "selectByIP":
      if (message.data) {
        opts.title = `Select All Files For '${message.data}'`;
      }
      opts.visible = true;
      break;
    default:
      return;
    }
    chrome.contextMenus.update(contextType, opts);
    return;
  }
  const {setTab} = message;
  if (typeof setTab !== "undefined") {
    if (setTab) {
      addonTabs.add(sender.url);
      createContexts();
    }
    else {
      addonTabs.delete(sender.url);
      chrome.contextMenus.removeAll();
      areCreated = false;
    }
  }
});
chrome.tabs.onActivated.addListener(() => {
  chrome.tabs.query({active: true, currentWindow: true, url: documentURLs}, tabs => {
    if (tabs[0]) {
      if (addonTabs.has(tabs[0].url)) {
        createContexts();
      }
      else {
        chrome.contextMenus.removeAll();
        areCreated = false;
      }
    }
  });
});
