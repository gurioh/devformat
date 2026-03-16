(function () {
  const defaults = {
    toolKey: 'extract-tool',
    extractType: 'emails',
    modeLabel: 'Extract',
    inputHint: 'Paste mixed text',
    outputHint: 'One match per line',
    placeholder: '',
    copySuccess: 'Output copied.',
    examples: {},
    exampleButtons: [],
    defaultExample: '',
    controls: { uniqueOnly: true, sortOutput: false },
    stats: []
  };

  const config = Object.assign({}, defaults, window.DevFormatExtractConfig || {});
  const input = document.getElementById('input');
  const output = document.getElementById('output');
  const copyButton = document.getElementById('copyButton');
  const clearButton = document.getElementById('clearButton');
  const uniqueOnly = document.getElementById('uniqueOnly');
  const sortOutput = document.getElementById('sortOutput');
  const inputHint = document.getElementById('inputHint');
  const outputHint = document.getElementById('outputHint');

  if (!input || !output || !copyButton || !clearButton || !uniqueOnly || !sortOutput) return;

  const storedSettings = DevFormat.loadToolSettings(config.toolKey, {
    uniqueOnly: Boolean(config.controls.uniqueOnly),
    sortOutput: Boolean(config.controls.sortOutput)
  });

  function persistSettings() {
    DevFormat.saveToolSettings(config.toolKey, {
      uniqueOnly: Boolean(uniqueOnly.checked),
      sortOutput: Boolean(sortOutput.checked)
    });
  }

  const patterns = {
    emails: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    urls: /(https?:\/\/[^\s"'<>]+|www\.[^\s"'<>]+)/gi,
    numbers: /[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/g
  };

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

  function extractMatches(raw) {
    const pattern = patterns[config.extractType];
    const matches = raw.match(pattern) || [];
    let values = matches.slice();
    if (uniqueOnly.checked) {
      const seen = new Set();
      values = values.filter(function (value) {
        const normalized = String(value).toLowerCase();
        if (seen.has(normalized)) return false;
        seen.add(normalized);
        return true;
      });
    }
    if (sortOutput.checked) {
      values = values.slice().sort(function (a, b) { return a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true }); });
    }
    const result = values.join('\n');
    return {
      result: result,
      metrics: {
        modeLabel: config.modeLabel,
        matches: matches.length,
        uniqueMatches: new Set(matches.map(function (value) { return String(value).toLowerCase(); })).size,
        duplicatesRemoved: Math.max(0, matches.length - values.length),
        outputLines: values.length,
        inputChars: raw.length,
        outputChars: result.length,
        deltaChars: formatDelta(result.length - raw.length)
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
    const extracted = extractMatches(raw);
    output.value = extracted.result;
    updateStats(extracted.metrics);
    DevFormat.trackEvent('tool_convert', {
      tool: config.toolKey,
      mode: config.extractType,
      item_count: extracted.metrics.matches,
      line_count: extracted.metrics.outputLines,
      unique_count: extracted.metrics.uniqueMatches,
      duplicate_count: extracted.metrics.duplicatesRemoved,
      input_chars: raw.length,
      output_chars: extracted.result.length,
      delta_chars: extracted.result.length - raw.length
    });
  }

  uniqueOnly.addEventListener('change', function () {
    persistSettings();
    convert();
  });
  sortOutput.addEventListener('change', function () {
    persistSettings();
    convert();
  });
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
  uniqueOnly.checked = Boolean(storedSettings.uniqueOnly);
  sortOutput.checked = Boolean(storedSettings.sortOutput);
  updateStats(emptyMetrics());
  convert();
})();
