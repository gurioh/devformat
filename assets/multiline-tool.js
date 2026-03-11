(function () {
  const defaults = {
    presets: {
      'sql-in': { delimiter: ', ', quoteChar: "'", wrapStart: '(', wrapEnd: ')' },
      'js-array': { delimiter: ', ', quoteChar: '"', wrapStart: '[', wrapEnd: ']' },
      'python-list': { delimiter: ', ', quoteChar: "'", wrapStart: '[', wrapEnd: ']' },
      'csv': { delimiter: ',', quoteChar: '', wrapStart: '', wrapEnd: '' },
      'comma': { delimiter: ', ', quoteChar: '', wrapStart: '', wrapEnd: '' },
      'pipe': { delimiter: ' | ', quoteChar: '', wrapStart: '', wrapEnd: '' },
      'tab': { delimiter: '\\t', quoteChar: '', wrapStart: '', wrapEnd: '' },
      'custom': null
    },
    examples: {
      fruit: 'apple\nbanana\ncherry\ndragonfruit',
      ids: '1001\n1002\n1003\n1004',
      emails: 'hello@example.com\nops@example.com\nsupport@example.com'
    },
    defaultPreset: 'sql-in',
    defaultExample: 'fruit',
    strings: {
      modeForward: 'Forward',
      modeReverse: 'Reverse',
      inputHintForward: 'Paste multiline text',
      inputHintReverse: 'Paste a joined string',
      outputHintForward: 'Copy ready result',
      outputHintReverse: 'Rows split by delimiter',
      copySuccess: 'Output copied.'
    }
  };

  const config = window.DevFormatMultilineConfig || {};
  const strings = Object.assign({}, defaults.strings, config.strings || {});
  const presets = config.presets || defaults.presets;
  const examples = config.examples || defaults.examples;
  const defaultPreset = config.defaultPreset || defaults.defaultPreset;
  const defaultExample = config.defaultExample || defaults.defaultExample;

  const input = document.getElementById('input');
  const output = document.getElementById('output');
  const delimiter = document.getElementById('delimiter');
  const quoteChar = document.getElementById('quoteChar');
  const wrapStart = document.getElementById('wrapStart');
  const wrapEnd = document.getElementById('wrapEnd');
  const trimLines = document.getElementById('trimLines');
  const skipEmpty = document.getElementById('skipEmpty');
  const advancedPanel = document.getElementById('advancedPanel');
  const inputHint = document.getElementById('inputHint');
  const outputHint = document.getElementById('outputHint');
  const copyButton = document.getElementById('copyButton');
  const clearButton = document.getElementById('clearButton');

  if (!input || !output || !delimiter || !quoteChar || !wrapStart || !wrapEnd || !trimLines || !skipEmpty || !advancedPanel || !copyButton || !clearButton) {
    return;
  }

  const state = {
    reversed: false,
    activePreset: defaultPreset
  };

  function parseEscapes(value) {
    return value.replace(/\\t/g, '\t').replace(/\\n/g, '\n');
  }

  function syncHints() {
    inputHint.textContent = state.reversed ? strings.inputHintReverse : strings.inputHintForward;
    outputHint.textContent = state.reversed ? strings.outputHintReverse : strings.outputHintForward;
  }

  function markActivePreset(key) {
    state.activePreset = key;
    document.querySelectorAll('[data-preset]').forEach(function (button) {
      button.classList.toggle('active', button.dataset.preset === key);
    });
  }

  function applyPreset(key) {
    const preset = presets[key];
    markActivePreset(key);
    if (key === 'custom') advancedPanel.open = true;
    if (!preset) return;
    delimiter.value = preset.delimiter;
    quoteChar.value = preset.quoteChar;
    wrapStart.value = preset.wrapStart;
    wrapEnd.value = preset.wrapEnd;
    convert();
  }

  function markCustomIfNeeded() {
    const active = presets[state.activePreset];
    if (!active) return;
    const current = {
      delimiter: delimiter.value,
      quoteChar: quoteChar.value,
      wrapStart: wrapStart.value,
      wrapEnd: wrapEnd.value
    };
    if (
      current.delimiter !== active.delimiter ||
      current.quoteChar !== active.quoteChar ||
      current.wrapStart !== active.wrapStart ||
      current.wrapEnd !== active.wrapEnd
    ) {
      markActivePreset('custom');
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
    document.getElementById('modeStat').textContent = state.reversed ? strings.modeReverse : strings.modeForward;
    document.getElementById('itemStat').textContent = String(metrics.items);
    document.getElementById('lineStat').textContent = String(metrics.inputLines);
    document.getElementById('uniqueStat').textContent = String(metrics.uniqueCount);
    document.getElementById('duplicateStat').textContent = String(metrics.duplicateCount);
    document.getElementById('inputCharStat').textContent = String(metrics.inputChars);
    document.getElementById('charStat').textContent = String(metrics.outputChars);
    document.getElementById('deltaStat').textContent = formatDelta(metrics.deltaChars);
  }

  function convertForward(raw) {
    let lines = raw.split('\n');
    if (trimLines.checked) lines = lines.map(function (line) { return line.trim(); });
    if (skipEmpty.checked) lines = lines.filter(function (line) { return line.length > 0; });
    const result = wrapStart.value + lines.map(function (line) {
      return quoteChar.value + line + quoteChar.value;
    }).join(parseEscapes(delimiter.value)) + wrapEnd.value;
    output.value = result;
    return buildMetrics(lines, raw, result);
  }

  function convertReverse(raw) {
    let value = raw.trim();
    if (wrapStart.value && wrapEnd.value && value.startsWith(wrapStart.value) && value.endsWith(wrapEnd.value)) {
      value = value.slice(wrapStart.value.length, value.length - wrapEnd.value.length);
    }
    let parts = value ? value.split(parseEscapes(delimiter.value)) : [];
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

    const metrics = state.reversed ? convertReverse(raw) : convertForward(raw);
    updateStats(metrics);
    DevFormat.trackEvent('tool_convert', {
      tool: 'multiline',
      mode: state.reversed ? 'reverse' : 'forward',
      preset: state.activePreset,
      item_count: metrics.items,
      line_count: metrics.inputLines,
      unique_count: metrics.uniqueCount,
      duplicate_count: metrics.duplicateCount,
      input_chars: metrics.inputChars,
      output_chars: metrics.outputChars,
      delta_chars: metrics.deltaChars
    });
  }

  document.querySelectorAll('[data-direction]').forEach(function (button) {
    button.addEventListener('click', function () {
      state.reversed = button.dataset.direction === 'reverse';
      document.querySelectorAll('[data-direction]').forEach(function (node) {
        node.classList.toggle('active', node === button);
      });
      syncHints();
      input.value = output.value;
      output.value = '';
      convert();
    });
  });

  document.querySelectorAll('[data-preset]').forEach(function (button) {
    button.addEventListener('click', function () {
      applyPreset(button.dataset.preset);
      DevFormat.trackEvent('preset_select', { tool: 'multiline', preset: button.dataset.preset });
    });
  });

  [delimiter, quoteChar, wrapStart, wrapEnd].forEach(function (field) {
    field.addEventListener('input', function () {
      markCustomIfNeeded();
      convert();
    });
  });

  [trimLines, skipEmpty, input].forEach(function (field) {
    field.addEventListener(field === input ? 'input' : 'change', convert);
  });

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
    convert();
  });

  syncHints();
  input.value = examples[defaultExample] || '';
  applyPreset(defaultPreset);
})();
