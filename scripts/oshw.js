/**
 * 立创开源 oshwhub 签到
 * BoxJs：$prefs oshw_cookie（需含 oshwhub_session）
 */
const TITLE = "立创开源";
const BASE = "https://oshwhub.com";
const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148";

let cookie = $prefs.valueForKey("oshw_cookie") || "";
if (!cookie || cookie.indexOf("oshwhub_session=") === -1) {
  $notify(TITLE, "缺少 Cookie", "请抓含 oshwhub_session 的整段 Cookie");
  $done();
}

function cookieVal(raw, key) {
  const m = String(raw).match(new RegExp("(?:^|;\\s*)" + key + "=([^;]+)"));
  return m ? m[1] : "";
}

function headers() {
  const csrf = cookieVal(cookie, "oshwhub_csrf") || cookieVal(cookie, "XSRF-TOKEN");
  const h = {
    "User-Agent": UA,
    Accept: "application/json, text/plain, */*",
    Origin: BASE,
    Referer: BASE + "/sign_in",
    Cookie: cookie,
    "Content-Type": "application/json;charset=UTF-8",
  };
  if (csrf) {
    h["x-csrf-token"] = csrf;
    h["csrf-token"] = csrf;
    h["x-xsrf-token"] = csrf;
  }
  return h;
}

function mergeSetCookie(setCookie) {
  if (!setCookie) return;
  const parts = Array.isArray(setCookie) ? setCookie : String(setCookie).split(/,(?=\s*[^;=]+=)/);
  const map = {};
  String(cookie)
    .split(";")
    .forEach((p) => {
      const i = p.indexOf("=");
      if (i > 0) map[p.slice(0, i).trim()] = p.slice(i + 1).trim();
    });
  parts.forEach((item) => {
    const nv = String(item).split(";")[0];
    const i = nv.indexOf("=");
    if (i > 0) map[nv.slice(0, i).trim()] = nv.slice(i + 1).trim();
  });
  cookie = Object.keys(map)
    .map((k) => k + "=" + map[k])
    .join("; ");
  $prefs.setValueForKey(cookie, "oshw_cookie");
}

function req(method, path, body) {
  const opts = { url: BASE + path, method: method, headers: headers() };
  if (body !== undefined) opts.body = JSON.stringify(body);
  return $task.fetch(opts).then((resp) => {
    const sc = resp.headers && (resp.headers["Set-Cookie"] || resp.headers["set-cookie"]);
    mergeSetCookie(sc);
    try {
      return JSON.parse(resp.body);
    } catch (e) {
      return { success: resp.statusCode < 400, message: "HTTP " + resp.statusCode };
    }
  });
}

function apiMsg(payload) {
  if (!payload || typeof payload !== "object") return String(payload);
  const err = payload.message || payload.msg || payload.error;
  if (err && typeof err === "object") return String(err.msg || err.message || err);
  return String(err || "");
}

req("GET", "/api/users")
  .then((info) => {
    if (!info.success) throw new Error("登录失败：" + apiMsg(info));
    const nick = (info.result || {}).nickname || "?";
    return req("POST", "/api/users/signIn", { _t: Date.now() }).then((signRes) => {
      let line = "";
      if (signRes.success) line = "签到成功";
      else {
        const err = apiMsg(signRes);
        if (/已签|签过|重复|already/i.test(err)) line = "今日已签：" + err;
        else throw new Error("签到失败：" + err);
      }
      return req("GET", "/api/users").then((after) => {
        $notify(TITLE, nick, line);
      });
    });
  })
  .catch((err) => $notify(TITLE, "失败", String(err.message || err)))
  .then(() => $done());
