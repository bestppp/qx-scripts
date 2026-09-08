/**
 * 金典有机生活+ 签到
 * BoxJs：jindian_token（access-token）
 * 与安慕希、呆呆面板不要重复签。
 */
const TITLE = "金典签到";
const BASE = "https://msmarket.msx.digitalyili.com";
const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.0";
const token = $prefs.valueForKey("jindian_token") || "";
if (!token) {
  $notify(TITLE, "缺少 access-token", "进金典小程序后开 Rewrite 抓包");
  $done();
}

function headers() {
  return {
    "User-Agent": UA,
    Accept: "*/*",
    "Content-Type": "application/json",
    Referer: "https://servicewechat.com/wxf32616183fb4511e/616/page-frame.html",
    "access-token": token,
  };
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

function req(method, path) {
  const opts = { url: BASE + path, method: method, headers: headers() };
  if (method === "POST") opts.body = "{}";
  return $task.fetch(opts).then(parse);
}

function err(payload) {
  const e = payload && payload.error;
  if (e && typeof e === "object") return String(e.msg || e.message || e);
  return String((payload && (payload.error || payload.message || payload.msg)) || "");
}

function trySign() {
  return req("POST", "/gateway/api/member//daily/sign").then((last) => {
    if (last.status || /已签|签过|重复/.test(err(last))) return last;
    return req("POST", "/gateway/api/member/daily/sign");
  });
}

const logs = [];
req("GET", "/gateway/api/auth/account/user/info")
  .then((info) => {
    if (!info.status) throw new Error("token 失效：" + err(info));
    logs.push("昵称 " + ((info.data || {}).nickName || "?"));
    return req("GET", "/gateway/api/member/sign/status");
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
  .then(() => req("GET", "/gateway/api/member/point"))
  .then((point) => {
    if (point.status) logs.push("积分 " + point.data);
    $notify(TITLE, "完成", logs.join("\n"));
  })
  .catch((e) => $notify(TITLE, "失败", String(e.message || e)))
  .then(() => $done());
