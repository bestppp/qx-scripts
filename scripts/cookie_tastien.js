/**
 * 塔斯汀 · 抓 user-token
 * MITM: sss-web.tastientech.com
 * 打开微信小程序「塔斯汀」。
 * 写入：tastien_token
 */
function hdr(h, name) {
  if (!h) return "";
  const want = String(name).toLowerCase();
  for (const key of Object.keys(h)) {
    if (String(key).toLowerCase() === want) return String(h[key] || "");
  }
  return "";
}

const headers = $request && $request.headers ? $request.headers : {};
const token = hdr(headers, "user-token");

if (token) {
  $prefs.setValueForKey(token, "tastien_token");
  $notify("塔斯汀", "已保存 user-token", "抓完请关掉本条重写");
} else {
  $notify("塔斯汀", "没有 user-token", "点开 sss-web.tastientech.com 的接口");
}
$done({});
