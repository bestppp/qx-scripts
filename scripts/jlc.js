/**
 * 嘉立创金豆签到
 * BoxJs：$prefs jlc_token / jlc_secret
 * 与面板脚本不要同一天重复签。抓完不要退出登录。
 */
const TITLE = "嘉立创金豆";
const BASE = "https://m.jlc.com";
const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148";

const token = $prefs.valueForKey("jlc_token") || "";
const secret = $prefs.valueForKey("jlc_secret") || "";

if (!token || !secret) {
  $notify(TITLE, "缺少凭据", "先开 Rewrite 抓包，或在 BoxJs 填 token/secret");
  $done();
}

let headers = {
  "User-Agent": UA,
  Accept: "application/json, text/plain, */*",
  Origin: BASE,
  Referer: "https://m.jlc.com/mapp/pages/my/index",
  "x-jlc-clienttype": "WEB",
  "x-jlc-accesstoken": token,
  secretkey: secret,
};

function absorb(resp) {
  const h = resp.headers || {};
  for (const key of Object.keys(h)) {
    const lk = key.toLowerCase();
    const val = String(h[key] || "");
    if (!val) continue;
    if (lk === "x-jlc-accesstoken" || lk === "x-jlc-access-token") {
      headers["x-jlc-accesstoken"] = val;
      $prefs.setValueForKey(val, "jlc_token");
    }
    if (lk === "secretkey" || lk === "secret-key") {
      headers.secretkey = val;
      $prefs.setValueForKey(val, "jlc_secret");
    }
  }
}

function get(path) {
  return $task.fetch({ url: BASE + path, method: "GET", headers: headers }).then((resp) => {
    absorb(resp);
    try {
      return JSON.parse(resp.body);
    } catch (e) {
      return { success: false, message: "HTTP " + resp.statusCode };
    }
  });
}

function msg(payload) {
  if (!payload || typeof payload !== "object") return String(payload);
  return String(payload.message || payload.msg || payload.error || "");
}

function signLoop(depth) {
  if (depth >= 4) return Promise.resolve("领奖循环过多");
  return get("/api/activity/sign/signIn?source=4").then((data) => {
    if (!data.success) {
      const err = msg(data);
      if (/已签|签过|重复/.test(err)) return "今日已签";
      return "签到失败：" + err;
    }
    const gain = (data.data || {}).gainNum;
    if (!gain) {
      return get("/api/activity/sign/receiveVoucher").then((voucher) => {
        if (!voucher.success) return "领奖失败：" + msg(voucher);
        return signLoop(depth + 1);
      });
    }
    return "签到成功，金豆+" + gain;
  });
}

const logs = [];

get("/api/appPlatform/center/setting/selectPersonalInfo")
  .then((info) => {
    if (!info.success) throw new Error("登录失败：" + msg(info));
    logs.push("客编 " + ((info.data || {}).customerCode || "?"));
    return get("/api/activity/sign/getCurrentUserSignInConfig");
  })
  .then((cfg) => {
    if (!cfg.success) throw new Error("查签到失败：" + msg(cfg));
    if ((cfg.data || {}).haveSignIn) {
      logs.push("今日已签到");
      return "今日已签到";
    }
    return signLoop(0);
  })
  .then((line) => {
    logs.push(line);
    return get("/api/activity/front/getCustomerIntegral");
  })
  .then((point) => {
    if (point.success) logs.push("金豆 " + ((point.data || {}).integralVoucher || "?"));
    $notify(TITLE, "完成", logs.join("\n"));
  })
  .catch((err) => {
    $notify(TITLE, "失败", String(err.message || err));
  })
  .then(() => $done());
