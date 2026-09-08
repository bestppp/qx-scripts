/**
 * 夸克网盘 · 从 URL 抓 kps / sign / vcode
 * MITM: drive-m.quark.cn
 * 打开夸克 App 网盘「签到/领空间」，点开 drive-m.quark.cn 任意请求。
 */
function grab(raw, key) {
  const m = String(raw || "").match(new RegExp("(?:^|[?&])" + key + "=([^&]+)"));
  return m ? decodeURIComponent(m[1]) : "";
}

const url = ($request && $request.url) || "";
const kps = grab(url, "kps");
const sign = grab(url, "sign");
const vcode = grab(url, "vcode");

if (kps && sign && vcode) {
  $prefs.setValueForKey(kps, "quark_kps");
  $prefs.setValueForKey(sign, "quark_sign");
  $prefs.setValueForKey(vcode, "quark_vcode");
  $notify("夸克网盘", "已保存 kps/sign/vcode", "抓完请关掉本条重写");
} else {
  $notify("夸克网盘", "URL 里没有完整三项", "请点开带 kps、sign、vcode 的 drive-m.quark.cn 请求");
}
$done({});
