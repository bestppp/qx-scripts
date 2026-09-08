/**
 * 嘉立创金豆保活（建议 4 小时一次）
 * 只访问个人信息/积分，不签到。
 */
const TITLE = "嘉立创金豆保活";
const BASE = "https://m.jlc.com";
const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148";

const token = $prefs.valueForKey("jlc_token") || "";
const secret = $prefs.valueForKey("jlc_secret") || "";
if (!token || !secret) {
  $notify(TITLE, "缺少凭据", "请先抓包");
  $done();
}

const headers = {
  "User-Agent": UA,
  Accept: "application/json, text/plain, */*",
  Origin: BASE,
  Referer: "https://m.jlc.com/mapp/pages/my/index",
  "x-jlc-clienttype": "WEB",
  "x-jlc-accesstoken": token,
  secretkey: secret,
};

function get(path) {
  return $task.fetch({ url: BASE + path, method: "GET", headers: headers }).then((resp) => {
    try {
      return JSON.parse(resp.body);
    } catch (e) {
      return { success: false, message: "HTTP " + resp.statusCode };
    }
  });
}

get("/api/appPlatform/center/setting/selectPersonalInfo")
  .then((info) => {
    if (!info.success) {
      $notify(TITLE, "会话失效", "请重新抓 x-jlc-accesstoken 和 secretkey");
      return;
    }
    return get("/api/activity/front/getCustomerIntegral").then(() =>
      get("/api/activity/sign/getCurrentUserSignInConfig")
    );
  })
  .then(() => $done())
  .catch(() => $done());
