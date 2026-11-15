# 新約讀經本

讀新約、劃線、寫筆記、問 AI，手機加到主畫面就能用。

https://s1teeey.github.io/bible-reader/

## 資料夾地圖

| 位置 | 內容 |
|---|---|
| `index.html` | 頁面 |
| `app.js` | 主程式 |
| `app.css` | 樣式 |
| `sw.js` | 離線快取 |
| `manifest.webmanifest`、`icons/` | 主畫面名稱和圖示 |
| `data/text/` | 經文，和合本加 WEB 英文，一卷一個檔 |
| `data/guide/` | 每章導讀 |
| `data/people.js` | 人物和人物關係 |
| `relay/` | AI 中繼站（Cloudflare Worker） |

檔名是卷號，`0` 是馬太福音，`26` 是啟示錄。

## 分頁

| 分頁 | 內容 |
|---|---|
| 讀經 | 中英對照、四色劃線、筆記 |
| 計畫 | 10 種讀經計畫 |
| 筆記 | 筆記、劃線、AI 問答 |
| 人物 | 新約人物 |
| 設定 | 同步、AI 邀請碼、API key |

## 導讀進度

- 寫好了：馬太福音到腓利門書
- 還沒寫：希伯來書到啟示錄

## 同步

存在 GitHub 私人 gist `bible-reader.json`，每台裝置各填一次自己的 token（要有 gist 權限）。

## AI 問答

- 用邀請碼：經過中繼站 `https://bible-reader-ai.ju4t4r1.workers.dev`，每人每月預設 US$2
- 用自己的 API key：直接連 Anthropic
- 邀請碼在 `/admin` 管理
- `ANTHROPIC_API_KEY`、`ADMIN_TOKEN` 設在 Cloudflare，不在 repo 裡

部署中繼站：

```bash
cd relay && npx wrangler@4 deploy
```

## 更新程式

`index.html` 裡的 `?v=` 和 `sw.js` 的 `V` 都要加一，手機才會抓到新版。
