import { type AiPlanner, type AlternativeResult, type DailyReviewResult, type DifficultyInput, type ReplanInput } from "@/backend/ai/contracts";
import { DAMAGE_BY_DIFFICULTY } from "@/shared/domain/gamification/core";
import { buildSchedule } from "@/shared/domain/scheduling/schedule";
import { Difficulty, type AppSnapshot, type GoalInput, type PlanQuest, type PlanResult, QuestStatus } from "@/shared/types/domain";

type Category = "study" | "career" | "development" | "writing" | "personal" | "general";

const CATEGORY_PATTERNS: Array<[Category, RegExp]> = [
  ["study", /試験|資格|勉強|学習|受験|study|exam/i],
  ["career", /転職|就活|面接|ポートフォリオ|career|job/i],
  ["development", /開発|アプリ|web|サービス|mvp|リリース|code|deploy/i],
  ["writing", /論文|記事|本|執筆|企画書|write|paper/i],
  ["personal", /引っ越|旅行|生活|部屋|健康|move|personal/i],
];

const TEMPLATES: Record<Category, Array<[string, string, number, Difficulty]>> = {
  study: [
    ["試験範囲を3ブロックに分ける", "教材と出題範囲を確認し、攻略順を決める。", 20, Difficulty.EASY],
    ["最重要ブロックを1セット解く", "理解度を測り、間違いを記録する。", 45, Difficulty.NORMAL],
    ["弱点だけの復習ルートを作る", "誤答から次に集中する範囲を決める。", 30, Difficulty.NORMAL],
  ],
  career: [
    ["伝える強みを3つに絞る", "目標に直結する経験を短く言語化する。", 25, Difficulty.EASY],
    ["核となる成果ページを仕上げる", "背景・行動・成果が伝わる状態にする。", 55, Difficulty.HARD],
    ["第三者目線で公開前チェックする", "読みやすさと不足情報を確認する。", 30, Difficulty.NORMAL],
  ],
  development: [
    ["MVPの機能を3つに絞る", "完成の定義と、今作らないものを決める。", 25, Difficulty.EASY],
    ["主要画面を完成させる", "中心フローを最初から最後まで通す。", 60, Difficulty.HARD],
    ["公開前チェックを実施する", "品質・設定・導線を確認して修正する。", 35, Difficulty.NORMAL],
  ],
  writing: [
    ["見出しを3つ決める", "主張の順序が見える最小構成を作る。", 20, Difficulty.EASY],
    ["中心セクションの初稿を書く", "完成度より流れを優先して書き切る。", 50, Difficulty.HARD],
    ["根拠と結論を整える", "不足する出典と論理の飛躍を修正する。", 35, Difficulty.NORMAL],
  ],
  personal: [
    ["完了条件をチェックリスト化する", "終わったと判断できる状態を決める。", 20, Difficulty.EASY],
    ["最も影響の大きい手配を終える", "後続を止める依存タスクを片付ける。", 40, Difficulty.NORMAL],
    ["残りを30分単位へ分ける", "次に迷わない実行順へ並べる。", 25, Difficulty.EASY],
  ],
  general: [
    ["ゴールの完了条件を3つ決める", "何が揃えば終わりかを具体化する。", 20, Difficulty.EASY],
    ["最大の不確実要素を一つ潰す", "進行を止める曖昧さを検証する。", 45, Difficulty.HARD],
    ["次の成果物を完成状態にする", "目に見える一単位を最後まで仕上げる。", 35, Difficulty.NORMAL],
  ],
};

function hashText(value: string): number {
  return Array.from(value).reduce((hash, character) => ((hash << 5) - hash + character.charCodeAt(0)) | 0, 0);
}

function categoryFor(title: string): Category {
  return CATEGORY_PATTERNS.find(([, pattern]) => pattern.test(title))?.[0] ?? "general";
}

function scopeFor(title: string, targetDate?: string): 1 | 2 | 3 | 4 | 5 {
  const longGoal = title.length > 35 ? 1 : 0;
  const highScope = /完成|合格|リリース|引っ越|転職|論文|launch|finish/i.test(title) ? 1 : 0;
  const dated = targetDate ? 1 : 0;
  return Math.min(5, Math.max(1, 2 + longGoal + highScope + dated)) as 1 | 2 | 3 | 4 | 5;
}

const HP_BY_SCOPE = { 1: 100, 2: 200, 3: 300, 4: 500, 5: 800 } as const;

export class MockAiPlanner implements AiPlanner {
  async createPlan(input: GoalInput): Promise<PlanResult> {
    const category = categoryFor(input.title);
    const scopeLevel = scopeFor(input.title, input.targetDate);
    const offset = Math.abs(hashText(input.title)) % 3;
    const source = TEMPLATES[category];
    const ordered = [source[offset], source[(offset + 1) % 3], source[(offset + 2) % 3]];
    const schedules = buildSchedule(
      ordered.map((item, index) => ({ estimatedMinutes: item?.[2] ?? 30, priority: 5 - index })),
      { targetDate: input.targetDate, availableMinutesPerDay: input.availableMinutesPerDay },
    );
    const quests = ordered.map((item, index): PlanQuest => {
      const [title, description, minutes, difficulty] = item ?? TEMPLATES.general[index]!;
      return {
        title,
        description: `${description} — ${input.title}`,
        difficulty,
        estimatedMinutes: minutes,
        priority: 5 - index,
        damage: DAMAGE_BY_DIFFICULTY[difficulty],
        scheduledFor: schedules[index],
        dueAt: input.targetDate,
        source: "AI",
        aiReason: index === 0 ? "短時間で終わり、次の行動を明確にできる。" : index === 1 ? "ゴールの中心成果に直接つながる。" : "残りの不確実性を減らし、完了へ近づく。",
        subquests: difficulty === Difficulty.HARD ? [
          { title: "必要な材料を集める", estimatedMinutes: 10 },
          { title: "最小の完成形を作る", estimatedMinutes: Math.max(15, minutes - 10) },
        ] : [],
      };
    }) as [PlanQuest, PlanQuest, PlanQuest];

    return {
      scopeLevel,
      bossTitle: input.title,
      maxHp: HP_BY_SCOPE[scopeLevel],
      quests,
      summary: "勢いを作る小さなCLEARから、中心成果、仕上げの順に攻略します。",
    };
  }

  async estimateDifficulty(input: DifficultyInput): Promise<Difficulty> {
    const score = (input.estimatedMinutes ?? 30) / 20 + (input.dependencies ?? 0) + (input.ambiguity ?? 0);
    if (score >= 7) return Difficulty.BOSS;
    if (score >= 4) return Difficulty.HARD;
    if (score >= 2) return Difficulty.NORMAL;
    return Difficulty.EASY;
  }

  async replan(input: ReplanInput): Promise<PlanResult> {
    const plan = await this.createPlan(input.goal);
    return {
      ...plan,
      maxHp: Math.max(100, input.remainingBossHp),
      quests: plan.quests.map((quest, index) => ({
        ...quest,
        title: index === 0 ? `次の一手：${quest.title}` : quest.title,
        source: "REPLAN",
      })) as [PlanQuest, PlanQuest, PlanQuest],
      summary: "完了済みの流れを維持し、残りHPに合わせて次の3件を再構成しました。",
    };
  }

  async suggestAlternatives(quest: import("@/shared/types/domain").Quest): Promise<AlternativeResult> {
    const base = quest.title.replace(/完成させる|実施する|仕上げる/g, "進める");
    return { alternatives: [
      { title: `まず「${base}」の見出しを3つ決める`, description: "完成させず、骨組みだけを作る。", estimatedMinutes: 10, reason: "着手コストを下げられる。" },
      { title: `${base}ための材料を一箇所に集める`, description: "判断せず、必要な情報だけを集約する。", estimatedMinutes: 15, reason: "迷いを減らして次へつなげる。" },
      { title: `${base}最小版を15分だけ作る`, description: "品質より、動く・読める最小形を優先する。", estimatedMinutes: 15, reason: "小さなCLEARを作りやすい。" },
    ] };
  }

  async createDailyReview(snapshot: AppSnapshot): Promise<DailyReviewResult> {
    const today = new Date().toISOString().slice(0, 10);
    const events = snapshot.completionEvents.filter((event) => event.completedAt.startsWith(today));
    const ready = snapshot.quests.find((quest) => quest.status !== QuestStatus.CLEARED);
    return {
      review: events.length >= 3 ? "小さいタスクから勢いを作り、3つ以上をCLEARできた。" : events.length ? "一つのCLEARで、目標を確実に前へ進めた。" : "今日は次の一手を選べる状態まで整っている。",
      next: ready ? `次は「${ready.title}」から始める。` : "次の作戦を組み直す。",
    };
  }
}
