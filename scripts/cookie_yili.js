/**
 * 金典 / 安慕希 · 抓 access-token
 * MITM: msmarket.msx.digitalyili.com
 * 必须进对应小程序再抓，两套 token 不能混用。
 * 金典 appid wxf32616183fb4511e → jindian_token
 * 安慕希 appid wxf2a6206f7e2fd712 → amx_token
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
const token = hdr(headers, "access-token");
const blob = (
  hdr(headers, "Referer") +
  " " +
  hdr(headers, "forward-appid") +
  " " +
  hdr(headers, "referer")
).toLowerCase();

if (!token) {
  $notify("伊利会员", "没有 access-token", "点开 msmarket.msx.digitalyili.com 的接口");
  $done({});
} else if (blob.indexOf("wxf2a6206f7e2fd712") !== -1) {
  $prefs.setValueForKey(token, "amx_token");
  $notify("安慕希", "已保存 access-token", "抓完请关掉本条重写");
} else if (blob.indexOf("wxf32616183fb4511e") !== -1) {
  $prefs.setValueForKey(token, "jindian_token");
  $notify("金典有机生活+", "已保存 access-token", "抓完请关掉本条重写");
} else {
  $prefs.setValueForKey(token, "yili_token_unknown");
  $notify("伊利会员", "已保存，但未能识别小程序", "请确认是金典或安慕希；可在 BoxJs 手动拷到对应项");
}
$done({});
