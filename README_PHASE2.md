# Phase 2: サジェストAPI + 検索補完 + レート制限 + メタ

## 追加

- `functions/api/suggest.ts` … プレイヤー名候補を返す（KVの `seed:players` に配列があれば利用、無ければ内蔵シード）
  - GET `/api/suggest?q=xxx&limit=10`
  - レート制限: 120 req/min per IP（KVベース）
- `functions/api/shorten.ts` … 共有短縮の API にも 20 req/min のレート制限を追加
- `functions/api/meta/rankings.ts` … ランキングのメタ（ダミー）を KV に 10 分キャッシュ
- `components/SearchBox.vue` … 本実装（お気に入り/最近/サジェスト・キーボード操作・ハイライト）
- `composables/useRecent.ts` / `useFavorites.ts` … LocalStorage 管理

## セットアップ

- Cloudflare Pages → Functions → KV bindings に **PAIVIZ_LINKS** をバインド（既に済なら不要）
- 人気プレイヤーのシードを更新したい場合は、KVに `seed:players` を JSON 配列で格納
  例: `["ASAPIN","独歩","就活生＠川村軍","福地誠", ...]`

## メモ

- 牌譜本文の保存は引き続き無し。サジェストは名前のみ扱う。
- レート制限はベストエフォート。必要なら Turnstile 追加を検討。
