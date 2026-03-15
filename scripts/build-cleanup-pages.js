const fs = require('fs');
const path = require('path');
const { domain, cleanupTools, cleanupHub } = require('./cleanup-registry');

const root = path.resolve(__dirname, '..');
const lastmod = '2026-03-15';

function writeFile(relPath, contents) {
  const target = path.join(root, relPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, contents);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function jsonScript(data) {
  return JSON.stringify(data, null, 2).replace(/</g, '\\u003c');
}

function nav(prefix, withAbout) {
  return `<nav class="site-nav">
        <a data-page-link="catalog" href="${prefix}">Tools</a>
        <a data-page-link="multiline" href="${prefix}multiline/">Multiline</a>
        <a data-page-link="quote" href="${prefix}quote/">Quote</a>
        <a data-page-link="split-join" href="${prefix}split-join/">Split / Join</a>
        <a data-page-link="cleanup" href="${prefix}cleanup/">Cleanup</a>
        <a data-page-link="escape" href="${prefix}escape/">Escape</a>
        <a data-page-link="base64" href="${prefix}base64/">Base64</a>
        <a data-page-link="url-encode" href="${prefix}url-encode/">URL Encode</a>
        <a data-page-link="slugify" href="${prefix}slugify/">Slugify</a>
        <a data-page-link="json" href="${prefix}json/">JSON</a>${withAbout ? `
        <a data-page-link="about" href="${prefix}about/">About</a>` : ''}
      </nav>`;
}

function pageFooter(tool) {
  const navItems = tool.guide ? [{ href: tool.guide.href, label: tool.guide.label || 'Guide' }, ...tool.related] : tool.related;
  return `<footer class="page-footer">
      <p>${escapeHtml(tool.footerText || 'Move between cleanup, extraction, and transform tools without leaving the browser.')}</p>
      <nav>${navItems.map((item) => `<a href="${item.href}">${escapeHtml(item.label)}</a>`).join('')}</nav>
    </footer>`;
}

function renderStats(stats) {
  return `<div class="stat-grid">
        ${stats.map((stat) => `<article class="stat-card"><span>${escapeHtml(stat.label)}</span><strong data-stat="${escapeHtml(stat.key)}">${escapeHtml(stat.defaultValue || '0')}</strong></article>`).join('')}
      </div>`;
}

function renderHowTo(tool) {
  return `<section class="split-layout">
      <article class="content-card">
        <h2>How to use</h2>
        <ol>
          ${tool.howTo.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}
        </ol>
      </article>
      <article class="content-card">
        <h2>Common questions this page answers</h2>
        <ul class="question-list">
          ${tool.questions.map((question) => `<li>${escapeHtml(question)}</li>`).join('')}
        </ul>
      </article>
    </section>`;
}

function renderFaq(tool) {
  return `<section class="faq-card">
      <h2>FAQ</h2>
      <div class="faq-list">
        ${tool.faq.map((item) => `<article class="faq-item"><h3>${escapeHtml(item.q)}</h3><p>${item.a}</p></article>`).join('')}
      </div>
    </section>`;
}

function renderQuickAnswer(tool) {
  return `<section class="content-card answer-summary">
      <h2>Quick answer</h2>
      ${tool.quickAnswer.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
    </section>`;
}

function renderExample(tool) {
  if (tool.engine === 'compare') {
    return `<section class="section-stack">
      <article class="content-card">
        <h2>Example input and output</h2>
        <div class="example-grid compare-example-grid">
          <div class="example-block">
            <h3>List A</h3>
            <pre><code>${escapeHtml(tool.example.left)}</code></pre>
          </div>
          <div class="example-block">
            <h3>List B</h3>
            <pre><code>${escapeHtml(tool.example.right)}</code></pre>
          </div>
          <div class="example-block">
            <h3>Common values</h3>
            <pre><code>${escapeHtml(tool.example.common)}</code></pre>
          </div>
          <div class="example-block">
            <h3>Only in A</h3>
            <pre><code>${escapeHtml(tool.example.onlyA)}</code></pre>
          </div>
          <div class="example-block">
            <h3>Only in B</h3>
            <pre><code>${escapeHtml(tool.example.onlyB)}</code></pre>
          </div>
        </div>
      </article>
    </section>`;
  }

  return `<section class="section-stack">
      <article class="content-card">
        <h2>Example input and output</h2>
        <div class="example-grid">
          <div class="example-block">
            <h3>Input</h3>
            <pre><code>${escapeHtml(tool.example.input)}</code></pre>
          </div>
          <div class="example-block">
            <h3>${escapeHtml(tool.example.outputTitle)}</h3>
            <pre><code>${escapeHtml(tool.example.output)}</code></pre>
          </div>
        </div>
      </article>
    </section>`;
}

function renderListToolbar(tool) {
  const controls = tool.config.controls || {};
  const presets = tool.config.presets || [];
  const examples = tool.config.exampleButtons || [];
  return `<div class="toolbar">
        <div class="toolbar-row toolbar-primary">
          ${presets.length ? `<div class="segmented cleanup-segmented">${presets.map((preset, index) => `<button ${index === 0 ? 'class="active" ' : ''}type="button" data-preset="${escapeHtml(preset.key)}">${escapeHtml(preset.label)}</button>`).join('')}</div>` : `<div class="chip-row compact"><span class="chip active">${escapeHtml(tool.config.modeLabel)}</span></div>`}
          <details class="toolbar-details" id="advancedPanel">
            <summary>Advanced settings</summary>
            <div class="toolbar-detail-body">
              <div class="toolbar-row compact cleanup-toggle-row">
                ${controls.trim ? `<label class="chip"><input id="trimValues" type="checkbox" checked> Trim values</label>` : ''}
                ${controls.skipEmpty ? `<label class="chip"><input id="skipEmpty" type="checkbox" checked> Skip empty lines</label>` : ''}
              </div>
              ${examples.length ? `<div class="example-actions compact">${examples.map((button) => `<button type="button" data-example="${escapeHtml(button.key)}">${escapeHtml(button.label)}</button>`).join('')}</div>` : ''}
            </div>
          </details>
        </div>
      </div>`;
}

function renderListToolPage(tool) {
  const config = tool.config;
  const pageUrl = `${domain}/${tool.slug}/`;
  const appJson = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.h1,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    url: pageUrl,
    description: tool.description,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
  };
  const breadcrumbJson = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'DevFormat Tools', item: `${domain}/` },
      { '@type': 'ListItem', position: 2, name: 'Cleanup & Extraction', item: `${domain}/cleanup/` },
      { '@type': 'ListItem', position: 3, name: tool.h1, item: pageUrl }
    ]
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(tool.title)}</title>
  <meta name="description" content="${escapeHtml(tool.description)}">
  <meta name="keywords" content="${escapeHtml(tool.keywords)}">
  <meta property="og:title" content="${escapeHtml(tool.title)}">
  <meta property="og:description" content="${escapeHtml(tool.description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${pageUrl}">
  <link rel="canonical" href="${pageUrl}">
  <link rel="stylesheet" href="../assets/site.css">
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg?v=20260311">
  <script type="application/ld+json">
${jsonScript(appJson)}
  </script>
  <script type="application/ld+json">
${jsonScript(breadcrumbJson)}
  </script>
</head>
<body data-page="${escapeHtml(config.toolKey)}" data-layout="tool">
  <header class="site-header">
    <div class="site-header-inner">
      <a class="brand" href="../">
        <div class="brand-mark"><img src="../assets/devformat-logo.svg?v=20260311" alt="DevFormat logo"></div>
        <div class="brand-copy"><strong>DevFormat</strong><span>Preset-driven text tools for developers</span></div>
      </a>
      ${nav('../', false)}
    </div>
  </header>
  <main class="page-shell">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="../">Tools</a>
      <span>/</span>
      <a href="../cleanup/">Cleanup</a>
      <span>/</span>
      <span aria-current="page">${escapeHtml(tool.h1)}</span>
    </nav>
    <section class="hero compact hero-slim">
      <span class="hero-kicker">${escapeHtml(tool.kicker)}</span>
      <h1>${escapeHtml(tool.h1)}</h1>
      <p>${escapeHtml(tool.heroText)}</p>
    </section>
    ${renderQuickAnswer(tool)}
    <section class="tool-shell">
      ${renderListToolbar(tool)}
      <div class="tool-panels">
        <section class="tool-panel">
          <div class="panel-head">
            <div><strong>Input</strong><span id="inputHint">${escapeHtml(config.inputHint)}</span></div>
            <button class="copy-button" type="button" id="clearButton">Clear</button>
          </div>
          <textarea class="textarea" id="input" placeholder="${escapeHtml(config.placeholder)}"></textarea>
        </section>
        <section class="tool-panel">
          <div class="panel-head">
            <div><strong>Output</strong><span id="outputHint">${escapeHtml(config.outputHint)}</span></div>
            <button class="copy-button" type="button" id="copyButton">Copy</button>
          </div>
          <textarea class="textarea" id="output" readonly></textarea>
        </section>
      </div>
      ${renderStats(config.stats)}
    </section>
    ${renderHowTo(tool)}
    ${renderExample(tool)}
    ${renderFaq(tool)}
    ${pageFooter(tool)}
  </main>
  <div class="toast" id="toast">Ready.</div>
  <script src="../assets/site.js"></script>
  <script>
    window.DevFormatListCleanupConfig = ${jsonScript(config)};
  </script>
  <script src="../assets/list-cleanup-tool.js"></script>
</body>
</html>`;
}

function renderExtractToolPage(tool) {
  const config = tool.config;
  const pageUrl = `${domain}/${tool.slug}/`;
  const appJson = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.h1,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    url: pageUrl,
    description: tool.description,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
  };
  const breadcrumbJson = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'DevFormat Tools', item: `${domain}/` },
      { '@type': 'ListItem', position: 2, name: 'Cleanup & Extraction', item: `${domain}/cleanup/` },
      { '@type': 'ListItem', position: 3, name: tool.h1, item: pageUrl }
    ]
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(tool.title)}</title>
  <meta name="description" content="${escapeHtml(tool.description)}">
  <meta name="keywords" content="${escapeHtml(tool.keywords)}">
  <meta property="og:title" content="${escapeHtml(tool.title)}">
  <meta property="og:description" content="${escapeHtml(tool.description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${pageUrl}">
  <link rel="canonical" href="${pageUrl}">
  <link rel="stylesheet" href="../assets/site.css">
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg?v=20260311">
  <script type="application/ld+json">
${jsonScript(appJson)}
  </script>
  <script type="application/ld+json">
${jsonScript(breadcrumbJson)}
  </script>
</head>
<body data-page="${escapeHtml(config.toolKey)}" data-layout="tool">
  <header class="site-header">
    <div class="site-header-inner">
      <a class="brand" href="../">
        <div class="brand-mark"><img src="../assets/devformat-logo.svg?v=20260311" alt="DevFormat logo"></div>
        <div class="brand-copy"><strong>DevFormat</strong><span>Preset-driven text tools for developers</span></div>
      </a>
      ${nav('../', false)}
    </div>
  </header>
  <main class="page-shell">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="../">Tools</a>
      <span>/</span>
      <a href="../cleanup/">Cleanup</a>
      <span>/</span>
      <span aria-current="page">${escapeHtml(tool.h1)}</span>
    </nav>
    <section class="hero compact hero-slim">
      <span class="hero-kicker">${escapeHtml(tool.kicker)}</span>
      <h1>${escapeHtml(tool.h1)}</h1>
      <p>${escapeHtml(tool.heroText)}</p>
    </section>
    ${renderQuickAnswer(tool)}
    <section class="tool-shell">
      <div class="toolbar">
        <div class="toolbar-row toolbar-primary">
          <div class="chip-row compact"><span class="chip active">${escapeHtml(config.modeLabel)}</span></div>
          <details class="toolbar-details" id="advancedPanel">
            <summary>Advanced settings</summary>
            <div class="toolbar-detail-body">
              <div class="toolbar-row compact cleanup-toggle-row">
                <label class="chip"><input id="uniqueOnly" type="checkbox" ${config.controls.uniqueOnly ? 'checked' : ''}> Unique only</label>
                <label class="chip"><input id="sortOutput" type="checkbox" ${config.controls.sortOutput ? 'checked' : ''}> Sort output</label>
              </div>
              <div class="example-actions compact">${config.exampleButtons.map((button) => `<button type="button" data-example="${escapeHtml(button.key)}">${escapeHtml(button.label)}</button>`).join('')}</div>
            </div>
          </details>
        </div>
      </div>
      <div class="tool-panels">
        <section class="tool-panel">
          <div class="panel-head">
            <div><strong>Input</strong><span id="inputHint">${escapeHtml(config.inputHint)}</span></div>
            <button class="copy-button" type="button" id="clearButton">Clear</button>
          </div>
          <textarea class="textarea" id="input" placeholder="${escapeHtml(config.placeholder)}"></textarea>
        </section>
        <section class="tool-panel">
          <div class="panel-head">
            <div><strong>Output</strong><span id="outputHint">${escapeHtml(config.outputHint)}</span></div>
            <button class="copy-button" type="button" id="copyButton">Copy</button>
          </div>
          <textarea class="textarea" id="output" readonly></textarea>
        </section>
      </div>
      ${renderStats(config.stats)}
    </section>
    ${renderHowTo(tool)}
    ${renderExample(tool)}
    ${renderFaq(tool)}
    ${pageFooter(tool)}
  </main>
  <div class="toast" id="toast">Ready.</div>
  <script src="../assets/site.js"></script>
  <script>
    window.DevFormatExtractConfig = ${jsonScript(config)};
  </script>
  <script src="../assets/extract-tool.js"></script>
</body>
</html>`;
}

function renderCsvToolPage(tool) {
  const config = tool.config;
  const pageUrl = `${domain}/${tool.slug}/`;
  const appJson = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.h1,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    url: pageUrl,
    description: tool.description,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
  };
  const breadcrumbJson = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'DevFormat Tools', item: `${domain}/` },
      { '@type': 'ListItem', position: 2, name: 'Cleanup & Extraction', item: `${domain}/cleanup/` },
      { '@type': 'ListItem', position: 3, name: tool.h1, item: pageUrl }
    ]
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(tool.title)}</title>
  <meta name="description" content="${escapeHtml(tool.description)}">
  <meta name="keywords" content="${escapeHtml(tool.keywords)}">
  <meta property="og:title" content="${escapeHtml(tool.title)}">
  <meta property="og:description" content="${escapeHtml(tool.description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${pageUrl}">
  <link rel="canonical" href="${pageUrl}">
  <link rel="stylesheet" href="../assets/site.css">
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg?v=20260311">
  <script type="application/ld+json">
${jsonScript(appJson)}
  </script>
  <script type="application/ld+json">
${jsonScript(breadcrumbJson)}
  </script>
</head>
<body data-page="${escapeHtml(config.toolKey)}" data-layout="tool">
  <header class="site-header">
    <div class="site-header-inner">
      <a class="brand" href="../">
        <div class="brand-mark"><img src="../assets/devformat-logo.svg?v=20260311" alt="DevFormat logo"></div>
        <div class="brand-copy"><strong>DevFormat</strong><span>Preset-driven text tools for developers</span></div>
      </a>
      ${nav('../', false)}
    </div>
  </header>
  <main class="page-shell">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="../">Tools</a>
      <span>/</span>
      <a href="../cleanup/">Cleanup</a>
      <span>/</span>
      <span aria-current="page">${escapeHtml(tool.h1)}</span>
    </nav>
    <section class="hero compact hero-slim">
      <span class="hero-kicker">${escapeHtml(tool.kicker)}</span>
      <h1>${escapeHtml(tool.h1)}</h1>
      <p>${escapeHtml(tool.heroText)}</p>
    </section>
    ${renderQuickAnswer(tool)}
    <section class="tool-shell">
      <div class="toolbar">
        <div class="toolbar-row toolbar-primary">
          <div class="segmented cleanup-segmented">${config.presets.map((preset, index) => `<button ${index === 0 ? 'class="active" ' : ''}type="button" data-preset="${escapeHtml(preset.key)}">${escapeHtml(preset.label)}</button>`).join('')}</div>
          <details class="toolbar-details" id="advancedPanel">
            <summary>Advanced settings</summary>
            <div class="toolbar-detail-body">
              <div class="toolbar-grid compact">
                <div class="field">
                  <label for="columnIndex">Column number</label>
                  <input class="input" id="columnIndex" type="number" min="1" value="1">
                </div>
              </div>
              <div class="toolbar-row compact cleanup-toggle-row">
                <label class="chip"><input id="trimValues" type="checkbox" checked> Trim values</label>
                <label class="chip"><input id="skipEmpty" type="checkbox" checked> Skip empty values</label>
                <label class="chip"><input id="hasHeader" type="checkbox" checked> Skip header row</label>
              </div>
              <div class="example-actions compact">${config.exampleButtons.map((button) => `<button type="button" data-example="${escapeHtml(button.key)}">${escapeHtml(button.label)}</button>`).join('')}</div>
            </div>
          </details>
        </div>
      </div>
      <div class="tool-panels">
        <section class="tool-panel">
          <div class="panel-head">
            <div><strong>Input</strong><span id="inputHint">${escapeHtml(config.inputHint)}</span></div>
            <button class="copy-button" type="button" id="clearButton">Clear</button>
          </div>
          <textarea class="textarea" id="input" placeholder="${escapeHtml(config.placeholder)}"></textarea>
        </section>
        <section class="tool-panel">
          <div class="panel-head">
            <div><strong>Output</strong><span id="outputHint">${escapeHtml(config.outputHint)}</span></div>
            <button class="copy-button" type="button" id="copyButton">Copy</button>
          </div>
          <textarea class="textarea" id="output" readonly></textarea>
        </section>
      </div>
      ${renderStats(config.stats)}
    </section>
    ${renderHowTo(tool)}
    ${renderExample(tool)}
    ${renderFaq(tool)}
    ${pageFooter(tool)}
  </main>
  <div class="toast" id="toast">Ready.</div>
  <script src="../assets/site.js"></script>
  <script>
    window.DevFormatCsvColumnConfig = ${jsonScript(config)};
  </script>
  <script src="../assets/csv-column-tool.js"></script>
</body>
</html>`;
}

function renderCompareToolPage(tool) {
  const config = tool.config;
  const pageUrl = `${domain}/${tool.slug}/`;
  const appJson = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.h1,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    url: pageUrl,
    description: tool.description,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
  };
  const breadcrumbJson = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'DevFormat Tools', item: `${domain}/` },
      { '@type': 'ListItem', position: 2, name: 'Cleanup & Extraction', item: `${domain}/cleanup/` },
      { '@type': 'ListItem', position: 3, name: tool.h1, item: pageUrl }
    ]
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(tool.title)}</title>
  <meta name="description" content="${escapeHtml(tool.description)}">
  <meta name="keywords" content="${escapeHtml(tool.keywords)}">
  <meta property="og:title" content="${escapeHtml(tool.title)}">
  <meta property="og:description" content="${escapeHtml(tool.description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${pageUrl}">
  <link rel="canonical" href="${pageUrl}">
  <link rel="stylesheet" href="../assets/site.css">
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg?v=20260311">
  <script type="application/ld+json">
${jsonScript(appJson)}
  </script>
  <script type="application/ld+json">
${jsonScript(breadcrumbJson)}
  </script>
</head>
<body data-page="${escapeHtml(config.toolKey)}" data-layout="tool">
  <header class="site-header">
    <div class="site-header-inner">
      <a class="brand" href="../">
        <div class="brand-mark"><img src="../assets/devformat-logo.svg?v=20260311" alt="DevFormat logo"></div>
        <div class="brand-copy"><strong>DevFormat</strong><span>Preset-driven text tools for developers</span></div>
      </a>
      ${nav('../', false)}
    </div>
  </header>
  <main class="page-shell">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="../">Tools</a>
      <span>/</span>
      <a href="../cleanup/">Cleanup</a>
      <span>/</span>
      <span aria-current="page">${escapeHtml(tool.h1)}</span>
    </nav>
    <section class="hero compact hero-slim">
      <span class="hero-kicker">${escapeHtml(tool.kicker)}</span>
      <h1>${escapeHtml(tool.h1)}</h1>
      <p>${escapeHtml(tool.heroText)}</p>
    </section>
    ${renderQuickAnswer(tool)}
    <section class="tool-shell compare-shell">
      <div class="toolbar">
        <div class="toolbar-row toolbar-primary">
          <div class="chip-row compact"><span class="chip active">Compare lists</span></div>
          <details class="toolbar-details" id="advancedPanel">
            <summary>Advanced settings</summary>
            <div class="toolbar-detail-body">
              <div class="toolbar-row compact cleanup-toggle-row">
                <label class="chip"><input id="trimValues" type="checkbox" ${config.controls.trim ? 'checked' : ''}> Trim values</label>
                <label class="chip"><input id="skipEmpty" type="checkbox" ${config.controls.skipEmpty ? 'checked' : ''}> Skip empty lines</label>
              </div>
              <div class="example-actions compact">${config.exampleButtons.map((button) => `<button type="button" data-example="${escapeHtml(button.key)}">${escapeHtml(button.label)}</button>`).join('')}</div>
            </div>
          </details>
        </div>
      </div>
      <div class="compare-grid">
        <section class="tool-panel">
          <div class="panel-head"><div><strong>List A</strong><span>${escapeHtml(config.inputAHint)}</span></div><button class="copy-button" type="button" id="clearAButton">Clear</button></div>
          <textarea class="textarea" id="inputA" placeholder="1001&#10;1002&#10;1003"></textarea>
        </section>
        <section class="tool-panel">
          <div class="panel-head"><div><strong>List B</strong><span>${escapeHtml(config.inputBHint)}</span></div><button class="copy-button" type="button" id="clearBButton">Clear</button></div>
          <textarea class="textarea" id="inputB" placeholder="1003&#10;1004&#10;1005"></textarea>
        </section>
      </div>
      <div class="compare-results-grid">
        <section class="tool-panel result-panel">
          <div class="panel-head"><div><strong>Common values</strong><span>${escapeHtml(config.commonHint)}</span></div><button class="copy-button" type="button" data-copy-result="common">Copy</button></div>
          <textarea class="textarea" id="commonOutput" readonly></textarea>
        </section>
        <section class="tool-panel result-panel">
          <div class="panel-head"><div><strong>Only in A</strong><span>${escapeHtml(config.onlyAHint)}</span></div><button class="copy-button" type="button" data-copy-result="only-a">Copy</button></div>
          <textarea class="textarea" id="onlyAOutput" readonly></textarea>
        </section>
        <section class="tool-panel result-panel">
          <div class="panel-head"><div><strong>Only in B</strong><span>${escapeHtml(config.onlyBHint)}</span></div><button class="copy-button" type="button" data-copy-result="only-b">Copy</button></div>
          <textarea class="textarea" id="onlyBOutput" readonly></textarea>
        </section>
      </div>
      ${renderStats(config.stats)}
    </section>
    ${renderHowTo(tool)}
    ${renderExample(tool)}
    ${renderFaq(tool)}
    ${pageFooter(tool)}
  </main>
  <div class="toast" id="toast">Ready.</div>
  <script src="../assets/site.js"></script>
  <script>
    window.DevFormatCompareConfig = ${jsonScript(config)};
  </script>
  <script src="../assets/compare-tool.js"></script>
</body>
</html>`;
}

function renderHubPage() {
  const pageUrl = `${domain}/cleanup/`;
  const pageJson = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Text Cleanup & Extraction Tools',
    url: pageUrl,
    description: cleanupHub.description,
    inLanguage: 'en'
  };
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(cleanupHub.title)}</title>
  <meta name="description" content="${escapeHtml(cleanupHub.description)}">
  <meta name="keywords" content="${escapeHtml(cleanupHub.keywords)}">
  <meta property="og:title" content="${escapeHtml(cleanupHub.title)}">
  <meta property="og:description" content="${escapeHtml(cleanupHub.description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${pageUrl}">
  <link rel="canonical" href="${pageUrl}">
  <link rel="stylesheet" href="../assets/site.css">
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg?v=20260311">
  <script type="application/ld+json">
${jsonScript(pageJson)}
  </script>
</head>
<body data-page="cleanup">
  <header class="site-header">
    <div class="site-header-inner">
      <a class="brand" href="../">
        <div class="brand-mark"><img src="../assets/devformat-logo.svg?v=20260311" alt="DevFormat logo"></div>
        <div class="brand-copy"><strong>DevFormat</strong><span>Preset-driven text tools for developers</span></div>
      </a>
      ${nav('../', true)}
    </div>
  </header>
  <main class="page-shell">
    <section class="hero compact">
      <span class="hero-kicker">Cleanup & Extraction</span>
      <h1>Text cleanup and extraction tools for lists, logs, exports, and pasted notes.</h1>
      <p>Use this category when the job is not formatting one value, but cleaning a full set of values: remove duplicates, sort lines, count text, extract emails, extract URLs, or compare two lists.</p>
      <div class="hero-actions">
        <a class="button primary" href="../remove-duplicate-lines/">Start with duplicate cleanup</a>
        <a class="button" href="../compare-two-lists/">Compare two lists</a>
      </div>
    </section>
    <section class="split-layout">
      <article class="content-card">
        <h2>What belongs here</h2>
        <p>This category covers list cleanup, text inspection, value extraction, and side-by-side comparison. It is the next step after text transform when copied data is noisy or mixed.</p>
      </article>
      <article class="content-card">
        <h2>Good next steps</h2>
        <ul>
          <li>Use cleanup first when the copied text is messy.</li>
          <li>Move to quote, multiline, or URL encode once the values are clean.</li>
          <li>Use related links to chain tasks without losing your place.</li>
        </ul>
      </article>
    </section>
    <section class="catalog-grid cleanup-catalog-grid">
      ${cleanupTools.map((tool) => `<article class="tool-card"><span class="hero-kicker">${escapeHtml(tool.kicker)}</span><h3>${escapeHtml(tool.h1)}</h3><p>${escapeHtml(tool.description)}</p><div class="tool-card-footer"><a class="tool-link" href="../${tool.slug}/">Open tool</a></div></article>`).join('')}
    </section>
  </main>
  <script src="../assets/site.js"></script>
</body>
</html>`;
}

writeFile('cleanup/index.html', renderHubPage());
cleanupTools.forEach((tool) => {
  const html = tool.engine === 'compare'
    ? renderCompareToolPage(tool)
    : tool.engine === 'extract'
      ? renderExtractToolPage(tool)
      : tool.engine === 'csv-column'
        ? renderCsvToolPage(tool)
        : renderListToolPage(tool);
  writeFile(`${tool.slug}/index.html`, html);
});

const sitemapEntries = cleanupTools.map((tool) => `  <url><loc>${domain}/${tool.slug}/</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`).join('\n');
fs.writeFileSync(path.join(root, 'scripts', 'cleanup-sitemap-snippet.xml'), sitemapEntries + '\n');
console.log(`Generated ${cleanupTools.length + 1} cleanup pages.`);
