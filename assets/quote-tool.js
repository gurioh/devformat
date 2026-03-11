(function () {
  const defaults = {
    presets: {
      'single-lines': { quoteChar: "'", delimiter: '\\n' },
      'double-lines': { quoteChar: '"', delimiter: '\\n' },
      'csv-single': { quoteChar: "'", delimiter: ', ' },
      'csv-double': { quoteChar: '"', delimiter: ', ' },
      'backticks': { quoteChar: '`', delimiter: '\\n' },
      'custom': null
    },
    examples: {
      env: 'API_KEY\nAPI_SECRET\nAPI_HOST',
      emails: 'hello@example.com\nops@example.com\nsupport@example.com',
      quoted: '"apple", "banana", "cherry"'
    },
    defaultMode: 'quote',
    defaultPreset: 'single-lines',
    defaultExample: 'env',
    strings: {
      modeQuote: 'Quote',
      modeUnquote: 'Unquote',
      inputHintQuote: 'Multiline values',
      inputHintUnquote: 'Quoted list or quoted rows',
      copySuccess: 'Quoted output copied.'
    }
  };

  const config = window.DevFormatQuoteConfig || {};
  const strings = Object.assign({}, defaults.strings, config.strings || {});
  const presets = config.presets || defaults.presets;
  const examples = config.examples || defaults.examples;
  let mode = config.defaultMode || defaults.defaultMode;
  let activePreset = config.defaultPreset || defaults.defaultPreset;

  const input = document.getElementById('input');
  const output = document.getElementById('output');
  const quoteChar = document.getElementById('quoteChar');
  const delimiter = document.getElementById('delimiter');
  const trimLines = document.getElementById('trimLines');
  const skipEmpty = document.getElementById('skipEmpty');
  const advancedPanel = document.getElementById('advancedPanel');
  const inputHint = document.getElementById('inputHint');
  const copyButton = document.getElementById('copyButton');
  const clearButton = document.getElementById('clearButton');

  if (!input || !output || !quoteChar || !delimiter || !trimLines || !skipEmpty || !advancedPanel || !inputHint || !copyButton || !clearButton) return;

  function parseEscapes(value) {
    return value.replace(/\\t/g, '\t').replace(/\\n/g, '\n');
  }

  function markPreset(key) {
    activePreset = key;
    document.querySelectorAll('[data-preset]').forEach(function (button) {
      button.classList.toggle('active', button.dataset.preset === key);
    });
  }

  function applyPreset(key) {
    const preset = presets[key];
    markPreset(key);
    if (key === 'custom') advancedPanel.open = true;
    if (!preset) return;
    quoteChar.value = preset.quoteChar;
    delimiter.value = preset.delimiter;
    convert();
  }

  function markCustomIfNeeded() {
    const preset = presets[activePreset];
    if (!preset) return;
    if (quoteChar.value !== preset.quoteChar || delimiter.value !== preset.delimiter) {
      markPreset('custom');
      advancedPanel.open = true;
    }
  }

  function formatDelta(delta) {
    if (delta > 0) return '+' + delta;
    return String(delta);
  }

  function buildMetrics(values, raw, result) {
    const uniqueCount = new Set(values).size;
    return {
      items: values.length,
      inputLines: raw ? raw.split('\n').length : 0,
      uniqueCount: uniqueCount,
      duplicateCount: Math.max(0, values.length - uniqueCount),
      inputChars: raw.length,
      outputChars: result.length,
      deltaChars: result.length - raw.length
    };
  }

  function updateStats(metrics) {
    document.getElementById('modeStat').textContent = mode === 'quote' ? strings.modeQuote : strings.modeUnquote;
    document.getElementById('itemStat').textContent = String(metrics.items);
    document.getElementById('lineStat').textContent = String(metrics.inputLines);
    document.getElementById('uniqueStat').textContent = String(metrics.uniqueCount);
    document.getElementById('duplicateStat').textContent = String(metrics.duplicateCount);
    document.getElementById('inputCharStat').textContent = String(metrics.inputChars);
    document.getElementById('charStat').textContent = String(metrics.outputChars);
    document.getElementById('deltaStat').textContent = formatDelta(metrics.deltaChars);
    inputHint.textContent = mode === 'quote' ? strings.inputHintQuote : strings.inputHintUnquote;
  }

  function quoteLines(raw) {
    let lines = raw.split('\n');
    if (trimLines.checked) lines = lines.map(function (line) { return line.trim(); });
    if (skipEmpty.checked) lines = lines.filter(function (line) { return line.length > 0; });
    const result = lines.map(function (line) { return quoteChar.value + line + quoteChar.value; }).join(parseEscapes(delimiter.value));
    output.value = result;
    return buildMetrics(lines, raw, result);
  }

  function unquoteLines(raw) {
    let parts = raw.split(parseEscapes(delimiter.value));
    parts = parts.map(function (part) {
      let next = trimLines.checked ? part.trim() : part;
      if (quoteChar.value && next.startsWith(quoteChar.value) && next.endsWith(quoteChar.value)) {
        next = next.slice(quoteChar.value.length, next.length - quoteChar.value.length);
      }
      return next;
    });
    if (skipEmpty.checked) parts = parts.filter(function (part) { return part.length > 0; });
    const result = parts.join('\n');
    output.value = result;
    return buildMetrics(parts, raw, result);
  }

  function convert() {
    const raw = input.value;
    if (!raw.trim()) {
      output.value = '';
      updateStats(buildMetrics([], '', ''));
      return;
    }
    const metrics = mode === 'quote' ? quoteLines(raw) : unquoteLines(raw);
    updateStats(metrics);
    DevFormat.trackEvent('tool_convert', {
      tool: 'quote',
      mode: mode,
      preset: activePreset,
      item_count: metrics.items,
      line_count: metrics.inputLines,
      unique_count: metrics.uniqueCount,
      duplicate_count: metrics.duplicateCount,
      input_chars: metrics.inputChars,
      output_chars: metrics.outputChars,
      delta_chars: metrics.deltaChars
    });
  }

  document.querySelectorAll('[data-mode]').forEach(function (button) {
    button.addEventListener('click', function () {
      mode = button.dataset.mode;
      document.querySelectorAll('[data-mode]').forEach(function (node) {
        node.classList.toggle('active', node === button);
      });
      input.value = output.value;
      output.value = '';
      convert();
    });
  });

  document.querySelectorAll('[data-preset]').forEach(function (button) {
    button.addEventListener('click', function () {
      applyPreset(button.dataset.preset);
      DevFormat.trackEvent('preset_select', { tool: 'quote', preset: button.dataset.preset });
    });
  });

  [quoteChar, delimiter].forEach(function (field) {
    field.addEventListener('input', function () {
      markCustomIfNeeded();
      convert();
    });
  });

  [trimLines, skipEmpty].forEach(function (field) {
    field.addEventListener('change', convert);
  });
  input.addEventListener('input', convert);

  copyButton.addEventListener('click', function () {
    DevFormat.copyText(output.value, strings.copySuccess);
  });
  clearButton.addEventListener('click', function () {
    input.value = '';
    output.value = '';
    updateStats(buildMetrics([], '', ''));
    input.focus();
  });

  DevFormat.wireExampleButtons(function (key) {
    input.value = examples[key] || '';
    if (key === 'quoted') {
      mode = 'unquote';
      document.querySelectorAll('[data-mode]').forEach(function (node) {
        node.classList.toggle('active', node.dataset.mode === 'unquote');
      });
      applyPreset('csv-double');
    } else {
      mode = 'quote';
      document.querySelectorAll('[data-mode]').forEach(function (node) {
        node.classList.toggle('active', node.dataset.mode === 'quote');
      });
      applyPreset(config.defaultPreset || defaults.defaultPreset);
    }
    convert();
  });

  input.value = examples[config.defaultExample || defaults.defaultExample] || examples.env;
  applyPreset(config.defaultPreset || defaults.defaultPreset);
})();
