# Paiviz — 天鳳成績ビューア

天鳳の成績・ランキングを **見やすく・軽快に**。  
nodocchi.moe をリスペクトしつつ、**UI/UX・モバイル体験・共有性**を重視したモダンビューアです。

- 本番: `https://<your-production>.pages.dev`（Cloudflare Pages）
- 連絡: Issues / Discussions へ

## 特徴（MVP）
- 🔎 検索 & サジェスト（候補ドロップダウン、キーボード操作）
- 📈 ランキング（期間フィルタ・卓/ルール・並び替え・**仮想スクロール**）
- ⭐ お気に入り（ローカル保持、★でランキング絞り込み）
- 🔗 共有（短縮リンク）/ CSV エクスポート
- 🧪 Labs（BYOL解析の実験枠・ナビ非表示）
- 🛡️ 規約順守：**サーバーでの牌譜再配布なし**、原典リンクのみ

> 将来: 動的OG（共有カードPNG生成）、実データ接続、BYOL 解析の充実 etc.

---

## 技術スタック
- **Nuxt 3 + TypeScript** / Vite / Pinia / VueUse / Tailwind CSS
- **ECharts**（チャート）
- **Cloudflare Pages + Pages Functions**
- **Workers KV**：共有スナップショット/サジェスト種などの軽ストレージ
- 解析は **ブラウザ内（Web Worker）** で実施予定（MVPは最小）

---

## ディレクトリ構成
```
components/   … UI（自動インポート。import文は書かない）
pages/        … ルーティング（/rankings, /compare, /s/[id], /admin/seeds など）
composables/  … 状態/ユーティリティ（useRankingQuery, useToast, useFavorites…）
utils/        … 非Vueの汎用TS（api, csv, range, kpi, chartTheme など）
types/        … 型定義（rankings.ts等）
functions/    … Cloudflare Pages Functions（/api/*）
public/       … 静的アセット
```

---

## 開発環境
- Node: **20.x**（Volta推奨。`package.json` pinned）
- npm: **10.x**

### セットアップ
```bash
npm ci
npm run dev   # http://localhost:3000
```

### 本番ビルド
```bash
npm run generate   # 出力: ./dist
```
> Cloudflare Pages の **Build command**: `npm run generate`  
> **Build output directory**: `dist`

---

## Cloudflare 設定（必須）
Pages プロジェクトで以下を設定します。

### 1) KV (Workers KV)
- Workers & Pages → **KV** → Create namespace（例: `paiviz-kv`）
- Pages → プロジェクト → **Settings → Functions → KV bindings**
  - **Variable name**: `PAIVIZ_KV`
  - **Namespace**: `paiviz-kv`
  - Production / Preview にバインド

### 2) 環境変数 / Secrets
- **Environment variables（公開）**
  - `NUXT_PUBLIC_TURNSTILE_SITE_KEY` … TurnstileのSite key  
    - Turnstile側は **Allowed Domains** に `paiviz.pages.dev` と `localhost` を登録
- **Secrets**
  - `TURNSTILE_SECRET` … TurnstileのSecret key
  - `ADMIN_TOKEN` … 管理UI用ランダムトークン（`openssl rand -base64 48` 等）

> 反映には **再デプロイ** が必要です。

---

## API（Pages Functions）
- `GET  /api/seeds` … サジェストseed一覧（KV `seed:players`）
- `POST /api/seeds { name, admin }` … 追加（`admin === ADMIN_TOKEN` 時のみ）
- `DELETE /api/seeds { name, admin }` … 削除（同上）
- `POST /api/turnstile { token }` … Turnstile verify（将来の公開UIで使用）
- `POST /api/shorten { kind, data }` … 共有スナップショット（KVに保存・短縮ID返却）※実装済みの場合

---

## 重要なポリシー（規約・セキュリティ）
- **サーバー側で牌譜の一括収集・再配布をしない**  
- **原典リンク（tenhou.net）へリンクアウト**  
- BYOL（ユーザー持ち込み）の解析は **ブラウザ内** で行い、**デフォルト非保存**  
- 共有スナップショットは **サマリのみ**（牌譜本文は保存しない）
- CSP/依存監査/レート制限を順次整備（AdSlotは予約サイズでCLS抑制）

---

## コーディング規約・開発運用
- **コンポーネントの import 文は不要**（Nuxt自動インポート）
- TypeScript 推奨、nullセーフ（`.length` 使用前は `?.` / `??`）
- コミットメッセージ: **日本語**（例: `feat(rankings): 仮想スクロールを導入`）
- ブランチ: 少人数のため **main 直push可**（PR歓迎）
- ラベル例: `feat`, `fix`, `perf`, `design`, `docs`, `infra`, `policy`, `rankings`, `compare`, `player`, `labs`, `ads`, `ssr`

---

## よく使うコマンド
```bash
npm run dev        # ローカル開発
npm run generate   # 静的書き出し (dist)
npm run preview    # 生成物のプレビュー
```

---

## 貢献
- PR/Issue歓迎。初回は小さな修正からどうぞ。
- セキュリティ問題は Issue ではなく DM/メールで連絡してください。

## ライセンス
TBD
