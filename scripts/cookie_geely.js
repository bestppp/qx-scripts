/**
 * 吉利汽车 · 抓 token + deviceSN
 * MITM: app.geely.com
 * 打开吉利汽车 App，点开 app.geely.com 任意已登录接口。
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
const token = hdr(headers, "token");
const devicesn = hdr(headers, "deviceSN") || hdr(headers, "devicesn") || hdr(headers, "deviceSn");

if (token && devicesn) {
  $prefs.setValueForKey(token, "geely_token");
  $prefs.setValueForKey(devicesn, "geely_devicesn");
  $notify("吉利汽车", "已保存 token + deviceSN", "抓完请关掉本条重写");
} else {
  $notify("吉利汽车", "请求头不完整", "需要同时有 token 和 deviceSN");
}
$done({});
