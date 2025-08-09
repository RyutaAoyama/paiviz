# AGENTS — 開発エージェント向け運用ガイド

Paiviz の開発を自動化/半自動化するための **タスク指示フォーマット** と **ガードレール**。  
Codex などのエージェントは、ここで定義するルールに従って作業します。

---

## ミッション

- 天鳳成績を **高速・見やすく・安全に** 可視化
- **規約順守**（サーバーでの牌譜再配布は NG）
- モバイル最適＆学習コストの低い UI

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
   - LCP < 2.5s / CLS < 0.1 / 初期 JS < 170KB（目安）
6. **アクセシビリティ**
   - キー操作/コントラスト/フォーカス可視
7. **広告・計測**
   - AdSlot は **固定サイズ予約**（CLS 対策）
   - GA4 は IP 匿名化、CMP は最小限で導入予定

---

## Lint/Format ガード（必読）

- **コミット前（pre-commit）**: 差分に対して `eslint --fix` と `prettier --write` を自動実行（lint-staged）。
  - エラーが残る場合はコミットは失敗します。必ず修正して再実行してください。
  - `--no-verify` でのフック回避は禁止。
- **プッシュ前（pre-push）**: リポジトリ全体に `npm run lint` を実行。エラーがある場合はプッシュ不可。
- **ローカル確認コマンド**
  - Lint: `npm run lint` / 自動修正: `npm run lint:fix`
  - フォーマット確認: `npm run format` / 自動整形: `npm run format:write`
- **DoD（受け入れ基準）**: すべての変更は lint/format をパスしていること。

---

## 公開 API（契約）互換性ガイド

UI の安定性を守るため、以下の「契約」を破る変更は禁止。変更が必要な場合は必ず後方互換を確保。

- 対象となる契約
  - **Composables**（例：`useFavorites` の返却プロパティ名・型）
  - **Component の props / emits**
  - **Route パラメータ/クエリ**
  - **Functions API 仕様**（HTTP メソッド/パス/ペイロード）
  - **ストレージのキー/シリアライズ形式**（例：`localStorage` の `paiviz:favs`）

- 破壊的変更の例（禁止）
  - 返却プロパティのリネーム（`isFav` → `has` など）
  - 返却プロパティの削除・型変更
  - 既存 props / emits の名称・型変更
  - ストレージの JSON 形式を互換なく変更

- 変更手順（チェックリスト）
  1. 参照元を全検索（例：`isFav\(` や `useFavorites()` の使用箇所をリポジトリ全体で検索）
  2. 後方互換のエイリアスを追加（例：`return { has, isFav: has, ... }`）
  3. 型で守る：返却型を明示し、誤ったプロパティ名を検知できるようにする
  4. スモークテスト：`/`（トップ）, `/player/[name]`, `/rankings` を手動確認
     - SSR/クライアント双方で 500/赤エラーが出ないこと（コンソール含む）
  5. 変更点を本ドキュメント or CHANGELOG に記載（非推奨 API の告知）

- 例：後方互換エイリアス

```ts
// composables/useFavorites.ts
export const useFavorites = () => {
  const has = (name: string) => favs.value.has(name);
  const list = computed(() => [...favs.value]);
  return { list, has, isFav: has, toggle };
};
```

- 推奨：返却型の明示

```ts
type FavoritesApi = {
  list: Readonly<Ref<string[]>>;
  has: (name: string) => boolean;
  isFav: (name: string) => boolean;
  toggle: (name: string) => void;
};
export const useFavorites = (): FavoritesApi => {
  /* ... */
};
```

---

## SSR/クライアント ガード チェック

- `localStorage`/`window`/`document` に触れる処理は `process.client` ガード下のみ
- 動的 import（ECharts 等）は `onMounted` で実行
- 配列/オブジェクトは `Array.isArray` / nullish 合体（`??`）で防御
- 直列データは **POJO のみ**（`Date` などは SSR ペイロードで警告）

---

## コード構成・役割

- `components/`：UI（例：`VirtualTable.vue`, `Toast.vue`, `KpiCard.vue`, `RankTrendChart.vue`, `RankDonut.vue`, `KpiDiffTable.vue`）
- `pages/`：UI ルーティング（`/rankings`, `/compare`, `/s/[id]`, `/admin/seeds`）
- `composables/`：`useRankingQuery`, `useToast`, `useFavorites`, `useSwipe`
- `utils/`：`api`（指数バックオフ付ラッパ）, `csv`, `range`, `kpi`, `chartTheme`
- `types/`：`rankings.ts`（Mode/Model/SortKey など）
- `functions/`：`/api/seeds`, `/api/turnstile`（Pages Functions）
- **Cloudflare 設定**：`PAIVIZ_KV` / `NUXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET` / `ADMIN_TOKEN`

---

## タスク指示テンプレ（コピペ用）

```md
# タイトル（簡潔）

## 目的

- 何を達成したいか（1〜3 行）

## 受け入れ基準（DoD）

- [ ] UI/URL 同期 or API 正常系/異常系 など行動ベースで列挙

## 変更内容（ファイル単位）

- 新規 or 変更ファイルのパスを列挙し、主要コード断片を示す
- 既存コードの置換は「まるごと置換可」と明記

## 注意

- Nuxt 自動インポート（import 不要）
- SSR 例外を出さない（null セーフ）
- コミット: 日本語メッセージで粒度を分ける

## テスト観点

- 手動操作の観点で（例: Alt+S で A/B 入替 →URL 更新）
```

---

## コーディング規約（要点）

- **TypeScript**：疎通のため型を素直に書く。`any` 多用禁止
- **UI**：Tailwind。カラーは `#0F1115/#161A20/#242A33` + ティール `#14B8A6`
- **ECharts**：`onMounted` で動的 import、SSR 安全に
- **API**：`utils/api.ts` の `apiFetch(path, { timeoutMs, retries })` 経由  
  429/5xx/Abort は **指数バックオフ**でリトライ
- **トースト**：エラーは `useToast().push()` で可視化

### コメント/アノテーションの方針（基本は日本語）

- 関数・公開 API・複雑な型には短い JSDoc を付与（`@param`, `@returns` など）。
- 非自明な処理やマジックナンバーには「なぜ」を 1〜2 行で説明（「どうやって」はコードで表現）。
- 条件分岐・境界条件は意図を示す短いコメントを添える（例: 「履歴汚染を避けるため replace」）。
- 変数/関数名で意図が明確ならコメントは省略してよい（冗長な重複は避ける）。
- ドメイン用語は日本語で記述。UI 文言と不一致がある場合は注記。
- `// eslint-disable` や `@ts-expect-error` は最小範囲・理由必須・期限付き（代替策が整い次第撤去）。
- TODO コメントは禁止。対応が必要なら Issue/タスク化し、暫定措置には撤去条件を明記。

---

## 安全ガード（法務/規約）

- 牌譜の **クローリング/ミラー/配布** を禁止
- API 風エンドポイントでの牌譜配信禁止
- 不明点や保存範囲拡張は **事前に C-EGG へ問い合わせ**
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

### B. ページ固有の OG メタ

- `useHead({ title, meta: [...] })` をページ内に追加
- 画像はプレースホルダ → 後で動的 OG に差し替え

### C. 新しいチャート

- `components/ChartX.vue` を作成、`onMounted` で `const echarts = await import('echarts')`
- SSR で動かさないようにガード

---

## PR チェックリスト

- [ ] SSR 例外なし（ログに `Cannot read ... of undefined` なし）
- [ ] 公開 API 契約の破壊的変更なし（Composables/props/Functions/ストレージ形式）
- [ ] Lighthouse（モバイル）で LCP/CLS が目標範囲
- [ ] キーボード操作 OK（フォーカス抜け・トラップなし）
- [ ] 共有/OG メタが適切
- [ ] コミットは日本語で粒度適切
- [ ] Lint/Prettier を通過（pre-commit / pre-push フックもグリーン）

---

## 将来計画（要約）

- 動的 OG: `/api/og`（SVG→PNG 生成）
- 比較: KPI 実データへ差し替え、差分ハイライト強化
- Labs(BYOL): 解析アルゴリズムの定義と可視化
- アカウント/同期が必要になれば D1/Postgres を段階導入
