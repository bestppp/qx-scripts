/**
 * 百度贴吧 · 抓 BDUSS
 * MITM: tieba.baidu.com
 * 打开 https://tieba.baidu.com 并登录。
 */
function hdr(h, name) {
  if (!h) return "";
  const want = String(name).toLowerCase();
  for (const key of Object.keys(h)) {
    if (String(key).toLowerCase() === want) return String(h[key] || "");
  }
  return "";
}

function pickBduss(cookie) {
  const m = String(cookie || "").match(/BDUSS=([^;]+)/i);
  return m ? m[1] : "";
}

const cookie = hdr($request && $request.headers, "Cookie");
const bduss = pickBduss(cookie);
if (bduss) {
  $prefs.setValueForKey(bduss, "tieba_bduss");
  $notify("百度贴吧", "已保存 BDUSS", "抓完请关掉本条重写");
} else {
  $notify("百度贴吧", "没有 BDUSS", "请先登录 tieba.baidu.com");
}
$done({});
