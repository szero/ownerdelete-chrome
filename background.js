/* global chrome */
"use strict";

const setContextCreation = function(value) {
  return new Promise(res => {
    chrome.storage.local.set({"isCreated": value}, () => {
      console.log('Value is set to ' + value);
      res(value);
    });
  });
};
const getContextCreation = function() {
  return new Promise(res => {
    chrome.storage.local.get(['isCreated'], function(result) {
      console.log('Value currently is ' + result.isCreated);
      res(result.isCreated);
    });
  });
};
const forceContextUpdate = function(ctxType, opts, retries) {
  // this is naughty
  chrome.contextMenus.update(ctxType, opts, () => {
    if (retries && chrome.runtime.lastError) {
      forceContextUpdate(ctxType, opts, retries - 1);
    }
  });
};
const documentURLs = ["https://volafile.org/r/*", "https://volafile.io/r/*"];
const targetURLs = ["https://volafile.org/get/*", "https://volafile.io/get/*"];

class Handler {
  handleFromInjected(message) {
    const props = Object.keys(message);
    for (const prop of props) {
      const {[`handle_${prop}`]: fn = null} = this;
      if (fn) {
        fn.call(this, message[prop], message.data);
        return;
      }
    }
  }

  async handle_ownerCheck(isOwner) {
    if (isOwner) {
      await createContexts();
    }
  }

  async handle_contextType(type, data) {
    if (!await getContextCreation()) {
      return;
    }
    const opts = {};
    switch (type) {
    case "selectByUser":
      opts.title = `Select All Files From ${data}`;
      break;
    case "selectByIP":
      opts.title = `Select All Files For '${data}'`;
      opts.visible = true;
      break;
    default:
      return;
    }
    forceContextUpdate(type, opts, 10);
  }

  async handle_setTab(isSet) {
    if (isSet) {
      await createContexts();
    }
    else {
      chrome.contextMenus.removeAll();
      await setContextCreation(false);
    }
  }

}
const createContexts = async function() {
  if (!await getContextCreation()) {
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
    await setContextCreation(true);
  }
};


const bg = function() {

  const handler = new Handler();

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.heartbeat) {
      sendResponse(message);
      return;
    }
    handler.handleFromInjected(message);
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (tab) {
      chrome.tabs.sendMessage(tab.id, {data: info.menuItemId});
    }
  });

  chrome.tabs.onActivated.addListener(() => {
    chrome.tabs.query({active: true, currentWindow: true, url: documentURLs}, async tabs => {
      if (tabs[0]) {
        chrome.contextMenus.removeAll();
        await setContextCreation(false);
        chrome.tabs.sendMessage(tabs[0].id, {data: "queryOwner"});
      }
    });
  });
};
chrome.runtime.onStartup.addListener(bg);
bg();
