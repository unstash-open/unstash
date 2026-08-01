import Link from "next/link";
import { PROJECT } from "../lib/project";
import { DonationPanel } from "./components/DonationPanel";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";

const milestones = [
  {
    amount: "0—500",
    title: "Extension 0.1 hardening",
    copy: "Turn the shipped Chromium preview into a tested cross-browser release with public permission notes.",
  },
  {
    amount: "500—2K",
    title: "Reliable live capture",
    copy: "Add keyboard capture, richer metadata and safer failure recovery without a remote vault.",
  },
  {
    amount: "2—5K",
    title: "Useful resurfacing",
    copy: "Add on-device search, summaries and a daily queue without selling or training on user data.",
  },
  {
    amount: "5—10K",
    title: "Ready for everyone",
    copy: "Cross-browser QA, accessibility review, documentation and a stable v1 release.",
  },
];

const principles = [
  ["Local first", "Your links and notes stay in your browser in the current prototype."],
  ["No subscription trap", "The core product remains free and open source."],
  ["No donor advantage", "Contributions buy no equity, token, governance or financial return."],
  ["Public ledger", "The campaign wallet, cutoff date, incoming transfers and budget are visible."],
];

const testerSteps = [
  ["01", "Bring one real save", "Paste a link, capture a tab or import Reddit CSV, then choose Read, Make or Keep."],
  ["02", "Finish one next step", "Open the saved link, do the smallest useful action and mark it Done."],
  ["03", "Give one honest signal", "Choose useful, not yet or privacy concern. No account and no essay required."],
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero shell">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="live-dot" aria-hidden="true" />
              14-day activation test · live now
            </div>
            <h1>
              One tab.
              <br />
              <span>One next step.</span>
            </h1>
            <p className="hero-lead">
              Capture the current tab or import your Reddit saves. Choose
              Read, Make or Keep, then act on it from a private local queue.
            </p>
            <div className="hero-actions">
              <Link className="button button-dark" href="/beta">
                Run the 5-minute test
                <span aria-hidden="true">↗</span>
              </Link>
              <Link className="button button-ghost" href="/extension">
                Install extension 0.1
              </Link>
            </div>
            <p className="microcopy">
              No signup, cookies or remote vault. The test records only
              anonymous route-level progress; saved links stay on this device.
            </p>
          </div>

          <div className="hero-product" aria-label="Preview of the Unstash workflow">
            <div className="product-window">
              <div className="window-bar">
                <div className="brand-chip">
                  <span className="brand-mark">U</span>
                  <span>unstash</span>
                </div>
                <span className="window-state">3 ready</span>
              </div>
              <div className="queue-heading">
                <div>
                  <small>YOUR QUEUE</small>
                  <h2>Make one save useful.</h2>
                </div>
                <span className="date-chip">Today</span>
              </div>
              <article className="saved-card card-yellow">
                <div className="saved-meta">
                  <span>r/learnprogramming</span>
                  <span>8 min</span>
                </div>
                <h3>A practical guide I saved three weeks ago</h3>
                <div className="next-action">
                  <span>Next action</span>
                  <strong>Try the first exercise</strong>
                  <span aria-hidden="true">→</span>
                </div>
              </article>
              <div className="mini-card-row">
                <article className="mini-card">
                  <span className="mini-tag blue">READ</span>
                  <strong>Design systems that scale</strong>
                  <small>Tomorrow · 12 min</small>
                </article>
                <article className="mini-card">
                  <span className="mini-tag coral">MAKE</span>
                  <strong>A tiny weekend project</strong>
                  <small>Saturday · 40 min</small>
                </article>
              </div>
            </div>
            <div className="floating-note note-one">private by default</div>
            <div className="floating-note note-two">save → act</div>
          </div>
        </section>

        <section className="ticker" aria-label="Project principles">
          <div className="ticker-track">
            <span>OPEN SOURCE</span><i>✦</i>
            <span>LOCAL FIRST</span><i>✦</i>
            <span>ACTIVETAB ONLY</span><i>✦</i>
            <span>NO HOST ACCESS</span><i>✦</i>
            <span>REDDIT CSV IMPORT</span><i>✦</i>
          </div>
        </section>

        <section className="problem-section shell" id="project">
          <div className="section-kicker">01 · THE PROBLEM</div>
          <div className="problem-grid">
            <h2>The internet&apos;s quiet junk drawer.</h2>
            <div className="problem-copy">
              <p>
                Saving feels productive. Then the post disappears into a list
                with no context, no next step and no reason to return.
              </p>
              <div className="loop-diagram" aria-label="The current saved-post loop">
                <span>SAVE</span><b>→</b><span>FORGET</span><b>→</b><span>REPEAT</span>
              </div>
            </div>
          </div>
        </section>

        <section className="workflow-section">
          <div className="shell">
            <div className="section-heading">
              <div>
                <div className="section-kicker">02 · THE PRODUCT</div>
                <h2>A small loop that closes.</h2>
              </div>
              <p>
                Unstash adds the one thing bookmarks are missing: an intended
                action and a moment to resurface it.
              </p>
            </div>

            <div className="workflow-grid">
              <article className="workflow-card">
                <span className="step-number">1</span>
                <div className="workflow-visual import-visual">
                  <div className="tiny-save">reddit.com/r/…</div>
                  <div className="cursor-arrow">↘</div>
                  <div className="unstash-box">UNSTASH</div>
                </div>
                <h3>Bring it in</h3>
                <p>Capture the active tab, paste a link or import Reddit&apos;s saved-post CSV.</p>
              </article>
              <article className="workflow-card featured">
                <span className="step-number">2</span>
                <div className="workflow-visual action-visual">
                  <span>What will you do?</span>
                  <strong>Try the checklist</strong>
                  <div className="action-options">
                    <i>READ</i><i>MAKE</i><i>KEEP</i>
                  </div>
                </div>
                <h3>Name the action</h3>
                <p>Turn “someday” into one useful, concrete next step.</p>
              </article>
              <article className="workflow-card">
                <span className="step-number">3</span>
                <div className="workflow-visual resurface-visual">
                  <div className="sun">✦</div>
                  <strong>Ready for today</strong>
                  <span>8 minutes · Read</span>
                </div>
                <h3>See it again</h3>
                <p>A calm daily queue resurfaces the right save at the right time.</p>
              </article>
            </div>

            <div className="prototype-callout">
              <div>
                <span className="status-pill">WORKS NOW</span>
                <h3>The local prototype and extension are live.</h3>
                <p>
                  Import Reddit CSV files, add links, choose an action, search
                  your queue and export it. Extension 0.1 adds active-tab
                  capture with no host permissions.
                </p>
              </div>
              <Link className="button button-light" href="/extension">
                Install extension <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="demo-section" id="demo">
          <div className="shell demo-layout">
            <div className="demo-copy">
              <div className="section-kicker">03 · THE PROOF</div>
              <span className="status-pill">AI-PRODUCED · REAL PRODUCT UI</span>
              <h2>See the private workflow in 29 seconds.</h2>
              <p>
                The graphics and voice are synthetic. The screens and workflow
                are the real product: capture a tab or import Reddit CSV, choose
                an action, search the queue and finish a save.
              </p>
              <Link className="button button-light" href="/prototype">
                Try the importer <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="demo-player">
              <video
                controls
                playsInline
                preload="metadata"
                poster="/og-reddit-import.png"
              >
                <source src="/unstash-demo.mp4" type="video/mp4" />
                <track
                  default
                  kind="captions"
                  src="/unstash-demo.vtt"
                  srcLang="en"
                  label="English"
                />
                Your browser does not support the demo video.
              </video>
              <p>29 sec · synthetic voice · captions included</p>
            </div>
          </div>
        </section>

        <section className="tester-section shell" id="test">
          <div className="tester-heading">
            <div>
              <div className="section-kicker">04 · 14-DAY BETA</div>
              <h2>Prove one save can become one finished action.</h2>
            </div>
            <div className="tester-intro">
              <span className="status-pill">NO WAITLIST · NO ACCOUNT</span>
              <p>
                This is an activation test, not a launch. The target is five
                independent starts, three completed saves and two honest
                “worth resurfacing” signals before more features are built.
              </p>
            </div>
          </div>
          <div className="tester-steps">
            {testerSteps.map(([number, title, copy]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
          <div className="tester-actions">
            <Link className="button button-dark" href="/beta">
              Start the guided test <span aria-hidden="true">→</span>
            </Link>
            <a
              className="button button-ghost"
              href={PROJECT.feedbackUrl}
              rel="noreferrer"
              target="_blank"
            >
              Report what broke <span aria-hidden="true">↗</span>
            </a>
            <p>
              Feedback is public by default. Do not include private links,
              exported Reddit data or personal information.
            </p>
          </div>
        </section>

        <section className="funding-section shell" id="fund">
          <div className="funding-intro">
            <div className="section-kicker">05 · OPTIONAL FUNDING</div>
            <h2>Fund one useful upgrade.</h2>
            <p>
              The permission-free CSV importer and Chromium extension preview
              shipped before the first contribution. The active 500 USDT target
              now funds cross-browser hardening and store-ready packaging. The
              broader 10,000 USDT roadmap stays public.
            </p>
          </div>

          <div className="funding-layout">
            <DonationPanel />
            <div>
              <article className="active-milestone">
                <span className="status-pill">EXTENSION 0.1 SHIPPED · MILESTONE 01</span>
                <h3>From developer preview to cross-browser release</h3>
                <p>
                  Local Reddit CSV import and one-click active-tab capture now
                  work without an account or remote vault. Funding covers
                  Firefox packaging, automated browser tests, failure recovery
                  and a public permission audit.
                </p>
                <div className="delivery-target">
                  <span>Target</span>
                  <strong>Cross-browser release within 7 days after funding</strong>
                </div>
              </article>
              <div className="milestones">
                {milestones.map((milestone) => (
                  <article className="milestone" key={milestone.amount}>
                    <span>{milestone.amount} USDT</span>
                    <div>
                      <h3>{milestone.title}</h3>
                      <p>{milestone.copy}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="principles-section">
          <div className="shell">
            <div className="section-heading inverse">
              <div>
                <div className="section-kicker">06 · THE PROMISE</div>
                <h2>Trust is a feature.</h2>
              </div>
              <Link className="text-link light-link" href="/transparency">
                Read the full funding policy <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="principles-grid">
              {principles.map(([title, copy], index) => (
                <article key={title}>
                  <span>0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="revenue-service-section shell">
          <div>
            <span className="status-pill">NEW · PAID SECURITY SERVICE</span>
            <div className="section-kicker">07 · REPOSITORY REVIEW</div>
            <h2>Ship with fewer security unknowns.</h2>
            <p>
              A fixed-scope, human-verified GitHub repository audit: complete
              inventory, local reproduction, remediation direction and no
              production exploitation. Paid engagements start at $490.
            </p>
          </div>
          <Link className="button button-dark" href="/security-audit">
            Review a repository <span aria-hidden="true">→</span>
          </Link>
        </section>

        <section className="faq-section shell" id="faq">
          <div className="section-kicker">08 · STRAIGHT ANSWERS</div>
          <div className="faq-layout">
            <h2>Before you contribute.</h2>
            <div className="faq-list">
              <details>
                <summary>Is this a charity or an investment?</summary>
                <p>
                  Neither. It is voluntary crowdfunding for an independently
                  operated open-source software project. Contributions are not
                  tax-deductible and provide no ownership, token, profit or return.
                </p>
              </details>
              <details>
                <summary>Where does the money go?</summary>
                <p>
                  To development time, design and accessibility work, testing,
                  infrastructure and documentation according to the public budget.
                  Any material change will be posted before funds are reassigned.
                </p>
              </details>
              <details>
                <summary>What if the target is not reached?</summary>
                <p>
                  Work ships milestone by milestone. Reaching a threshold funds
                  that scope; the live prototype and published source remain
                  available even if the full 10,000 USDT is not raised.
                </p>
              </details>
              <details>
                <summary>Can I help without sending money?</summary>
                <p>
                  Yes. Test the prototype, report bugs, improve documentation or
                  share thoughtful feedback. Those contributions are just as real.
                </p>
              </details>
              <details>
                <summary>Does the site track visitors?</summary>
                <p>
                  The product never uploads saved links or queue contents. The
                  public site records anonymous, cookie-free page views at the
                  route level so we can distinguish visits to the landing page,
                  prototype and extension. Query strings and URL fragments are
                  removed before analytics are sent.
                </p>
              </details>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
