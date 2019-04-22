/* global chrome */
(function() {
  "use strict";


  function injectScript(scriptURLorName) {
    const s = document.createElement('script');
    s.src = chrome.runtime.getURL(scriptURLorName);
    (document.head || document.documentElement).appendChild(s);
  }


  //injectScript("https://cdn.jsdelivr.net/gh/volafiled/node-parrot@acb622d5d9af34f0de648385e6ab4d2411373037/parrot/finally.min.js", true);
  //injectScript("https://cdn.jsdelivr.net/gh/volafiled/node-parrot@acb622d5d9af34f0de648385e6ab4d2411373037/parrot/pool.min.js", true);
  //injectScript("https://cdn.jsdelivr.net/gh/volafiled/volascripts@a9c0424e5498deea9fd437c15b2137c3bec07c61/dry.min.js", true);
    //"https://cdn.jsdelivr.net/gh/volafiled/node-parrot@acb622d5d9af34f0de648385e6ab4d2411373037/parrot/finally.min.js",
    //"https://cdn.jsdelivr.net/gh/volafiled/node-parrot@acb622d5d9af34f0de648385e6ab4d2411373037/parrot/pool.min.js",
    //"https://cdn.jsdelivr.net/gh/volafiled/volascripts@a9c0424e5498deea9fd437c15b2137c3bec07c61/dry.min.js",
  injectScript("finally.js");
  injectScript("pool.js");
  injectScript("dry.js");
  injectScript("ownerdelete.js");
  //const $ = document.querySelector.bind(document);
  //console.log($("#name_container"));
  document.addEventListener('updateContext', function (e) {
    chrome.runtime.sendMessage(e.detail);
  });
  chrome.runtime.onMessage.addListener(msg => {
    console.log(`send event from bg: ${msg}`);
    const {contextType} = msg;
    if (contextType) {
      const event = new CustomEvent("contextRunner", {detail: {contextType}});
      document.dispatchEvent(event);
    }
  });
  //setTimeout(() => {
    //const evt = document.createEvent("CustomEvent");
    //evt.initCustomEvent("getFilelist", true, true);
    //document.dispatchEvent(evt);
  //}, 2000);
  //window.addEventListener('message', function (e) {
    //if (e.source !== window) {
      //return;
    //}
    //const filelist = e.data;
    //console.log(filelist);
  //}, false);
  //setTimeout(() => {
    //window.postMessage("hi there");
  //}, 3000);

})();
