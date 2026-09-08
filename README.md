# 自用 Quantumult X 签到脚本

只调官方接口，凭据存在手机 `$prefs` / BoxJs，**不要**把 token、Cookie 提交进 git。

和家里呆呆面板不要同一天对同一账号签两次。

## 在 Quantumult X 里订阅

1. **重写** → 引用  
   `https://raw.githubusercontent.com/bestppp/qx-scripts/main/rewrite.conf`  
   抓包时打开对应规则 + MITM 主机名；抓完关掉。
2. **任务** → 图库  
   `https://raw.githubusercontent.com/bestppp/qx-scripts/main/gallery.json`
3. **BoxJs** 订阅（可选）  
   `https://raw.githubusercontent.com/bestppp/qx-scripts/main/boxjs.json`

QX 需开启 VPN / Tunnel，定时任务还要打开右上角闹钟。

## 各脚本抓哪一项

| 脚本 | 主机 | 保存的字段 |
| --- | --- | --- |
| 嘉立创金豆 | `m.jlc.com` | 请求头 `x-jlc-accesstoken` + `secretkey`（不是 Cookie） |
| 立创开源 | `oshwhub.com` | 请求头 `Cookie`（要有 `oshwhub_session`） |
| 金典 | `msmarket.msx.digitalyili.com` | `access-token`（金典小程序） |
| 安慕希 | 同上 | `access-token`（安慕希小程序，和金典不是同一个） |
| 塔斯汀 | `sss-web.tastientech.com` | `user-token` |
| 百度贴吧 | `tieba.baidu.com` | Cookie 里的 `BDUSS` |
| 吉利汽车 | `app.geely.com` | 请求头 `token` + `deviceSN` |
| 夸克网盘 | `drive-m.quark.cn` | URL 参数 `kps`、`sign`、`vcode` |

抓完不要在网页/小程序里退出登录。嘉立创会话空闲会掉，请保留保活任务。

贴吧单次最多签 40 个吧，避免 QX 任务超时。WPS / 顺丰 / 小米商城加密或任务链较长，继续用呆呆面板跑。
