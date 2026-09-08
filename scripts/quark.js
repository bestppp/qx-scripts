/**
 * 夸克网盘签到领空间
 * BoxJs：quark_kps / quark_sign / quark_vcode
 */
const TITLE = "夸克网盘";
const kps = $prefs.valueForKey("quark_kps") || "";
const sign = $prefs.valueForKey("quark_sign") || "";
const vcode = $prefs.valueForKey("quark_vcode") || "";
if (!kps || !sign || !vcode) {
  $notify(TITLE, "缺少 kps/sign/vcode", "打开夸克网盘签到页后开 Rewrite 抓包");
  $done();
}

function qs() {
  return (
    "pr=ucpro&fr=android&kps=" +
    encodeURIComponent(kps) +
    "&sign=" +
    encodeURIComponent(sign) +
    "&vcode=" +
    encodeURIComponent(vcode)
  );
}

function bytes(n) {
  n = Number(n) || 0;
  if (n >= 1073741824) return (n / 1073741824).toFixed(2) + " GB";
  if (n >= 1048576) return (n / 1048576).toFixed(2) + " MB";
  return n + " B";
}

$task
  .fetch({
    url: "https://drive-m.quark.cn/1/clouddrive/capacity/growth/info?" + qs(),
    method: "GET",
    headers: { Accept: "application/json", "User-Agent": "Quark/6.0" },
  })
  .then((resp) => JSON.parse(resp.body))
  .then((info) => {
    const data = info.data;
    if (!data) throw new Error(info.message || "凭据可能失效，请重抓 kps/sign/vcode");
    const cap = data.cap_sign || {};
    if (cap.sign_daily) {
      $notify(TITLE, "今日已签", "奖励 " + bytes(cap.sign_daily_reward) + "，总空间 " + bytes(data.total_capacity));
      return null;
    }
    return $task
      .fetch({
        url: "https://drive-m.quark.cn/1/clouddrive/capacity/growth/sign?" + qs(),
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "Quark/6.0",
        },
        body: JSON.stringify({ sign_cyclic: true }),
      })
      .then((resp) => JSON.parse(resp.body))
      .then((signRes) => {
        if (!signRes.data) throw new Error(signRes.message || "签到失败");
        $notify(
          TITLE,
          "签到成功",
          "本次 " + bytes(signRes.data.sign_daily_reward) + "，总空间 " + bytes(data.total_capacity)
        );
      });
  })
  .catch((e) => $notify(TITLE, "失败", String(e.message || e)))
  .then(() => $done());
