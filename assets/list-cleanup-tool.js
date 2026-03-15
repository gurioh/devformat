(function () {
  const defaults = {
    toolKey: 'list-cleanup',
    operation: 'dedupe',
    modeLabel: 'Cleanup',
    inputHint: 'Paste text',
    outputHint: 'Result',
    placeholder: '',
    copySuccess: 'Output copied.',
    examples: {},
    exampleButtons: [],
    defaultExample: '',
    presets: [],
    defaultPreset: '',
    controls: { trim: true, skipEmpty: true },
    stats: []
  };

  const config = Object.assign({}, defaults, window.DevFormatListCleanupConfig || {});
  const input = document.getElementById('input');
  const output = document.getElementById('output');
  const copyButton = document.getElementById('copyButton');
  const clearButton = document.getElementById('clearButton');
  const advancedPanel = document.getElementById('advancedPanel');
  const trimValues = document.getElementById('trimValues');
  const skipEmpty = document.getElementById('skipEmpty');
  const inputHint = document.getElementById('inputHint');
  const outputHint = document.getElementById('outputHint');

  if (!input || !output || !copyButton || !clearButton || !advancedPanel) return;

  let activePreset = config.defaultPreset || (config.presets[0] && config.presets[0].key) || '';

  function updateStats(metrics) {
    document.querySelectorAll('[data-stat]').forEach(function (node) {
      const key = node.dataset.stat;
      const value = metrics[key];
      node.textContent = value === undefined || value === null ? '0' : String(value);
    });
  }

  function emptyMetrics() {
    const metrics = { modeLabel: config.modeLabel };
    (config.stats || []).forEach(function (stat) {
      if (stat.key !== 'modeLabel') metrics[stat.key] = 0;
    });
    return metrics;
  }

  function formatDelta(value) {
    if (value > 0) return '+' + value;
    return String(value);
  }

  function getLines(raw) {
    const originalLines = raw.split('\n');
    let working = originalLines.slice();
    if (trimValues && trimValues.checked) {
      working = working.map(function (line) { return line.trim(); });
    }
    if (skipEmpty && skipEmpty.checked) {
      working = working.filter(function (line) { return line.length > 0; });
    }
    return {
      originalLines: originalLines,
      lines: working,
      emptyLines: originalLines.filter(function (line) { return line.length === 0; }).length,
      rawLength: raw.length
    };
  }

  function getForcedTrimLines(raw, dropEmpty) {
    const originalLines = raw.split('\n');
    let lines = originalLines.map(function (line) { return line.trim(); });
    if (dropEmpty) {
      lines = lines.filter(function (line) { return line.length > 0; });
    }
    return {
      originalLines: originalLines,
      lines: lines,
      emptyLines: originalLines.filter(function (line) { return line.trim().length === 0; }).length,
      rawLength: raw.length
    };
  }

  function renderSummary(metrics) {
    return [
      'Lines: ' + metrics.totalLines,
      'Non-empty lines: ' + metrics.nonEmptyLines,
      'Empty lines: ' + metrics.emptyLines,
      'Words: ' + metrics.wordCount,
      'Characters: ' + metrics.characters,
      'Unique lines: ' + metrics.uniqueLines,
      'Longest line: ' + metrics.longestLine
    ].join('\n');
  }

  function sortValues(lines) {
    const values = lines.slice();
    const comparators = {
      'alpha-asc': function (a, b) { return a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true }); },
      'alpha-desc': function (a, b) { return b.localeCompare(a, undefined, { sensitivity: 'base', numeric: true }); },
      'numeric-asc': function (a, b) {
        const numA = Number(a);
        const numB = Number(b);
        if (!Number.isNaN(numA) && !Number.isNaN(numB)) return numA - numB;
        return a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true });
      },
      'numeric-desc': function (a, b) {
        const numA = Number(a);
        const numB = Number(b);
        if (!Number.isNaN(numA) && !Number.isNaN(numB)) return numB - numA;
        return b.localeCompare(a, undefined, { sensitivity: 'base', numeric: true });
      }
    };
    values.sort(comparators[activePreset] || comparators['alpha-asc']);
    return values;
  }

  function compute(raw) {
    const prepared = config.operation === 'trim-whitespace'
      ? getForcedTrimLines(raw, Boolean(skipEmpty && skipEmpty.checked))
      : getLines(raw);
    const lines = prepared.lines;
    const uniqueCount = new Set(lines).size;
    const trimmedLineCount = prepared.originalLines.filter(function (line) {
      return line !== line.trim();
    }).length;
    let outputLines = [];
    let modeLabel = config.modeLabel;

    if (config.operation === 'dedupe') {
      const seen = new Set();
      outputLines = lines.filter(function (line) {
        if (seen.has(line)) return false;
        seen.add(line);
        return true;
      });
    } else if (config.operation === 'sort') {
      outputLines = sortValues(lines);
      const preset = (config.presets || []).find(function (item) { return item.key === activePreset; });
      if (preset) modeLabel = preset.label;
    } else if (config.operation === 'remove-empty') {
      outputLines = prepared.originalLines.filter(function (line) {
        const next = trimValues && trimValues.checked ? line.trim() : line;
        return next.length > 0;
      });
    } else if (config.operation === 'trim-whitespace') {
      outputLines = lines.slice();
    } else if (config.operation === 'count') {
      const metrics = {
        modeLabel: config.modeLabel,
        totalLines: prepared.originalLines.length,
        nonEmptyLines: prepared.originalLines.filter(function (line) { return line.trim().length > 0; }).length,
        emptyLines: prepared.originalLines.filter(function (line) { return line.length === 0; }).length,
        wordCount: raw.trim() ? raw.trim().split(/\s+/).filter(Boolean).length : 0,
        characters: raw.length,
        uniqueLines: new Set((trimValues && trimValues.checked ? prepared.originalLines.map(function (line) { return line.trim(); }) : prepared.originalLines)).size,
        longestLine: prepared.originalLines.reduce(function (max, line) { return Math.max(max, line.length); }, 0)
      };
      const report = renderSummary(metrics);
      return {
        output: report,
        metrics: metrics
      };
    }

    const outputValue = outputLines.join('\n');
    return {
      output: outputValue,
      metrics: {
        modeLabel: modeLabel,
        totalLines: prepared.originalLines.length,
        uniqueLines: uniqueCount,
        duplicatesRemoved: Math.max(0, lines.length - uniqueCount),
        removedLines: Math.max(0, prepared.originalLines.length - outputLines.length),
        trimmedLines: trimmedLineCount,
        emptyLines: prepared.emptyLines,
        outputLines: outputLines.length,
        inputChars: raw.length,
        outputChars: outputValue.length,
        deltaChars: formatDelta(outputValue.length - raw.length)
      }
    };
  }

  function convert() {
    const raw = input.value;
    if (!raw.length) {
      output.value = '';
      updateStats(emptyMetrics());
      return;
    }

    const result = compute(raw);
    output.value = result.output;
    updateStats(result.metrics);

    DevFormat.trackEvent('tool_convert', {
      tool: config.toolKey,
      mode: config.operation,
      preset: activePreset || config.operation,
      item_count: result.metrics.totalLines || 0,
      line_count: result.metrics.totalLines || 0,
      unique_count: result.metrics.uniqueLines || 0,
      duplicate_count: result.metrics.duplicatesRemoved || 0,
      input_chars: raw.length,
      output_chars: result.output.length,
      delta_chars: result.output.length - raw.length
    });
  }

  document.querySelectorAll('[data-preset]').forEach(function (button) {
    button.addEventListener('click', function () {
      activePreset = button.dataset.preset;
      document.querySelectorAll('[data-preset]').forEach(function (node) {
        node.classList.toggle('active', node === button);
      });
      DevFormat.trackEvent('preset_select', { tool: config.toolKey, preset: activePreset });
      convert();
    });
  });

  if (trimValues) trimValues.addEventListener('change', convert);
  if (skipEmpty) skipEmpty.addEventListener('change', convert);
  input.addEventListener('input', convert);

  DevFormat.wireExampleButtons(function (key) {
    input.value = config.examples[key] || '';
    convert();
  });

  copyButton.addEventListener('click', function () {
    DevFormat.copyText(output.value, config.copySuccess);
  });

  clearButton.addEventListener('click', function () {
    input.value = '';
    output.value = '';
    updateStats(emptyMetrics());
    input.focus();
  });

  if (inputHint) inputHint.textContent = config.inputHint;
  if (outputHint) outputHint.textContent = config.outputHint;
  input.placeholder = config.placeholder;
  input.value = config.examples[config.defaultExample] || '';
  updateStats(emptyMetrics());
  convert();
})();
