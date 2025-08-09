# AGENTS — 開発エージェント向け運用ガイド

Paiviz の開発を自動化/半自動化するための **タスク指示フォーマット** と **ガードレール**。  
Codex などのエージェントは、ここで定義するルールに従って作業します。

---

## ミッション
- 天鳳成績を **高速・見やすく・安全に** 可視化
- **規約順守**（サーバーでの牌譜再配布は NG）
- モバイル最適＆学習コストの低いUI

---

## 重要ルール（必読）
1. **サーバーで天鳳の牌譜を収集・保存・再配布しない**  
   - 共有スナップショットは **サマリのみ**（牌譜本文禁止）  
   - 公式リプレイは **リンクアウト**（`tenhou.net/?log=...`）
2. **ローカル解析優先（BYOL）**  
   - 解析は Web Worker / ブラウザ内で実施
3. **コンポーネントの import 文を書かない**  
   - Nuxt 自動インポートに任せる
4. **SSR 例外を出さない**  
   - null セーフ：`?.` / `?? 0` / `Array.isArray`
5. **パフォーマンス目標**  
   - LCP < 2.5s / CLS < 0.1 / 初期JS < 170KB（目安）
6. **アクセシビリティ**  
   - キー操作/コントラスト/フォーカス可視
7. **広告・計測**  
   - AdSlotは **固定サイズ予約**（CLS対策）  
   - GA4はIP匿名化、CMPは最小限で導入予定

---

## コード構成・役割
- `components/`：UI（例：`VirtualTable.vue`, `Toast.vue`, `KpiCard.vue`, `RankTrendChart.vue`, `RankDonut.vue`, `KpiDiffTable.vue`）
- `pages/`：UIルーティング（`/rankings`, `/compare`, `/s/[id]`, `/admin/seeds`）
- `composables/`：`useRankingQuery`, `useToast`, `useFavorites`, `useSwipe`
- `utils/`：`api`（指数バックオフ付ラッパ）, `csv`, `range`, `kpi`, `chartTheme`
- `types/`：`rankings.ts`（Mode/Model/SortKey など）
- `functions/`：`/api/seeds`, `/api/turnstile`（Pages Functions）
- **Cloudflare設定**：`PAIVIZ_KV` / `NUXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET` / `ADMIN_TOKEN`

---

## タスク指示テンプレ（コピペ用）

```md
# タイトル（簡潔）
## 目的
- 何を達成したいか（1〜3行）

## 受け入れ基準（DoD）
- [ ] UI/URL 同期 or API 正常系/異常系 など行動ベースで列挙

## 変更内容（ファイル単位）
- 新規 or 変更ファイルのパスを列挙し、主要コード断片を示す
- 既存コードの置換は「まるごと置換可」と明記

## 注意
- Nuxt自動インポート（import不要）
- SSR例外を出さない（nullセーフ）
- コミット: 日本語メッセージで粒度を分ける

## テスト観点
- 手動操作の観点で（例: Alt+SでA/B入替→URL更新）
```

---

## コーディング規約（要点）
- **TypeScript**：疎通のため型を素直に書く。`any` 多用禁止
- **UI**：Tailwind。カラーは `#0F1115/#161A20/#242A33` + ティール `#14B8A6`
- **ECharts**：`onMounted` で動的import、SSR安全に
- **API**：`utils/api.ts` の `apiFetch(path, { timeoutMs, retries })` 経由  
  429/5xx/Abort は **指数バックオフ**でリトライ
- **トースト**：エラーは `useToast().push()` で可視化

---

## 安全ガード（法務/規約）
- 牌譜の **クローリング/ミラー/配布** を禁止
- API風エンドポイントでの牌譜配信禁止
- 不明点や保存範囲拡張は **事前にC-EGGへ問い合わせ**
- `/admin/*` は ADMIN_TOKEN（将来は Cloudflare Access/SAML など）

---

## パフォーマンス / UX
- テーブルは **仮想スクロール**（`VirtualTable.vue`）
- 画像/広告は **レイアウト予約** で CLS を抑制
- 重い処理は Web Worker / 非同期で

---

## 典型プレイブック

### A. KV を使う API を追加するとき
1. `functions/api/<name>.ts` を追加（`PagesFunction<Env>` 型）
2. Pages > Functions > **KV binding** を確認（`PAIVIZ_KV`）
3. 本番で `GET/POST/DELETE` をブラウザや curl で検証

### B. ページ固有のOGメタ
- `useHead({ title, meta: [...] })` をページ内に追加
- 画像はプレースホルダ → 後で動的OGに差し替え

### C. 新しいチャート
- `components/ChartX.vue` を作成、`onMounted` で `const echarts = await import('echarts')`
- SSRで動かさないようにガード

---

## PR チェックリスト
- [ ] SSR例外なし（ログに `Cannot read ... of undefined` なし）
- [ ] Lighthouse（モバイル）で LCP/CLS が目標範囲
- [ ] キーボード操作OK（フォーカス抜け・トラップなし）
- [ ] 共有/OGメタが適切
- [ ] コミットは日本語で粒度適切

---

## 将来計画（要約）
- 動的OG: `/api/og`（SVG→PNG生成）
- 比較: KPI実データへ差し替え、差分ハイライト強化
- Labs(BYOL): 解析アルゴリズムの定義と可視化
- アカウント/同期が必要になれば D1/Postgres を段階導入
