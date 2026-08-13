# QLEAR Architecture

## Runtime shape

QLEAR uses Next.js App Router and keeps product data local-first. The only remote-AI server boundary is the route handler; IndexedDB remains in the browser behind the repository.

```mermaid
flowchart LR
  UI[App Router pages and UI] --> Context[AppProvider]
  UI --> State[Ephemeral Zustand state]
  Context --> Repo[LocalQlearRepository]
  Repo --> Dexie[(IndexedDB / Dexie)]
  UI --> Client[Browser AI client]
  Client --> Route[/api/ai/plan]
  Client -. fallback .-> Mock[MockAiPlanner]
  Route --> Select[Provider selection]
  Select --> Mock
  Select --> OpenAI[OpenAiPlanner]
```

## Boundaries

Sourceの置き場所と依存ルールは[Project Structure](../PROJECT_STRUCTURE.md)を参照してください。OpenAI SDKとcredentialはserver-onlyのままRoute Handlerの内側に置きます。Browser UIはproviderを直接呼びません。Mock plannerはoffline動作と失敗時fallbackの両方を担当します。

## Data flow

Writes are validated, then committed through a repository. Screens refresh through a small application context that queries the repository and exposes domain actions. The repository is the source of truth; Zustand never becomes a parallel domain database.

Completion is transactional: quest status, Boss HP, completion event, settings XP, and title records commit before animation. Visual failure cannot roll back completion.

## Error recovery

- Provider failure or invalid AI output: deterministic mock fallback.
- IndexedDB failure: non-destructive system message and retry path.
- Invalid import: reject the entire document before any mutation.
- Animation failure/reduced motion: apply the completion immediately and retain rewards.

## Future team migration

Repository contracts can gain an authenticated remote implementation backed by Supabase/Postgres. User ownership and workspace identifiers can be added at persistence boundaries without changing the Goal -> Boss -> Quest domain. Realtime collaboration belongs in a remote repository/event layer, not UI components. No placeholder backend code is included in the MVP.
