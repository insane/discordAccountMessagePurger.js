(() => {
  if (window.__MSG_WIPE__) return;
  window.__MSG_WIPE__ = true;

  const API = "https://discord.com/api/v9";
  const LIMIT = 25;
  const RL_SLEEP = 10000;

  let token;
  let userId;
  let running = false;
  let totalDeleted = 0;
  let skipped = [];
  let hooked = true;
  let offset = 0;
  let cursor = null;
  let deleteLock = Promise.resolve();

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const banner = t =>
    console.log(
      `%c${t}`,
      "padding:6px 10px;border-radius:6px;background:#5865F2;color:#fff;font-weight:700"
    );

  const okLog = t =>
    console.log(
      `%c✓ %c${t}`,
      "color:#43B581;font-weight:700",
      "color:#EDEDED"
    );

  const warnLog = t =>
    console.log(
      `%c⚠ %c${t}`,
      "color:#FAA61A;font-weight:700",
      "color:#EDEDED"
    );

  const infoLog = t =>
    console.log(
      `%cℹ %c${t}`,
      "color:#00AFF4;font-weight:700",
      "color:#EDEDED"
    );

  const statTable = obj => {
    console.log("%cProgress", "color:#B9BBBE;font-weight:700");
    console.table(obj);
  };

  async function api(method, url, body) {
    const r = await fetch(API + url, {
      method,
      headers: {
        Authorization: token,
        "Content-Type": "application/json"
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (r.status === 429) return { ratelimited: true };
    if (r.status === 404) return { ok: false };
    if (r.status === 204) return { ok: true };
    if (!r.ok) throw r.status;
    return { ok: true, data: await r.json() };
  }

  async function safeDelete(channelId, messageId) {
    try {
      const res = await api("DELETE", `/channels/${channelId}/messages/${messageId}`);
      if (res.ok) return true;
      if (res.ratelimited) {
        warnLog("Rate limited — sleeping 10s");
        await sleep(RL_SLEEP);
        try {
          const retry = await api("DELETE", `/channels/${channelId}/messages/${messageId}`);
          if (retry.ok) return true;
        } catch {}
      }
    } catch {}
    return false;
  }

  async function queueDelete(channelId, messageId) {
    deleteLock = deleteLock.then(() => safeDelete(channelId, messageId));
    return deleteLock;
  }

  async function getUserId() {
    const r = await fetch(API + "/users/@me", {
      headers: { Authorization: token }
    });
    return (await r.json()).id;
  }

  function snowflakeBefore(id) {
    return (BigInt(id) - 1n).toString();
  }

  async function driveSearch(body) {
    banner("Message cleanup running");
    while (running) {
      body.tabs.messages.limit = LIMIT;
      body.tabs.messages.offset = offset;
      body.cursor = cursor;

      const res = await api("POST", "/users/@me/messages/search/tabs", body);
      if (!res.ok || !res.data) break;

      const data = res.data;
      let messages = [];
      for (const bucket of data.tabs.messages.messages) {
        for (const msg of bucket) messages.push(msg);
      }

      let deleted = 0;
      let oldestId = null;

      for (const msg of messages) {
        if (!running) return;
        oldestId = msg.id;

        if (msg.author.id !== userId) {
          skipped.push(msg);
          continue;
        }
        if (msg.type === 3 || ![0,19,20,21,23].includes(msg.type)) {
          skipped.push(msg);
          continue;
        }

        const ok = await queueDelete(msg.channel_id, msg.id);
        if (ok) {
          totalDeleted++;
          deleted++;
          okLog(`Deleted messageId ${msg.id}`);
        } else {
          skipped.push(msg);
        }
      }

      statTable({
        messages_in_page: messages.length,
        deleted_this_page: deleted,
        total_deleted: totalDeleted,
        offset
      });

      if (messages.length < LIMIT) {
        if (!oldestId) break;
        cursor = { type: "message", message_id: snowflakeBefore(oldestId) };
        offset = 0;
      } else {
        offset += LIMIT;
      }
    }

    running = false;
    window.__MSG_WIPE_SKIPPED__ = skipped;
    banner(`Done — deleted ${totalDeleted}`);
  }

  async function captureOnce(_, rawBody) {
    if (running) return;
    running = true;
    hooked = false;

    if (!token) token = prompt("Paste your Discord token here:");
    if (!userId) userId = await getUserId();

    const body = JSON.parse(rawBody);
    offset = body.tabs.messages.offset || 0;
    cursor = null;

    infoLog("Search captured — starting cleanup..");
    await driveSearch(body);
  }

  const f = window.fetch;
  window.fetch = async (...args) => {
    const res = await f(...args);
    try {
      if (!hooked) return res;
      const url = args[0]?.url || args[0];
      if (typeof url === "string" && url.includes("/users/@me/messages/search/tabs")) {
        captureOnce(null, args[1]?.body);
      }
    } catch {}
    return res;
  };

  const o = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (m, u, ...r) {
    this.__u = u;
    return o.call(this, m, u, ...r);
  };

  const s = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function (b) {
    this.addEventListener("load", () => {
      try {
        if (!hooked) return;
        if (this.__u && this.__u.includes("/users/@me/messages/search/tabs")) {
          captureOnce(null, b);
        }
      } catch {}
    });
    return s.call(this, b);
  };

  banner("Waiting for you to search a message from yourself..");
})();
