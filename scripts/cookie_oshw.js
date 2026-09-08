/**
 * 立创开源 oshwhub · 抓包
 * MITM: oshwhub.com
 * 打开 https://oshwhub.com/sign_in 并登录。
 * 写入：oshw_cookie
 */
const TITLE = "立创开源";

function hdr(h, name) {
  if (!h) return "";
  const want = String(name).toLowerCase();
  for (const key of Object.keys(h)) {
    if (String(key).toLowerCase() === want) return String(h[key] || "");
  }
  return "";
}

const headers = $request && $request.headers ? $request.headers : {};
const cookie = hdr(headers, "Cookie");

if (cookie && cookie.indexOf("oshwhub_session=") !== -1) {
  $prefs.setValueForKey(cookie, "oshw_cookie");
  $notify(TITLE, "已保存 Cookie", "含 oshwhub_session\n抓完请关掉本条重写，且不要退出登录");
} else {
  $notify(TITLE, "Cookie 不完整", "请复制含 oshwhub_session 的整段 Cookie");
}
$done({});
