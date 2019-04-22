/* global chrome */
(function() {
  "use strict";
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      "title": "Select All Files From User",
      "id": "selectByUser",
      "type": "normal",
      "contexts": ["link"]
    });
    chrome.contextMenus.create({
      "title": "Select All",
      "id": "selectAll",
      "type": "normal",
      "contexts": ["link", "page"]
    });
    chrome.contextMenus.create({
      "title": "Select None",
      "id": "selectNone",
      "type": "normal",
      "contexts": ["link", "page"]
    });
    chrome.contextMenus.create({
      "title": "Invert Selection",
      "id": "invertSelection",
      "type": "normal",
      "contexts": ["link", "page"]
    });
    chrome.contextMenus.create({
      "title": "Select Duplicate Files",
      "id": "selectDupes",
      "type": "normal",
      "contexts": ["link", "page"]
    });
    chrome.contextMenus.create({
      "title": "Select All Whitename Files",
      "id": "selectWhitename",
      "type": "normal",
      "contexts": ["link", "page"]
    });
    chrome.contextMenus.create({
      "title": "Select All Files For IP",
      "id": "selectByIP",
      "type": "normal",
      "contexts": ["link"],
      "visible": false
    });
  });

  chrome.contextMenus.onClicked.addListener(info => {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, {contextType: info.menuItemId});
    });
    chrome.contextMenus.update("selectByIP", {visible: false});
  });

  chrome.runtime.onMessage.addListener(message => {
    const opts = {};
    if (message.contextType === "selectByUser") {
      opts.title = `Select All Files From ${message.data}`;
    }
    else {
      opts.title = `Select All Files For '${message.data}'`;
      opts.visible = true;
    }
    chrome.contextMenus.update(message.contextType, opts);
  });
})();
