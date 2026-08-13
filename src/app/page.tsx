import Link from "next/link";
import { Logo } from "@/frontend/components/brand/logo";
import { LandingSlideDeck } from "@/frontend/features/landing/components/LandingSlideDeck";

const PREVIEW_QUESTS = [
  ["01", "MVPの機能を3つに絞る", "EASY", "25 MIN", "8 DMG"],
  ["02", "主要画面を完成させる", "HARD", "60 MIN", "22 DMG"],
  ["03", "公開前チェックを実施する", "NORMAL", "35 MIN", "14 DMG"],
];

const CORE_LOOP = [
  ["01", "GOAL", "終わらせたい大きな目標"],
  ["02", "AI PLAN", "規模と依存関係を解析"],
  ["03", "3 QUESTS", "次に進む3つへ分解"],
  ["04", "SMASH", "今やる一つに集中"],
  ["05", "DAMAGE", "CLEARが目標を削る"],
] as const;

const AI_FLOW = ["ANALYZING GOAL", "ESTIMATING SCOPE", "GENERATING 3 QUESTS", "READY"] as const;

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="landing-nav" data-testid="landing-header">
        <div className="landing-nav__inner">
          <Logo />
          <nav className="landing-nav__links" aria-label="Landing navigation"><a href="#how">SYSTEM</a><a href="#clear">CLEAR</a><Link className="button button--primary button--small" href="/setup">目標を攻略する</Link></nav>
        </div>
      </header>
      <LandingSlideDeck>
        <section className="hero landing-slide" data-landing-slide data-testid="landing-section-0">
          <div className="hero__copy">
            <span className="system-label">AI-POWERED QUEST PRODUCTIVITY // SYSTEM READY</span>
            <h1 aria-label="クエストであなたの目標を攻略！">クエストで<br /><em>あなたの目標を攻略！</em></h1>
            <p className="hero__sub">AIが分ける。あなたが終わらせる。</p>
            <p className="hero__description">QLEARは、大きな目標をAIが3つのクエストへ分解し、今やるべき一つを選び、終えるたびに目標を前へ進めるタスク攻略アプリ。</p>
            <div className="hero__actions"><Link className="button button--primary button--large" href="/setup">目標を攻略する <span>→</span></Link><a className="button button--secondary button--large" href="#how">仕組みを見る</a></div>
            <div className="hero__status"><span>NO ACCOUNT</span><span>LOCAL FIRST</span><span>3 QUEST FOCUS</span></div>
          </div>
          <div className="command-preview" aria-label="QLEAR Command Center preview" data-testid="landing-preview">
            <span className="command-preview__boundary command-preview__boundary--top" data-testid="landing-preview-top-line" aria-hidden="true" />
            <div className="command-preview__chrome"><span>QLEAR // COMMAND CENTER</span><span className="status-dot">ONLINE</span></div>
            <div className="command-preview__goal"><span className="system-label">ACTIVE GOAL</span><strong>個人Webサービスをリリースする</strong></div>
            <div className="preview-boss">
              <div><span className="system-label">BOSS // ACTIVE TARGET</span><span>62% REMAIN</span></div>
              <h3>WEB SERVICE RELEASE</h3>
              <div className="preview-boss__hp"><span>HP</span><strong>186 / 300</strong></div>
              <div className="hp-track"><i style={{ width: "62%" }} /><span /></div>
              <small>114 TOTAL DAMAGE</small>
            </div>
            <div className="preview-quests">
              {PREVIEW_QUESTS.map(([number, title, difficulty, time, damage]) => (
                <div className={number === "01" ? "is-recommended" : undefined} key={number}>
                  <span>{number}</span><strong>{title}</strong><small>{`${difficulty} / ${time} / ${damage}`}</small>
                </div>
              ))}
            </div>
            <div className="command-preview__scan">NEXT ACTION // QUEST 01 RECOMMENDED</div>
            <span className="command-preview__boundary command-preview__boundary--bottom" data-testid="landing-preview-bottom-line" aria-hidden="true" />
          </div>
        </section>

        <section id="how" className="landing-section landing-section--how landing-slide" data-landing-slide data-testid="landing-section-1">
          <div className="section-heading"><span className="system-label">CORE LOOP // 01</span><h2>ゴールを、<br />攻略可能な流れへ。</h2><p>大量のToDoは見せない。QLEARが選ぶのは、次に進むための3つだけ。</p></div>
          <div className="loop-grid">
            {CORE_LOOP.map(([number, label, text]) => (
              <article key={number}>
                <span>{number}</span><div className="loop-grid__glyph" aria-hidden="true">{number === "05" ? "▰" : "□"}</div><h3>{label}</h3><p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="clear" className="landing-section clear-section landing-slide" data-landing-slide data-testid="landing-section-2">
          <div className="clear-demo" aria-hidden="true">
            <span className="clear-demo__label">QUEST CLEAR</span>
            <div className="clear-demo__card"><span>✓</span><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
            <div className="clear-demo__impact"><small>BOSS DAMAGE</small><strong>-22</strong></div>
            <div className="clear-demo__bar"><span>BOSS HP // 62%</span><div><i /></div></div>
            <div className="clear-demo__next">XP +220 // COMBO x3 // NEXT QUEST READY</div>
          </div>
          <div className="section-heading"><span className="system-label">SIGNATURE EXPERIENCE // 02</span><h2>チェックでは終わらない。<br /><em>CLEARを、報酬にする。</em></h2><p>カードがピクセルへ崩れ、圧縮され、BOSS HPへ飛ぶ。Damage、XP、Comboまで、一つの完了体験として返ってくる。</p><ul><li>DIGITAL CRUMPLE</li><li>BOSS DAMAGE</li><li>XP + COMBO</li><li>CLEAR TITLE</li></ul></div>
        </section>

        <section id="ai" className="landing-section ai-section landing-slide" data-landing-slide data-testid="landing-section-3">
          <div className="section-heading"><span className="system-label">TACTICAL AI // 03</span><h2>AIは話さない。<br />次の一手を整える。</h2><p>QLEARのAIはチャット画面ではなく、計画・難易度・所要時間・別ルート・再計画として裏側で働く。</p></div>
          <div className="ai-terminal">
            <div className="ai-terminal__line"><span>INPUT</span><strong>大きすぎる目標</strong></div>
            <div className="ai-terminal__flow">
              {AI_FLOW.map((step, index) => <div className="ai-terminal__step" key={step}><i className={index === AI_FLOW.length - 1 ? "is-on" : undefined} /><span>{step}</span></div>)}
            </div>
            <div className="ai-terminal__result"><span>RECOMMENDED</span><strong>QUEST 01</strong><p>短時間で終わり、次のQuestを解放できる。</p></div>
          </div>
        </section>

        <section id="start" className="landing-final landing-slide" data-landing-slide data-testid="landing-section-4">
          <div className="final-cta"><span className="system-label">TARGET LOCK AVAILABLE</span><h2>終わらせたい目標は、<br />何ですか？</h2><p>最初の目標を入力して、攻略を始めよう。</p><Link className="button button--primary button--large" href="/setup">QLEARを始める <span>→</span></Link></div>
          <footer className="landing-footer"><Logo compact /><span>© 2026 QLEAR // CLEAR IS THE HERO.</span></footer>
        </section>
      </LandingSlideDeck>
    </div>
  );
}
