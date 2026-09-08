/**
 * 仅供阅读对照。Quantumult X 远程脚本不能 require，
 * 真正执行的逻辑已内嵌在各独立 js 里。
 */
function header(h, name) {
  if (!h) return "";
  const want = String(name).toLowerCase();
  for (const key of Object.keys(h)) {
    if (String(key).toLowerCase() === want) return String(h[key] || "");
  }
  return "";
}
