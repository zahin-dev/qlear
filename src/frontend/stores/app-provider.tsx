"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { LocalQlearRepository } from "@/backend/repositories/qlear-repository";
import type { AppSettings, AppSnapshot, CompletionOutcome, DailyReview, ExportDocument, Goal, GoalInput, PlanResult, Quest, Subquest } from "@/shared/types/domain";
import { QuestStatus } from "@/shared/types/domain";

interface AppContextValue {
  snapshot: AppSnapshot | null;
  loading: boolean;
  error?: string;
  refresh: () => Promise<void>;
  savePlan: (input: GoalInput, plan: PlanResult) => Promise<void>;
  updateGoal: (patch: Partial<Pick<Goal, "title" | "description" | "targetDate" | "availableMinutesPerDay" | "energy">>) => Promise<void>;
  updateBossHp: (hp: number) => Promise<void>;
  updateQuest: (quest: Quest, subquests?: Subquest[]) => Promise<void>;
  setQuestStatus: (id: string, status: QuestStatus) => Promise<void>;
  replaceRoute: (plan: PlanResult) => Promise<void>;
  completeQuest: (id: string, sessionId: string) => Promise<CompletionOutcome>;
  saveDailyReview: (review: DailyReview) => Promise<void>;
  updateSettings: (patch: Partial<Pick<AppSettings, "aiMode" | "animationsEnabled" | "reducedEffects">>) => Promise<void>;
  exportData: () => Promise<ExportDocument>;
  importData: (value: unknown) => Promise<void>;
  reset: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const repository = useMemo(() => new LocalQlearRepository(), []);
  const [snapshot, setSnapshot] = useState<AppSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const refresh = useCallback(async () => {
    try {
      setSnapshot(await repository.loadSnapshot());
      setError(undefined);
    } catch {
      setError("LOCAL DATAを読み込めませんでした。再読み込みしてください。");
    } finally {
      setLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    const task = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(task);
  }, [refresh]);

  const withRefresh = useCallback(async (operation: () => Promise<void>) => {
    await operation();
    await refresh();
  }, [refresh]);

  const value = useMemo<AppContextValue>(() => ({
    snapshot,
    loading,
    error,
    refresh,
    savePlan: (input, plan) => withRefresh(() => repository.savePlan(input, plan)),
    updateGoal: (patch) => withRefresh(() => repository.updateGoal(patch)),
    updateBossHp: (hp) => withRefresh(() => repository.updateBossHp(hp)),
    updateQuest: (quest, subquests) => withRefresh(() => repository.updateQuest(quest, subquests)),
    setQuestStatus: (id, status) => withRefresh(() => repository.setQuestStatus(id, status)),
    replaceRoute: (plan) => withRefresh(() => repository.replaceRoute(plan)),
    completeQuest: async (id, sessionId) => {
      const outcome = await repository.completeQuest(id, sessionId);
      await refresh();
      return outcome;
    },
    saveDailyReview: (review) => withRefresh(() => repository.saveDailyReview(review)),
    updateSettings: (patch) => withRefresh(() => repository.updateSettings(patch)),
    exportData: () => repository.exportData(),
    importData: (document) => withRefresh(() => repository.importData(document)),
    reset: () => withRefresh(() => repository.reset()),
  }), [snapshot, loading, error, refresh, repository, withRefresh]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useQlear(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error("useQlear must be used inside AppProvider");
  return context;
}
