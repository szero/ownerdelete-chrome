/* global chrome */
"use strict";

//chrome.runtime.onInstalled.addListener(() => {
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
//});
//chrome.runtime.onInstalled.addListener(() => {
  //createContexts();
//});
const contextIDs = [
  "selectByUser", "selectAll", "selectNone", "invertSelection",
  "selectDupes", "selectWhitename", "selectByIP"
];

const updateAllContexts = function(opts, filterCtx) {
  let items = contextIDs;
  if (filterCtx) {
    items = contextIDs.filter(filterCtx);
  }
  for (const id of items) {
    chrome.contextMenus.update(id, opts);
  }
};
chrome.contextMenus.onClicked.addListener(info => {
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, {contextType: info.menuItemId});
  });
  //chrome.contextMenus.update("selectByIP", {visible: false});
});
const addonTabs = new Set();
chrome.runtime.onMessage.addListener(message => {
  const opts = {};
  console.log(message);
  const {contextType, isOwner} = message;
  if (typeof contextType !== "undefined" && isOwner) {
    //createContexts();
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
  }
  const {setTab} = message;
  if (typeof setTab !== "undefined") {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      if (setTab) {
        addonTabs.add(tabs[0].id);
        createContexts();
      }
      else {
        addonTabs.delete(tabs[0].id);
        chrome.contextMenus.removeAll();
        areCreated = false;
      }
      //if (areCreated) {
        //updateAllContexts({visible: setTab}, e => e !== "selectByIP");
      //}
    });
  }
});
chrome.tabs.onActivated.addListener(tabInfo => {
  //updateAllContexts({visible: addonTabs.has(tabInfo.tabId)});
  if (addonTabs.has(tabInfo.tabId)) {
    createContexts();
  }
  else {
    chrome.contextMenus.removeAll();
    areCreated = false;
  }

});
