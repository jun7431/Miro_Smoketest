import json
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "content" / "reports.json"


def e(value):
    return escape(str(value), quote=True)


def head(title, desc, canonical, css, js, indexable=True):
    robots = "" if indexable else '  <meta name="robots" content="noindex,follow">\n'
    return f'''<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{e(title)}</title>
  <meta name="description" content="{e(desc)}">
  <!-- SEO: Phase 1 foundation -->
  <link rel="canonical" href="{e(canonical)}">
{robots}  <meta property="og:site_name" content="Miro">
  <meta property="og:title" content="{e(title)}">
  <meta property="og:description" content="{e(desc)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{e(canonical)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="{e(title)}">
  <meta name="twitter:description" content="{e(desc)}">
  <!-- /SEO: Phase 1 foundation -->
  <link rel="stylesheet" href="{css}">
  <script src="{js}" defer></script>
</head>'''


def nav(prefix):
    items = [
        ("home", "index.html", "Home", "nav-link"),
        ("about", "about.html", "About Miro", "nav-link"),
        ("how", "how-it-works.html", "How It Works", "nav-link"),
        ("reports", "reports/", "Reports", "nav-link"),
        ("compare", "compare/", "Compare", "nav-link"),
        ("faq", "faq.html", "FAQ", "nav-link"),
        ("apply", "index.html#home-signup", "Get early access", "nav-cta"),
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
          <a href="{prefix}reports/">Reports</a>
          <a href="{prefix}trust.html">Trust</a>
          <a href="{prefix}compare/">Compare</a>
          <a href="{prefix}faq.html">FAQ</a>
          <a href="{prefix}index.html#home-signup">Get early access</a>
        </div>
        <p class="footer-meta">Map it right out. Seoul may feel like a maze, but deciding where to go next should not.</p>
        <p class="footer-meta">Early access for a more context-aware Korea recommendation experience, with transparent reports, sample previews, trust pages, comparison pages, and signups.</p>
      </div>
    </div>
  </footer>'''


def report_card(report):
    status = "Draft template" if report["status"] == "draft_template" else "Published report"
    link_label = "View template" if report["status"] == "draft_template" else "Read report"
    return f'''          <article class="guide-card report-card">
            <span class="intent-meta">{status}</span>
            <h3>{e(report["title"])}</h3>
            <p>{e(report["description"])}</p>
            <a href="{e(report["slug"])}/" data-cta="reports-index-{e(report["slug"])}">{link_label}</a>
          </article>'''


def reports_index(site_url, reports):
    cards = "\n".join(report_card(report) for report in reports)
    return f'''<!DOCTYPE html>
<html lang="en">
{head("Miro Reports | Data and insight templates", "Transparent report templates for future Miro original data assets. Draft reports are clearly marked until real source data is available.", site_url + "/reports/", "../styles.css", "../script.js")}
<body data-page="reports">
{nav("../")}
  <main class="page-main">
    <section class="page-intro guide-hero" data-section="reports-index">
      <div class="container">
        <div class="page-copy reading-width">
          <span class="eyebrow">Reports</span>
          <h1 class="page-title guide-title">Transparent reports, only when the data exists.</h1>
          <p class="page-lead">Miro will use this section for original data assets about Korea travel recommendations, local signals, and visitor friction. No findings are published here unless they can be traced to a real, documented source.</p>
          <div class="cta-row">
            <a class="button button-primary" href="../index.html#home-demo" data-cta="reports-index-demo">Try the Miro preview</a>
            <a class="button button-secondary" href="../trust.html" data-cta="reports-index-trust">Read the trust notes</a>
          </div>
        </div>
      </div>
    </section>
    <section class="section guide-body" data-section="reports-list">
      <div class="container">
        <div class="guide-section report-disclosure">
          <h2>Current publication status</h2>
          <p>No verified local-place, saved-list, survey, interview, or analytics dataset is present in this repository. The pages below are non-indexed draft templates for the team to fill only after real source data is available.</p>
        </div>
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


def report_page(site_url, report):
    source = report["methodology"]
    findings = "\n".join(f"              <li>{e(item)}</li>" for item in report["key_findings"])
    sections = "\n".join(f'''          <section class="guide-section">
            <h2>{e(section["heading"])}</h2>
            <p>{e(section["body"])}</p>
          </section>''' for section in report["sections"])
    limitations = "\n".join(f"              <li>{e(item)}</li>" for item in report["limitations"])
    status = "Draft template - noindex" if not report["indexable"] else "Published report"
    return f'''<!DOCTYPE html>
<html lang="en">
{head(report["meta_title"], report["description"], site_url + "/reports/" + report["slug"], "../../styles.css", "../../script.js", report["indexable"])}
<body data-page="reports">
{nav("../../")}
  <main class="page-main">
    <section class="page-intro guide-hero" data-section="report-intro">
      <div class="container">
        <div class="page-copy reading-width">
          <span class="eyebrow">{status}</span>
          <h1 class="page-title guide-title">{e(report["title"])}</h1>
          <p class="page-lead">{e(report["intro"])}</p>
        </div>
      </div>
    </section>
    <section class="section guide-body" data-section="report-body">
      <div class="container">
        <article class="guide-article">
          <section class="guide-section report-disclosure">
            <h2>Why this matters</h2>
            <p>{e(report["why_it_matters"])}</p>
          </section>
          <section class="guide-section">
            <h2>Key findings summary</h2>
            <ul class="guide-link-list">
{findings}
            </ul>
          </section>
          <section class="guide-section report-methodology">
            <h2>Methodology and source disclosure</h2>
            <p><strong>Source type:</strong> {e(source["source_type"])}</p>
            <p><strong>Scope:</strong> {e(source["scope"])}</p>
            <p><strong>Limitations:</strong> {e(source["limitations"])}</p>
          </section>
{sections}
          <section class="guide-section">
            <h2>Limitations and caveats</h2>
            <ul class="guide-link-list">
{limitations}
            </ul>
          </section>
          <section class="guide-section guide-links-panel">
            <h2>Related pages</h2>
            <ul class="guide-link-list">
              <li><a href="../../reports/">Reports index</a></li>
              <li><a href="../../trust.html">Trust and transparency</a></li>
              <li><a href="../../how-it-works.html">How Miro works</a></li>
              <li><a href="../../compare/">Compare Miro with other tools</a></li>
              <li><a href="../../index.html">Try the homepage preview</a></li>
            </ul>
          </section>
          <section class="closing-panel guide-cta" data-section="report-cta">
            <span class="section-label">Try Miro</span>
            <h2>See the product direction first.</h2>
            <p>The current homepage preview shows how Miro is being shaped around area, time, vibe, and fewer choices. Reports should only be published when real data supports them.</p>
            <div class="cta-row">
              <a class="button button-primary" href="../../index.html#home-demo" data-cta="report-demo-{e(report["slug"])}">Try the Miro preview</a>
              <a class="button button-secondary" href="../../index.html#home-signup" data-cta="report-apply-{e(report["slug"])}">Get early access</a>
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


def main():
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    site_url = data["site_url"]
    reports = data["reports"]
    reports_dir = ROOT / "reports"
    reports_dir.mkdir(exist_ok=True)
    (reports_dir / "index.html").write_text(reports_index(site_url, reports), encoding="utf-8")
    for report in reports:
        page_dir = reports_dir / report["slug"]
        page_dir.mkdir(parents=True, exist_ok=True)
        (page_dir / "index.html").write_text(report_page(site_url, report), encoding="utf-8")


if __name__ == "__main__":
    main()
