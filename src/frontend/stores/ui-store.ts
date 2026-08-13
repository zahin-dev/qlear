import { create } from "zustand";
import type { CompletionOutcome } from "@/shared/types/domain";

interface UiState {
  selectedQuestId?: string;
  smashSessionId: string;
  completion?: CompletionOutcome;
  systemMessage?: string;
  selectQuest: (id?: string) => void;
  setCompletion: (completion?: CompletionOutcome) => void;
  setSystemMessage: (message?: string) => void;
  newSmashSession: () => void;
}

function sessionId(): string {
  return `smash_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export const useUiStore = create<UiState>((set) => ({
  smashSessionId: sessionId(),
  selectQuest: (selectedQuestId) => set({ selectedQuestId }),
  setCompletion: (completion) => set({ completion }),
  setSystemMessage: (systemMessage) => set({ systemMessage }),
  newSmashSession: () => set({ smashSessionId: sessionId(), completion: undefined }),
}));
