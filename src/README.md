# Source Code

QLEARのコードは、次の4つに分かれます。

- `app/`: URLとページの入口。Page、Layout、Route Handler、global CSSを置きます。
- `frontend/`: ユーザーが見る画面。`components/`は共通UI、`features/`は機能専用UI、`stores/`はReact ContextやZustandの画面状態です。
- `backend/`: UIの裏側。`ai/`はAI契約・Mock・OpenAI・browser-safe client、`db/`はDexie schema、`repositories/`はデータ読み書きです。
- `shared/`: FrontendとBackendの共通処理。`domain/`は純粋計算、`types/`は共有型、`validation/`は共有Schema、`utils/`は小さな汎用関数です。

QLEARは1つのNext.jsアプリです。`backend`は別サーバーではなくデータ処理層を意味し、local-firstのDBはブラウザIndexedDBで動きます。OpenAI SDKとsecretはserver-onlyのまま`app/api/`を境界にし、Mock AIは既定値とfallbackを担当します。

再利用する画面部品を`app/`へ置かず、機能専用UIを共通`components/`へ置きません。`shared/`はReact・Dexie・OpenAI・Browser APIに依存させず、実体のないfeature folderは作りません。
