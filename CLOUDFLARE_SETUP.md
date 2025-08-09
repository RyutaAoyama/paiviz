# Cloudflare セットアップ（共有リンクの短縮）

## 1) KV Namespace を作成
- Dashboard → **Workers & Pages** → **KV** → **Create namespace**
  - Name: `paiviz-links` （任意）
- できたら ID を控える（preview 用も作ると良い）

## 2) Pages プロジェクトにバインド
- Dashboard → **Pages** → あなたのプロジェクト → **Settings** → **Functions** → **KV bindings**
  - Binding name: **PAIVIZ_LINKS**（厳密一致）
  - Namespace: 上で作ったものを選択

## 3) デプロイ
- 本リポに `functions/` 以下が入っていれば、次回の push で自動的に Pages Functions が有効になります。
- API:
  - `POST /api/shorten` … { kind:'rankings'|'compare', data:{...} } → { short }
  - `GET  /api/snapshot?id=<id>` … 保存した JSON を取得

## 4) 共有リンクの動作
- `/s/:id` にアクセスすると、中身を取得して対象ページ（/rankings or /compare）へ**自動リダイレクト**します。
