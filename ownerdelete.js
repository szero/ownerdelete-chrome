/* globals dry, PromisePool */
/* eslint strict: "warn" */
/* eslint indent: "off" */
(function() {
"use strict";

const waitForDry = async function(retry) {
  while (retry--) {
    try {
      return dry;
    }
    catch (e) {
      await new Promise(r => setTimeout(r, 100));
    }
  }
  throw new Error("OwnerDelete didn't load properly, click OK to refresh");
};


waitForDry(30).then(dry => {
function selected() {
  return Array.from(
    dry.exts.filelistManager.filelist.filelist.
      filter(e => e.getData("checked")).
      map(e => e.id)
  );
}

function $e(tag, attrs, text) {
  const rv = document.createElement(tag);
  attrs = attrs || {};
  for (const a in attrs) {
    rv.setAttribute(a, attrs[a]);
  }
  if (text) {
    rv.textContent = text;
  }
  return rv;
}

function debounce(fn, to) {
  if (fn.length) {
    throw new Error("cannot have params");
  }
  to = to || 100;
  let timer;

  const run = function() {
    timer = 0;
  };

  return function() {
    if (timer) {
      return;
    }
    fn.call(this);
    timer = setTimeout(run.bind(this), to);
  };
}

function timeout(delay) {
  return new Promise((_, rej) => {
    setTimeout(() => {
      rej(new Error(`Timeout of ${delay} milliseconds got reached.`));
    }, delay);
  });
}

class ContextManager {
  constructor(pool) {
    this.pool = pool;
    this._user = null;
    this._ip = null;
  }

  get user() {
    return this._user;
  }

  set user(user) {
    this._user = user;
  }

  get ip() {
    return this._ip;
  }

  set ip(ip) {
    this._ip = ip;
  }

  processFromEvent(event) {
    const e = `handle_${event}`;
    const {[e]: fn = null} = this;
    if (fn) {
      fn.call(this);
    }
  }

  handle_selectByUser() {
    dry.exts.filelistManager.filelist.filelist.forEach(
      e => e.setData("checked",
        (e.tags.user || e.tags.nick).toLowerCase() === this.user));
  }

  handle_selectAll() {
    dry.exts.filelistManager.filelist.filelist.forEach(
      e => e.setData("checked", true));
  }

  handle_selectNone() {
    dry.exts.filelistManager.filelist.filelist.forEach(
      e => e.setData("checked", false));
  }

  handle_invertSelection() {
    dry.exts.filelistManager.filelist.filelist.forEach(e => {
      e.setData("checked", !e.getData("checked"));
    });
  }

  handle_selectDupes() {
    if (this.pool.total > 0) {
      dry.unsafeWindow.alert("Data to perform this operation is not ready yet! Try again soon.");
      return;
    }
    const known = new Set();
    dry.exts.filelistManager.filelist.filelist.forEach(e => {
      const k = e.checksum;
      if (!k) {
      // just skip the iteration if checkusm isn't present
        return;
      }
      if (known.has(k)) {
        e.setData("checked", true);
        console.log(`marked ${e.name} from ${e.tags.user || e.tags.nick} for doom`);
      }
      else {
        known.add(k);
        e.setData("checked", false);
      }
    });
  }

  handle_selectWhitename() {
    dry.exts.filelistManager.filelist.filelist.forEach(e => {
      e.setData("checked", !!e.tags.nick);
    });
  }

  handle_selectByIP() {
    dry.exts.filelistManager.filelist.filelist.forEach(e => {
      e.setData("checked", e.tags.ip === this.ip);
    });
  }
}

const $ = document.querySelector.bind(document);
let isOwner = false;

const loadRekts = () => {
  let rv = localStorage.getItem("rekted");
  rv = JSON.parse(rv || "[]");
  try {
    return new Set(rv || []);
  }
  catch (ex) {
    return new Set();
  }
};

const rekt = loadRekts();
const whitePurge = "-purgewhiteys-";

const saveRekts = () => {
  localStorage.setItem("rekted", JSON.stringify(Array.from(rekt.values())));
};
dry.once("dom", () => {
  new class extends dry.MessageFilter {
    showMessage(fn, nick, msgObj, options, data) {
      try {
        if (!isOwner || !data || !data.id) {
          return;
        }
        nick = nick.toLowerCase().trim();
        if (options.user && rekt.has(`@${nick}`)) {
          dry.exts.connection.call("timeoutChat", data.id, 3600 * 24);
          return;
        }
        if (!options.user && (rekt.has(whitePurge) || rekt.has(nick))) {
          dry.exts.connection.call("timeoutChat", data.id, 3600 * 24);
          return;
        }
      }
      catch (ex) {
        console.error(ex);
      }
    }
  }();

  new class extends dry.Commands {
    rekt(user) {
      if (!isOwner) {
        return true;
      }
      user = user.toLowerCase().trim();
      if (rekt.has(user)) {
        dry.appendMessage("Rekt", `${user} is already rekt!`);
        return true;
      }
      if (user !== "") {
        dry.appendMessage("Rekt", `${user} got rekt`);
        rekt.add(user);
        saveRekts();
      }
      else {
        dry.appendMessage("Error", "Can't rekt an empty string");
      }
      return true;
    }

    unrekt(user) {
      if (!isOwner) {
        return true;
      }
      user = user.toLowerCase().trim();
      if (!rekt.has(user)) {
        dry.appendMessage("Unrekt", `${user} is not on rektlist!`);
        return true;
      }
      if (user !== "") {
        dry.appendMessage("Unrekt", `${user} got unrekt`);
        rekt.delete(user);
        saveRekts();
      }
      else {
        dry.appendMessage("Error", "Can't unrekt an empty string");
      }
      return true;
    }

    showrekts() {
      if (!isOwner) {
        return true;
      }
      if (!rekt.size) {
        dry.appendMessage("Showrekts", "Rektlist is empty!");
        return true;
      }
      dry.unsafeWindow.alert(
        `Rekt boys:\n${Array.from(rekt.values()).filter(el => el !== whitePurge)}`
      );
      return true;
    }

    killwhites() {
      if (!isOwner) {
        return;
      }
      if (rekt.has(whitePurge)) {
        dry.appendMessage("Purgatory", "Whiteposting is allowed now");
        rekt.delete(whitePurge);
      }
      else {
        dry.appendMessage("Purgatory", "All white posters will be timed out");
        rekt.add(whitePurge);
      }
      saveRekts();
    }
  }();
});

dry.once("load", () => {
  let last_file = null;
  let btnel = null;
  const ownerFiles = new WeakMap();
  const pool = new PromisePool(6);
  const ctxMgr = new ContextManager(pool);

  const checksums = (function() {
    const rv = dry.unsafeWindow.sessionStorage.getItem("ownerChecksums");
    try {
      return new Map(rv && JSON.parse(rv));
    }
    catch (e) {
      return new Map();
    }
  }());
  const save_checksums = debounce(function() {
    dry.unsafeWindow.sessionStorage.setItem("ownerChecksums", JSON.stringify(Array.from(checksums)));
  }, 1000);
  const update_name = function(e) {
    const file = getFileFromEvent(e);
    if (!file) {
      return;
    }
    const user = file.tags.user || file.tags.nick;
    if (!user) {
      return;
    }
    const event = new CustomEvent("updateContext", {detail: {contextType: "selectByUser", data: user, isOwner}});
    document.dispatchEvent(event);
    ctxMgr.user = user.toLowerCase();
  };
  const update_ip = function(e) {
    const file = getFileFromEvent(e);
    if (!file) {
      return;
    }
    const ip = file.tags.ip || null;
    if (!ip) {
      return;
    }
    const event = new CustomEvent("updateContext", {detail: {contextType: "selectByIP", data: ip, isOwner}});
    document.dispatchEvent(event);
    ctxMgr.ip = ip;

  };
  const find_file = function(file) {
    const {id} = file;
    const fl = dry.exts.filelistManager.filelist.filelist;
    for (let i = 0; i < fl.length; ++i) {
      if (fl[i].id === id) {
        return { idx: i, item: fl[i] };
      }
    }
    return null;
  };
  const getFileFromEvent = function(e) {
    let file; let fileElement = e.target;
    while (!file) {
      if (!fileElement) {
        return null;
      }
      file = ownerFiles.get(fileElement);
      fileElement = fileElement.parentElement;
    }
    return file;
  };
  async function getInfo(file) {
    try {
      const info = await Promise.race([dry.exts.info.getFileInfo(file.id), timeout(5000)]);
      if (!info) {
        file.checksum = false;
        return;
      }
      const {checksum} = info;
      checksums.set(file.id, checksum);
      file.checksum = checksum;
      save_checksums();
    }
    catch (e) {
      console.error(e);
      file.checksum = false;
    }
  }
  const file_click = function(e) {
    if (!e.target.classList.contains("filetype")) {
      return undefined;
    }
    const file = getFileFromEvent(e);
    if (!file) {
      return undefined;
    }
    e.stopPropagation();
    e.preventDefault();
    if (!e.shiftKey) {
      file.setData("checked", !file.getData("checked"));
      last_file = file;
      return false;
    }
    if (!last_file) {
      return false;
    }
    let lf = find_file(last_file); let cf = find_file(file);
    if (!lf || !cf) {
      return false;
    }
    [lf, cf] = [lf.idx, cf.idx];
    if (cf > lf) {
      [lf, cf] = [cf, lf];
    }
    const files = dry.exts.filelistManager.filelist.filelist.slice(cf, lf).
      filter(file => file.visible);
    const checked = file.getData("checked");
    files.forEach(el => {
      el.setData("checked", !checked);
    });
    file.setData("checked", !checked);
    last_file.setData("checked", !checked);
    return false;
  };
  const prepare_file = function(file) {
    try {
      if (!file.id) {
        return;
      }
      if (file.tags) {
        let subject = (file.tags.user || file.tags.nick).toLowerCase().trim();
        if (rekt.has(subject)) {
          dry.exts.connection.call("timeoutFile", file.id, 3600 * 24);
          dry.exts.connection.call("deleteFiles", [file.id]);
        }
        if (rekt.has(`@${subject}`)) {
          dry.exts.connection.call("timeoutFile", file.id, 3600 * 24);
          dry.exts.connection.call("deleteFiles", [file.id]);
        }
      }
      const fe = file.dom.fileElement;
      if (ownerFiles.has(fe)) {
        return;
      }
      const tags = Object.assign(file.tags, file.tags.nick ?
        {white: true} :
        {green: true});
      file.dom.setTags(tags);
      if (!file.checksum) {
        if (checksums.has(file.id)) {
          file.checksum = checksums.get(file.id);
        }
        else {
          pool.schedule(getInfo, file);
        }
      }
      fe.addEventListener("click", file_click, true);
      fe.addEventListener("mousedown", update_name, true);
      //if (dry.exts.user.info.admin) {
        fe.addEventListener("mousedown", update_ip, true);
      //}
      ownerFiles.set(fe, file);
    }
    catch (ex) {
      console.error(ex);
    }
  };

  const createButtons = function(isOwnerOrAdminOrJanitor, isAdmin) {
    let event = null;
    if (isOwnerOrAdminOrJanitor) {
      isOwner = true;
      if (btnel) {
        btnel.style.display = "inline";
      }
      event = new CustomEvent("updateContext", {detail: {setTab: true}});
      document.dispatchEvent(event);
    }
    else {
      isOwner = false;
      if (btnel) {
        btnel.style.display = "none";
      }
      event = new CustomEvent("updateContext", {detail: {setTab: false}});
      document.dispatchEvent(event);
    }
    if (isAdmin) {
      event = new CustomEvent("updateContext", {detail: {contextType: "selectByIP", isOwner}});
      document.dispatchEvent(event);
    }
    if (btnel || !isOwnerOrAdminOrJanitor) {
      return;
    }

    document.addEventListener("contextRunner", e => {
      const {contextType} = e.detail;
      if (contextType) {
        ctxMgr.processFromEvent(contextType);
      }
    });

    const cont = $("#upload_container");
    btnel = $e("label", {
      for: "dolos_delete_input",
      id: "dolos_deleteButton",
      class: "button",
      style: "margin-right: 0.5em",
    });
    btnel.appendChild($e("span", {
      class: "icon-trash"
    }));
    btnel.appendChild($e("span", {
      class: "on_small_header"
    }, "Delete"));
    cont.insertBefore(btnel, cont.firstChild);
    btnel.addEventListener("click", function() {
      const ids = selected();
      dry.exts.connection.call("deleteFiles", ids);
    });

    dry.exts.filelistManager.on("fileAdded", prepare_file);
    dry.exts.filelistManager.on("fileUpdated", prepare_file);
    dry.exts.filelistManager.on("fileRemoved", file => {
      checksums.delete(file.id);
    });
    dry.exts.filelistManager.on("nail_init", file => {
      const te = file.dom.vnThumbElement;
      if (!te) {
        console.warn("got a nail, but no nail");
        return;
      }
      te.addEventListener("mousedown", update_name);
      //if (dry.exts.user.info.admin) {
        te.addEventListener("mousedown", update_ip);
      //}
      ownerFiles.set(te, file);
    });
    dry.exts.filelistManager.filelist.filelist.forEach(prepare_file);
  };
  const cb = arg => createButtons(arg, true);
  dry.exts.user.on("info_owner", createButtons);
  dry.exts.user.on("info_admin", cb);
  dry.exts.user.on("info_janitor", createButtons);
});
}).catch(err => {
  window.alert(err.message);
  window.location.reload();
});
})();
