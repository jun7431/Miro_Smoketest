from html import escape
from pathlib import Path

SITE_URL = "https://miro-smoketest.vercel.app"
ROOT = Path(__file__).resolve().parents[1]

FAQS = [
    ("What is Miro?", "Miro is an early-access Korea local travel recommendation product for international travelers. It helps visitors think through where to go next using area, time, mood, and local context."),
    ("Who is Miro for?", "Miro is for international travelers in Korea who want practical, local-feeling recommendations without spending too much time comparing tabs, maps, feeds, and generic lists."),
    ("How is Miro different from generic travel apps?", "Miro is positioned around situation fit. Instead of starting with broad popularity, it starts with what area you are in, how much time you have, and what kind of moment you want."),
    ("Does Miro use AI?", "Miro may use AI-style logic as the product develops, but the current site is an early-access preview. The important direction is context-aware recommendations grounded in local signals, not generic AI-only output."),
    ("What kind of places does Miro recommend?", "Miro is designed around places that fit a traveler's current situation, including cafes, food stops, walks, browse stops, and local-feeling routes. It does not claim every recommendation is hidden or unknown."),
    ("Is Miro only for Seoul?", "The current preview focuses on Seoul because it is a clear first use case. The broader product idea is Korea local travel recommendations for international visitors."),
    ("Is Miro free?", "Joining the early-access list is free. The stronger-interest path is separate and exists to measure whether some visitors would pay for priority access later."),
    ("How does Miro decide what fits a situation?", "The product direction is to combine context such as area, time, and vibe with grounded local signals so the answer feels useful in the moment."),
    ("Can first-time visitors use it?", "Yes. Miro is especially meant for visitors who do not already know which local sources or neighborhoods to trust."),
    ("Why not just use Google Maps or Reddit?", "Those tools can be useful, but they often require manual synthesis. Miro is focused on turning scattered signals into a smaller, situation-aware next move."),
]

COMPARES = [
    {
        "slug": "miro-vs-klook",
        "title": "Miro vs Klook: local discovery vs activity booking",
        "meta": "Miro vs Klook | Local discovery vs activity booking",
        "desc": "A fair comparison of Miro and Klook for travelers deciding between context-aware local discovery and booking-focused travel marketplaces.",
        "alt": "Klook",
        "intro": "Klook is useful when you want bookable activities, tickets, tours, and travel products. Miro is aimed at a different moment: deciding what local-feeling place or mini-route fits your situation right now.",
        "rows": [
            ("Main job", "Context-aware local recommendations and route-like decisions.", "Booking activities, tickets, passes, and travel services."),
            ("Good fit", "Choosing what to do nearby based on area, time, and mood.", "Buying a specific activity or reserving a structured experience."),
            ("Decision style", "Smaller set of choices shaped by context and local signals.", "Marketplace browsing with many bookable options."),
            ("Current truth", "Early-access preview with a sample demo and signup flow.", "Established booking marketplace."),
        ],
        "miro_fit": "Miro is a better fit when you are already in Korea and need a practical next move, not a ticket checkout. It is especially relevant when you want a local-feeling cafe, food stop, walk, or compact route that fits your time and mood.",
        "alt_fit": "Klook may be a better fit when you already know you want a specific tour, attraction ticket, airport transfer, pass, or bookable activity.",
    },
    {
        "slug": "miro-vs-tripadvisor",
        "title": "Miro vs Tripadvisor: context fit vs review breadth",
        "meta": "Miro vs Tripadvisor | Context fit vs review breadth",
        "desc": "A fair comparison of Miro and Tripadvisor for travelers choosing between context-aware Korea recommendations and broad review inventory.",
        "alt": "Tripadvisor",
        "intro": "Tripadvisor is strong when you want broad review inventory and many traveler opinions. Miro is focused on a narrower question: what fits this Korea travel moment based on local context and situation.",
        "rows": [
            ("Main job", "Narrow recommendations by area, time, vibe, and local fit.", "Browse large volumes of reviews, rankings, and traveler opinions."),
            ("Good fit", "A quick decision when you do not want another long list.", "Researching well-known attractions, hotels, and restaurants broadly."),
            ("Decision style", "Context-first and selective.", "Review-first and breadth-oriented."),
            ("Current truth", "Early-access preview with an MVP demo.", "Mature review and planning platform."),
        ],
        "miro_fit": "Miro is a better fit when review volume is not enough and you need a smaller answer that matches where you are, how much time you have, and what kind of mood you want.",
        "alt_fit": "Tripadvisor may be a better fit when you want broad traveler reviews, hotel research, major attraction context, or a wider search inventory.",
    },
    {
        "slug": "miro-vs-google-maps-and-reddit",
        "title": "Miro vs Google Maps and Reddit: synthesis vs manual research",
        "meta": "Miro vs Google Maps and Reddit | Synthesis vs manual research",
        "desc": "A fair comparison of Miro, Google Maps, and Reddit for travelers who need local Korea recommendations without manual research overload.",
        "alt": "Google Maps and Reddit",
        "intro": "Google Maps and Reddit are useful research sources, but they often leave travelers doing the synthesis themselves. Miro is focused on turning scattered signals into a smaller, context-aware next move.",
        "rows": [
            ("Main job", "Synthesize context into a usable recommendation direction.", "Find places, routes, threads, comments, and opinions manually."),
            ("Good fit", "When you want fewer choices and less tab switching.", "When you enjoy deeper manual research or need exact map logistics."),
            ("Decision style", "Area, time, vibe, and local-signal fit.", "Search, compare, save, and cross-check across sources."),
            ("Current truth", "Early-access preview, not a complete replacement for maps or forums.", "Large, established tools with different strengths."),
        ],
        "miro_fit": "Miro is a better fit when you do not want to combine map pins, Reddit threads, social posts, and blog notes by hand before choosing one next move.",
        "alt_fit": "Google Maps and Reddit may be better when you need detailed route navigation, opening-hour checks, community discussion, or very specific firsthand comments.",
    },
    {
        "slug": "miro-vs-ai-travel-planners",
        "title": "Miro vs AI travel planners: local grounding vs generic itineraries",
        "meta": "Miro vs AI Travel Planners | Local grounding vs generic itineraries",
        "desc": "A fair comparison of Miro and AI travel planners for travelers who want Korea recommendations grounded in local signals and context.",
        "alt": "AI travel planners",
        "intro": "AI travel planners can be useful for brainstorming broad itineraries. Miro is aimed at a more grounded decision layer: recommendations that fit a Korea traveler's actual area, time, mood, and local context.",
        "rows": [
            ("Main job", "Context-aware recommendations grounded in local signals.", "Generate broad plans, lists, and itinerary drafts from prompts."),
            ("Good fit", "Deciding what to do next in a specific Korea travel moment.", "Early brainstorming, rough schedules, or general trip outlines."),
            ("Decision style", "Situation-fit first, with fewer options.", "Prompt-driven output that can be broad or generic."),
            ("Current truth", "Early-access preview showing the intended recommendation style.", "Varies widely by tool and data grounding."),
        ],
        "miro_fit": "Miro is a better fit when you want the recommendation to reflect local signal and situation-fit rather than a generic itinerary that sounds plausible but may not match the moment.",
        "alt_fit": "AI travel planners may be better when you want a broad first draft, a multi-day outline, or flexible brainstorming before detailed local decisions.",
    },
]


def e(value):
    return escape(value, quote=True)


def head(title, desc, canonical, css, js, faq_json=False):
    jsonld = ""
    if faq_json:
        items = []
        for q, a in FAQS:
            items.append(f'''      {{
        "@type": "Question",
        "name": "{e(q)}",
        "acceptedAnswer": {{
          "@type": "Answer",
          "text": "{e(a)}"
        }}
      }}''')
        jsonld = '''  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
''' + ",\n".join(items) + '''
    ]
  }
  </script>
'''
    return f'''<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{e(title)}</title>
  <meta name="description" content="{e(desc)}">
  <!-- SEO: Phase 1 foundation -->
  <link rel="canonical" href="{e(canonical)}">
  <meta property="og:site_name" content="Miro">
  <meta property="og:title" content="{e(title)}">
  <meta property="og:description" content="{e(desc)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{e(canonical)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="{e(title)}">
  <meta name="twitter:description" content="{e(desc)}">
{jsonld}  <!-- /SEO: Phase 1 foundation -->
  <link rel="stylesheet" href="{css}">
  <script src="{js}" defer></script>
</head>'''


def nav(prefix, active):
    items = [
        ("home", "index.html", "Home", "nav-link"),
        ("about", "about.html", "About Miro", "nav-link"),
        ("how", "how-it-works.html", "How It Works", "nav-link"),
        ("reports", "reports/", "Reports", "nav-link"),
        ("compare", "compare/", "Compare", "nav-link"),
        ("faq", "faq.html", "FAQ", "nav-link"),
        ("apply", "apply.html", "Apply", "nav-cta"),
    ]
    desktop = "\n".join(f'          <a class="{cls}" data-nav="{key}" href="{prefix}{href}">{label}</a>' for key, href, label, cls in items)
    mobile = "\n".join(f'              <a class="{cls}" data-nav="{key}" href="{prefix}{href}">{label}</a>' for key, href, label, cls in items)
    return f'''  <header class="site-header">
    <div class="container">
      <div class="site-bar">
        <a class="brand-mark" href="{prefix}index.html">Miro</a>
        <nav class="site-nav site-nav-desktop" aria-label="Primary">
{desktop}
        </nav>
        <details class="mobile-menu">
          <summary>Menu</summary>
          <div class="mobile-menu-panel">
            <nav class="site-nav" aria-label="Mobile">
{mobile}
            </nav>
          </div>
        </details>
      </div>
    </div>
  </header>'''


def footer(prefix):
    return f'''  <footer class="site-footer">
    <div class="container">
      <div class="footer-shell">
        <div class="footer-mark">Miro</div>
        <div class="footer-links">
          <a href="{prefix}index.html">Home</a>
          <a href="{prefix}about.html">About Miro</a>
          <a href="{prefix}how-it-works.html">How It Works</a>
          <a href="{prefix}trust.html">Trust</a>
          <a href="{prefix}reports/">Reports</a>
          <a href="{prefix}compare/">Compare</a>
          <a href="{prefix}faq.html">FAQ</a>
          <a href="{prefix}apply.html">Apply</a>
        </div>
        <p class="footer-meta">Map it right out. Seoul may feel like a maze, but deciding where to go next should not.</p>
        <p class="footer-meta">Early access for a more context-aware Korea recommendation experience, with sample previews, trust pages, comparison pages, signups, and stronger-interest signals.</p>
      </div>
    </div>
  </footer>'''


def page(filename, page_key, title, desc, canonical_path, eyebrow, h1, intro, sections, cta, faq=False):
    blocks = "\n".join(f'''          <section class="guide-section">
            <h2>{e(h)}</h2>
            <p>{e(p)}</p>
          </section>''' for h, p in sections)
    faq_block = ""
    if faq:
        rows = "\n".join(f'''            <details class="faq-item">
              <summary>{e(q)}</summary>
              <div class="faq-answer"><p>{e(a)}</p></div>
            </details>''' for q, a in FAQS)
        faq_block = f'''          <section class="guide-section" data-section="faq-list">
            <h2>Core questions</h2>
            <div class="faq-list guide-faq-list">
{rows}
            </div>
          </section>'''
    html = f'''<!DOCTYPE html>
<html lang="en">
{head(title, desc, SITE_URL + canonical_path, "styles.css", "script.js", faq)}
<body data-page="{page_key}">
{nav("", page_key)}
  <main class="page-main">
    <section class="page-intro guide-hero" data-section="{page_key}-intro">
      <div class="container">
        <div class="page-copy reading-width">
          <span class="eyebrow">{e(eyebrow)}</span>
          <h1 class="page-title guide-title">{e(h1)}</h1>
          <p class="page-lead">{e(intro)}</p>
        </div>
      </div>
    </section>
    <section class="section guide-body" data-section="{page_key}-body">
      <div class="container">
        <article class="guide-article">
{blocks}
{faq_block}
          <section class="guide-section guide-links-panel">
            <h2>Useful links</h2>
            <ul class="guide-link-list">
              <li><a href="index.html">Try the Miro homepage preview</a></li>
              <li><a href="about.html">About Miro</a></li>
              <li><a href="how-it-works.html">How Miro works</a></li>
              <li><a href="faq.html">Read the FAQ</a></li>
              <li><a href="compare/">Compare Miro with other tools</a></li>
            </ul>
          </section>
          <section class="closing-panel guide-cta" data-section="{page_key}-cta">
            <span class="section-label">Next step</span>
            <h2>{e(cta[0])}</h2>
            <p>{e(cta[1])}</p>
            <div class="cta-row">
              <a class="button button-primary" href="index.html#home-demo" data-cta="{page_key}-demo">Try the Miro preview</a>
              <a class="button button-secondary" href="apply.html#free-signup" data-cta="{page_key}-apply">Get early access</a>
            </div>
          </section>
        </article>
      </div>
    </section>
  </main>
{footer("")}
</body>
</html>
'''
    (ROOT / filename).write_text(html, encoding="utf-8")


def compare_page(comp):
    rows = "\n".join(f'''              <tr>
                <th>{e(label)}</th>
                <td>{e(miro)}</td>
                <td>{e(alt)}</td>
              </tr>''' for label, miro, alt in comp["rows"])
    html = f'''<!DOCTYPE html>
<html lang="en">
{head(comp["meta"], comp["desc"], SITE_URL + "/compare/" + comp["slug"], "../../styles.css", "../../script.js")}
<body data-page="compare">
{nav("../../", "compare")}
  <main class="page-main">
    <section class="page-intro guide-hero" data-section="compare-intro">
      <div class="container">
        <div class="page-copy reading-width">
          <span class="eyebrow">Comparison</span>
          <h1 class="page-title guide-title">{e(comp["title"])}</h1>
          <p class="page-lead">{e(comp["intro"])}</p>
        </div>
      </div>
    </section>
    <section class="section guide-body" data-section="compare-body">
      <div class="container">
        <article class="guide-article">
          <section class="guide-section">
            <h2>Quick comparison</h2>
            <div class="table-wrap">
              <table class="compare-table">
                <thead><tr><th>Question</th><th>Miro</th><th>{e(comp["alt"])}</th></tr></thead>
                <tbody>
{rows}
                </tbody>
              </table>
            </div>
          </section>
          <section class="guide-section">
            <h2>When Miro is a better fit</h2>
            <p>{e(comp["miro_fit"])}</p>
          </section>
          <section class="guide-section">
            <h2>When {e(comp["alt"])} may be a better fit</h2>
            <p>{e(comp["alt_fit"])}</p>
          </section>
          <section class="guide-section">
            <h2>How to choose</h2>
            <p>Use the alternative when its core job matches your need. Use Miro when the harder question is what fits your current Korea travel situation and you want a smaller, more context-aware next move.</p>
          </section>
          <section class="guide-section guide-links-panel">
            <h2>Related pages</h2>
            <ul class="guide-link-list">
              <li><a href="../../index.html">Try the Miro homepage preview</a></li>
              <li><a href="../../how-it-works.html">How Miro works</a></li>
              <li><a href="../../about.html">About Miro</a></li>
              <li><a href="../../faq.html">FAQ</a></li>
              <li><a href="../">All comparison pages</a></li>
            </ul>
          </section>
          <section class="closing-panel guide-cta" data-section="compare-cta">
            <span class="section-label">Try Miro</span>
            <h2>See the context-aware preview first.</h2>
            <p>The homepage demo shows the kind of focused answer Miro is being shaped around: area, time, vibe, and fewer choices.</p>
            <div class="cta-row">
              <a class="button button-primary" href="../../index.html#home-demo" data-cta="compare-demo-{comp["slug"]}">Try the Miro preview</a>
              <a class="button button-secondary" href="../../apply.html#free-signup" data-cta="compare-apply-{comp["slug"]}">Get early access</a>
            </div>
          </section>
        </article>
      </div>
    </section>
  </main>
{footer("../../")}
</body>
</html>
'''
    page_dir = ROOT / "compare" / comp["slug"]
    page_dir.mkdir(parents=True, exist_ok=True)
    (page_dir / "index.html").write_text(html, encoding="utf-8")


def compare_index():
    cards = "\n".join(f'''          <article class="guide-card">
            <span class="intent-meta">Comparison</span>
            <h3>{e(c["title"])}</h3>
            <p>{e(c["desc"])}</p>
            <a href="{c["slug"]}/" data-cta="compare-index-{c["slug"]}">Read comparison</a>
          </article>''' for c in COMPARES)
    html = f'''<!DOCTYPE html>
<html lang="en">
{head("Compare Miro | Travel recommendation tools", "Fair comparisons between Miro and travel marketplaces, review platforms, map research, Reddit, and AI travel planners.", SITE_URL + "/compare/", "../styles.css", "../script.js")}
<body data-page="compare">
{nav("../", "compare")}
  <main class="page-main">
    <section class="page-intro" data-section="compare-index">
      <div class="container">
        <div class="page-copy reading-width">
          <span class="eyebrow">Compare Miro</span>
          <h1 class="page-title">How Miro differs from other travel tools.</h1>
          <p class="page-lead">These comparisons are meant to be fair: other tools are useful for booking, broad reviews, maps, community research, or generic trip drafts. Miro focuses on context-aware Korea recommendations grounded in local signals.</p>
          <div class="cta-row">
            <a class="button button-primary" href="../index.html#home-demo" data-cta="compare-index-demo">Try the Miro preview</a>
            <a class="button button-secondary" href="../how-it-works.html" data-cta="compare-index-how">How Miro works</a>
          </div>
        </div>
      </div>
    </section>
    <section class="section" data-section="compare-list">
      <div class="container">
        <div class="guide-grid">
{cards}
        </div>
      </div>
    </section>
  </main>
{footer("../")}
</body>
</html>
'''
    compare_dir = ROOT / "compare"
    compare_dir.mkdir(exist_ok=True)
    (compare_dir / "index.html").write_text(html, encoding="utf-8")


def main():
    page(
        "about.html", "about", "About Miro | Local Korea travel recommendations",
        "Learn what Miro is, who it is for, and why it focuses on context-aware Korea travel recommendations grounded in local signals.",
        "/about", "About Miro", "What Miro is and why it exists.",
        "Miro is an early-access Korea local travel recommendation product for international travelers. It exists because choosing where to go in Korea often means piecing together maps, feeds, blogs, and reviews without a clear answer for the moment.",
        [
            ("The problem Miro is solving", "Travelers do not usually lack information. They lack a clear, trustworthy next move that fits where they are, how much time they have, and what kind of experience they want."),
            ("Who Miro is for", "Miro is for international travelers visiting Korea who want local-feeling decisions without spending the day researching. First-time visitors, repeat visitors, solo travelers, couples, and small groups can all benefit from a smaller, more contextual answer."),
            ("Miro's positioning", "Miro is not trying to be a booking marketplace, a review database, or a generic chatbot itinerary. The product direction is context-aware recommendations grounded in local signals and shaped around the traveler's actual situation."),
            ("Why local context matters in Korea", "Korea travel decisions are often neighborhood-specific and time-sensitive. A cafe, meal, walk, or browse stop can be useful in one situation and wrong in another. Miro treats fit as part of the recommendation, not an afterthought."),
        ],
        ("Try the product direction.", "Use the homepage preview to see how Miro turns area, time, and vibe into a more focused Seoul recommendation style."),
    )
    page(
        "how-it-works.html", "how", "How Miro Works | Context-aware recommendations",
        "See how Miro uses area, time, mood, and local signals to shape Korea travel recommendations for international visitors.",
        "/how-it-works", "How It Works", "How Miro thinks about recommendations.",
        "Miro is designed to narrow Korea travel choices through context. The current site is an early-access preview, but the product flow is already clear: start with the traveler's situation, then return fewer, more usable recommendations.",
        [
            ("Step 1: Start with context", "Miro begins with practical inputs such as area, available time, and mood or situation. These inputs matter because a good answer for 45 minutes is different from a good answer for an evening."),
            ("Step 2: Read local signals", "The product direction is to ground recommendations in local signals: places locals save, frequent, mention, or return to. These signals are useful only when filtered through the traveler's actual context."),
            ("Step 3: Return a smaller answer", "Miro is not meant to overwhelm users with every possible option. The goal is a compact recommendation set or mini-route that feels concrete enough to act on."),
            ("What Miro is not", "Miro is not just a tourist ranking list, not a booking marketplace, and not an AI-only itinerary generator. It is being shaped as a context-aware decision layer for Korea travel."),
        ],
        ("Try the sample flow.", "The homepage demo shows the intended recommendation shape without pretending the full product is already finished."),
    )
    page(
        "faq.html", "faq", "Miro FAQ | Product and trust questions",
        "Answers to core questions about Miro, who it is for, how it works, and how it differs from generic travel tools.",
        "/faq", "FAQ", "Clear answers before you decide.",
        "Miro is early, so trust comes from being specific about what it is, what it is not, and what users can expect. These answers explain the product direction without overstating what is live today.",
        [],
        ("Still interested?", "Try the homepage preview first, then join early access if the direction feels useful."),
        faq=True,
    )
    page(
        "trust.html", "trust", "Trust | Miro",
        "How Miro presents its early-access product honestly, what users can expect, and where to go for questions or feedback.",
        "/trust", "Trust", "Basic trust and expectations.",
        "Miro is an early-access product preview, not a finished travel platform. This page explains what the site is doing, what users can expect, and how to evaluate the product honestly.",
        [
            ("Who built Miro", "Miro is being developed as a Korea local travel recommendation product for international travelers. The current site is focused on validating whether the recommendation direction is useful before a broader product launch."),
            ("What users can expect", "Users can try a lightweight homepage preview, read how the recommendation approach works, join early access, and signal stronger interest. The site should not be treated as a complete booking platform or finished recommendation engine today."),
            ("How feedback is handled", "The early-access form is the main feedback path right now. Users can share their use case, area, and what kind of help they want from Miro."),
            ("What Miro will not claim", "Miro will not claim fake reviews, fake partnerships, rankings, or unsupported proof. The trust layer is intentionally plain so users can understand the product without hype."),
        ],
        ("Share your interest.", "If the concept solves a real travel problem for you, join early access and tell Miro what kind of Korea moment you want help with."),
    )
    compare_index()
    for comp in COMPARES:
        compare_page(comp)


if __name__ == "__main__":
    main()
