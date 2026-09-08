/**
 * 立创开源保活（建议 4 小时一次）
 */
const TITLE = "立创开源保活";
const BASE = "https://oshwhub.com";
const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148";

const cookie = $prefs.valueForKey("oshw_cookie") || "";
if (!cookie || cookie.indexOf("oshwhub_session=") === -1) {
  $notify(TITLE, "缺少 Cookie", "请先抓包");
  $done();
}

$task
  .fetch({
    url: BASE + "/api/users",
    method: "GET",
    headers: {
      "User-Agent": UA,
      Accept: "application/json, text/plain, */*",
      Cookie: cookie,
      Referer: BASE + "/sign_in",
    },
  })
  .then((resp) => {
    let ok = false;
    try {
      ok = JSON.parse(resp.body).success === true;
    } catch (e) {
      ok = false;
    }
    if (!ok) $notify(TITLE, "会话失效", "请重新抓 oshwhub Cookie，且不要退出登录");
  })
  .then(() => $done())
  .catch(() => $done());
