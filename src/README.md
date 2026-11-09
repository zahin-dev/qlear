# ソースコード

QLEARのコードは、次の4つに分かれます。

- `app/`はURLとページの入口です。ページ、レイアウト、ルートハンドラー、共通のCSSを置きます。
- `frontend/`には利用者が操作する画面を置きます。`components/`は共通の画面部品、`features/`は機能ごとの画面部品、`stores/`はReact ContextやZustandで管理する画面の状態を扱います。
- `backend/`はデータを処理します。`ai/`はAI連携の入出力の仕様、模擬プランナー、OpenAI連携、ブラウザから利用できるクライアントを扱います。`db/`はDexieのスキーマ、`repositories/`はデータの読み書きを担当します。
- `shared/`は画面とデータ処理で共通して使います。`domain/`は副作用のない計算、`types/`は共有する型、`validation/`は共通の検証ルール、`utils/`は汎用の補助関数を扱います。

QLEARは1つのNext.jsアプリです。`backend/`はアプリ内のデータ処理層で、データはブラウザのIndexedDBに保存します。OpenAI SDKと認証情報はサーバー側で管理し、画面からは`app/api/`のAPIを通じて利用します。模擬プランナーは既定の設定で使われ、OpenAI連携に失敗した場合も計画の生成を引き継ぎます。

再利用する画面部品は`frontend/components/`、機能専用の画面部品は`frontend/features/`に置きます。`shared/`の処理はReact、Dexie、OpenAI、ブラウザAPIから独立させます。機能用のフォルダは実装に合わせて作ります。
