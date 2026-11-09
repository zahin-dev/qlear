# Project Structure

QLEARのコードは4つに分かれます。

- `app`: URLとページ。
- `frontend`: ユーザーが見るもの。
- `backend`: AIとデータ処理。
- `shared`: FrontendとBackendの両方で使う共通処理。

この4分類を覚えれば、Explorerだけでほとんどの配置を判断できます。QLEARは分割された複数アプリではなく、1つのNext.jsフルスタックアプリです。実行時の設計は[Architecture](architecture/ARCHITECTURE.md)に分離しています。

## Repository Overview

```text
qlear-ai/
├── .vscode/
│   └── settings.json
├── docs/
│   ├── ai/
│   ├── architecture/
│   ├── assets/
│   │   └── readme/
│   ├── design/
│   ├── requirements/
│   ├── testing/
│   ├── PROJECT_STRUCTURE.md
│   └── README.md
├── src/
│   ├── app/
│   │   ├── api/ai/plan/route.ts
│   │   ├── dashboard/page.tsx
│   │   ├── quests/page.tsx
│   │   ├── review/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── setup/page.tsx
│   │   ├── smash/page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── frontend/
│   │   ├── components/
│   │   │   ├── brand/
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   ├── features/
│   │   │   ├── boss/
│   │   │   ├── gamification/
│   │   │   ├── planning/
│   │   │   └── quests/
│   │   ├── stores/
│   ├── backend/
│   │   ├── ai/
│   │   ├── db/
│   │   └── repositories/
│   ├── shared/
│   │   ├── domain/
│   │   │   ├── gamification/
│   │   │   └── scheduling/
│   │   ├── types/
│   │   ├── utils/
│   │   └── validation/
│   └── README.md
├── public/
│   └── qlear-logo.png
├── tests/
│   ├── e2e/
│   ├── integration/
│   ├── unit/
│   ├── README.md
│   └── setup.ts
├── .env.example
├── .gitignore
├── AGENTS.md
├── eslint.config.mjs
├── LICENSE
├── next-env.d.ts
├── next.config.ts
├── package.json
├── playwright.config.ts
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.mjs
├── README.md
├── tsconfig.json
└── vitest.config.ts
```

Generated output such as `.next/`, coverage, Playwright reports, logs, and TypeScript build information does not belong in the source tree. `public/` contains the application logo, and `docs/assets/readme/` contains stable README screenshots. A root `scripts/` directory is not currently needed.

## Root Files

標準Toolが自動で見つけられるよう、次の設定ファイルはProject Rootに置きます。VS Codeでは`.vscode/settings.json`のFile Nestingにより関連ファイルだけを折りたたんで表示します。

| File | 初心者向けの役割 |
| --- | --- |
| `package.json` | 使用ライブラリと`pnpm`で実行できるcommandを定義します。 |
| `pnpm-lock.yaml` | 全員が同じライブラリversionを使えるよう固定します。 |
| `pnpm-workspace.yaml` | pnpmのworkspaceと依存ライブラリのbuild設定を定義します。 |
| `next.config.ts` | Next.js全体の動作を設定します。 |
| `tsconfig.json` | TypeScriptの型チェック方法とimport aliasを設定します。 |
| `next-env.d.ts` | Next.jsが自動生成するTypeScript向けの型設定です。 |
| `eslint.config.mjs` | コード品質チェックのルールを設定します。 |
| `postcss.config.mjs` | CSSをbuildするときの処理を設定します。 |
| `playwright.config.ts` | ブラウザを使うE2Eテストを設定します。 |
| `vitest.config.ts` | Unit・Integrationテストを設定します。 |
| `.env.example` | 起動に利用できる環境変数の見本です。Secret本体は含めません。 |
| `.gitignore` | Gitで管理しないgenerated fileやsecretを指定します。 |
| `AGENTS.md` | AI Coding AgentがこのProjectで守るルールです。 |
| `LICENSE` | QLEARへ適用するMIT Licenseの条件です。 |
| `README.md` | QLEARの概要、構造、起動方法を案内する入口です。 |
| `.vscode/settings.json` | QLEARをVS Codeで開いたときのExplorer表示だけを整理します。 |

## Where Should New Code Go?

| New code | Location |
| --- | --- |
| New route or screen entry | `src/app/<route>/page.tsx` |
| Shared Button or UI primitive | `src/frontend/components/ui/` |
| Quest-only component | `src/frontend/features/quests/components/` |
| Frontend-wide Zustand or Context state | `src/frontend/stores/` |
| New AI provider | `src/backend/ai/providers/` |
| New repository implementation | `src/backend/repositories/` |
| Shared pure calculation | `src/shared/domain/<topic>/` |
| Shared type or validation | `src/shared/types/` or `src/shared/validation/` |
| New E2E test | `tests/e2e/*.spec.ts` |
| New pure unit test | `tests/unit/*.test.ts(x)` |
| New repository/database test | `tests/integration/*.test.ts` |

`src/app/`はNext.jsのURL・Page・Layout・Route Handler、`src/frontend/`はUI、`src/backend/`はAIとデータ処理、`src/shared/`は環境に依存しない共通コードです。`docs/`は設計資料、`tests/`はテストだけを置きます。

## Dependency Rules

The preferred direction is `app -> frontend/backend/shared`, `frontend -> shared`, and `backend -> shared`.

- `shared` must not import `frontend` or `backend`.
- `backend` must not import React pages or components.
- Server-only AI code must enter through `src/app/api/` or another server boundary.
- The local-first Frontend may use the browser-safe Repository/IndexedDB layer; it must never import the server-only OpenAI adapter.
- Avoid direct cross-feature imports; promote genuinely shared responsibilities to a clearly named shared module.
- Do not add barrel files that hide dependency edges.
- File movement must not change IndexedDB names, table names, versions, or storage keys.

Avoid generic `common`・`misc`・`helpers` folders、空folder、backup copy、不要なbarrel file、generated reportをsourceとして残すこと。TestはUnit/Integrationが`*.test.ts(x)`、E2Eが`*.spec.ts`です。
