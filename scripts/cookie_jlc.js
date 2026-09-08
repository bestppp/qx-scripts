/**
 * 嘉立创金豆 · 抓包
 * MITM: m.jlc.com
 * 打开 https://m.jlc.com/mapp/ 或小程序「嘉立创下单助手」，登录后任意接口即可。
 * 写入 BoxJs / $prefs：jlc_token、jlc_secret
 */
const TITLE = "嘉立创金豆";

function hdr(h, name) {
  if (!h) return "";
  const want = String(name).toLowerCase();
  for (const key of Object.keys(h)) {
    if (String(key).toLowerCase() === want) return String(h[key] || "");
  }
  return "";
}

const headers = $request && $request.headers ? $request.headers : {};
const token = hdr(headers, "x-jlc-accesstoken") || hdr(headers, "x-jlc-access-token");
const secret = hdr(headers, "secretkey") || hdr(headers, "secret-key");

if (token && secret) {
  $prefs.setValueForKey(token, "jlc_token");
  $prefs.setValueForKey(secret, "jlc_secret");
  $notify(TITLE, "已保存请求头", "x-jlc-accesstoken + secretkey\n抓完请关掉本条重写");
} else {
  $notify(TITLE, "未抓到完整请求头", "需要同时有 x-jlc-accesstoken 和 secretkey，不要复制 Cookie");
}
$done({});
