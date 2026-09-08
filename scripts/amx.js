/**
 * 安慕希签到
 * BoxJs：amx_token（access-token，与金典不是同一个）
 */
const TITLE = "安慕希签到";
const BASE = "https://msmarket.msx.digitalyili.com/gateway";
const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.0";
const token = $prefs.valueForKey("amx_token") || "";
if (!token) {
  $notify(TITLE, "缺少 access-token", "进安慕希小程序后开 Rewrite 抓包");
  $done();
}

function headers(json) {
  const h = {
    "User-Agent": UA,
    Accept: "*/*",
    Referer: "https://servicewechat.com/wxf2a6206f7e2fd712/780/page-frame.html",
    Origin: "https://msmarket.msx.digitalyili.com",
    "access-token": token,
    xweb_xhr: "1",
    scene: "1145",
    oms: "old",
    "forward-appid": "wxf2a6206f7e2fd712",
  };
  if (json) h["Content-Type"] = "application/json";
  return h;
}

function parse(resp) {
  const text = String(resp.body || "");
  if (resp.statusCode === 403 && /html|WAF/i.test(text)) {
    return { status: false, error: "WAF 拦截" };
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    return { status: false, error: "HTTP " + resp.statusCode };
  }
}

function req(method, path, sendJson) {
  const opts = { url: BASE + path, method: method, headers: headers(!!sendJson) };
  if (sendJson) opts.body = "{}";
  return $task.fetch(opts).then(parse);
}

function err(payload) {
  const e = payload && payload.error;
  if (e && typeof e === "object") return String(e.msg || e.message || e);
  return String((payload && (payload.error || payload.message || payload.msg)) || "");
}

function trySign() {
  return req("POST", "/api/member//daily/sign", true).then((last) => {
    if (last.status || /已签|签过|重复/.test(err(last))) return last;
    return req("POST", "/api/member/daily/sign", true).then((std) => {
      if (std.status || /已签|签过|重复/.test(err(std))) return std;
      return req("GET", "/api/member/daily/sign", false);
    });
  });
}

const logs = [];
req("GET", "/api/auth/account/user/info", false)
  .then((info) => {
    if (!info.status) throw new Error("token 失效：" + err(info));
    logs.push("昵称 " + ((info.data || {}).nickName || "?"));
    return req("GET", "/api/member/sign/status", false);
  })
  .then((st) => {
    if (!st.status) throw new Error("查签到失败：" + err(st));
    if ((st.data || {}).signed) {
      logs.push("今日已签到");
      return null;
    }
    return trySign().then((signRes) => {
      if (signRes.status) {
        const bonus = ((signRes.data || {}).dailySign || {}).bonusPoint;
        logs.push("签到成功，积分+" + (bonus != null ? bonus : "?"));
      } else if (/已签|签过|重复/.test(err(signRes))) {
        logs.push("今日已签");
      } else {
        throw new Error("签到失败：" + err(signRes));
      }
    });
  })
  .then(() => req("GET", "/api/member/point", false))
  .then((point) => {
    if (point.status) logs.push("积分 " + point.data);
    $notify(TITLE, "完成", logs.join("\n"));
  })
  .catch((e) => $notify(TITLE, "失败", String(e.message || e)))
  .then(() => $done());
