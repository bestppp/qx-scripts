/**
 * 塔斯汀汉堡签到（只签到+查积分，不抢券）
 * BoxJs：tastien_token（user-token）
 */
const TITLE = "塔斯汀签到";
const BASE = "https://sss-web.tastientech.com";
const VERSION = "3.78.0";
const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.0";
const token = $prefs.valueForKey("tastien_token") || "";
if (!token) {
  $notify(TITLE, "缺少 user-token", "进塔斯汀小程序后开 Rewrite 抓包");
  $done();
}

function headers() {
  return {
    "User-Agent": UA,
    "Content-Type": "application/json",
    "user-token": token,
    version: VERSION,
    channel: "1",
    xweb_xhr: "1",
    Referer: "https://servicewechat.com/wx557473f23153a429/page-frame.html",
  };
}

function parse(resp) {
  const text = String(resp.body || "");
  if (resp.statusCode === 403 || /<html|waf|aliyun/i.test(text.slice(0, 200))) {
    return { code: 403, msg: "疑似 WAF，请用国内网络" };
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    return { code: resp.statusCode, msg: text.slice(0, 120) };
  }
}

function req(method, path, body) {
  const opts = {
    url: BASE + path,
    method: method,
    headers: headers(),
    body: JSON.stringify(body || {}),
  };
  return $task.fetch(opts).then(parse);
}

function expired(payload) {
  const code = String((payload && payload.code) || "");
  const msg = String((payload && (payload.msg || payload.message)) || "");
  if (["401", "1001", "10001"].indexOf(code) !== -1) return true;
  return /登录|过期|失效|未登录|token/i.test(msg);
}

function findActivity(rows) {
  if (!Array.isArray(rows)) return 0;
  for (let i = 0; i < rows.length; i++) {
    const item = rows[i] || {};
    const name = String(item.bannerName || "");
    const jump = item.jumpCode || "";
    if (jump === "SIGN" || name.indexOf("签到") !== -1) {
      let para = item.jumpPara || "{}";
      try {
        if (typeof para === "string") para = JSON.parse(para);
        const aid = para.activityId;
        if (aid) return Number(aid);
      } catch (e) {}
    }
  }
  return 0;
}

function probeActivity(start) {
  const now = Date.now();
  let aid = start;
  const end = start + 25;
  function step() {
    if (aid > end) return Promise.resolve(start);
    const current = aid;
    aid += 1;
    return req("POST", "/api/sign/member/signInfoV2", { activityId: current }).then((res) => {
      const info = (res.result && res.result.activityInfo) || {};
      if (res.code === 200 && info.startTime && info.endTime && info.startTime <= now && now <= info.endTime) {
        return current;
      }
      return step();
    });
  }
  return step();
}

const logs = [];
let phone = "";

req("GET", "/api/intelligence/member/getMemberDetail", {})
  .then((member) => {
    if (expired(member) && member.code !== 200) throw new Error("token 失效：" + (member.msg || ""));
    if (member.code === 200 && member.result) phone = String(member.result.phone || "");
    return req("POST", "/api/wx/point/myPoint", {});
  })
  .then((pointRes) => {
    if (pointRes.code === 403) throw new Error(pointRes.msg);
    if (expired(pointRes)) throw new Error("token 失效：" + (pointRes.msg || ""));
    if (pointRes.code === 200 && pointRes.result) logs.push("积分 " + pointRes.result.point);
    const body = { shopId: "", birthday: "", gender: 0, nickName: null, phone: "" };
    return req("POST", "/api/minic/shop/intelligence/banner/c/list/sign", body).then((banner) => {
      let aid = findActivity(banner.result);
      if (aid) return aid;
      return req("POST", "/api/minic/shop/intelligence/banner/c/list", body).then((b2) => {
        aid = findActivity(b2.result);
        if (aid) return aid;
        return probeActivity(74);
      });
    });
  })
  .then((activityId) => {
    const payload = { activityId: activityId, memberName: "", memberPhone: phone };
    return req("POST", "/api/sign/member/signV2", payload).then((signRes) => {
      if (signRes.code !== 200 && String(signRes.msg || "").indexOf("不存在") !== -1) {
        return req("POST", "/api/sign/member/signV2/sign", payload);
      }
      return signRes;
    });
  })
  .then((signRes) => {
    const msg = String(signRes.msg || "");
    if (signRes.code === 200) logs.push("签到成功");
    else if (/已签|签过|重复/.test(msg)) logs.push("今日已签");
    else if (expired(signRes)) throw new Error("token 失效：" + msg);
    else throw new Error("签到失败：" + (msg || JSON.stringify(signRes)));
    return req("POST", "/api/wx/point/myPoint", {});
  })
  .then((after) => {
    if (after.code === 200 && after.result) logs.push("余额 " + after.result.point);
    $notify(TITLE, "完成", logs.join("\n"));
  })
  .catch((e) => $notify(TITLE, "失败", String(e.message || e)))
  .then(() => $done());
