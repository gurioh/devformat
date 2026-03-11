(function () {
  const defaults = {
    examples: {
      json: 'Line one\nLine "two" with a tab\tand slash \\\\',
      javascript: "const label = 'hello world';",
      regex: 'price+(usd)? [2026]'
    },
    defaultMode: 'escape',
    defaultPreset: 'json',
    strings: {
      modeEscape: 'Escape',
      modeUnescape: 'Unescape',
      presetJson: 'JSON',
      presetJavascript: 'Javascript',
      presetRegex: 'Regex',
      inputHintEscape: 'Raw string',
      inputHintUnescape: 'Escaped string',
      copySuccess: 'Escaped output copied.'
    }
  };

  const config = window.DevFormatEscapeConfig || {};
  const strings = Object.assign({}, defaults.strings, config.strings || {});
  const examples = config.examples || defaults.examples;
  let mode = config.defaultMode || defaults.defaultMode;
  let preset = config.defaultPreset || defaults.defaultPreset;

  const input = document.getElementById('input');
  const output = document.getElementById('output');
  const inputHint = document.getElementById('inputHint');
  const copyButton = document.getElementById('copyButton');
  const clearButton = document.getElementById('clearButton');

  if (!input || !output || !inputHint || !copyButton || !clearButton) return;

  function escapeJson(value) {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\u0008/g, '\\b')
      .replace(/\f/g, '\\f')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  function escapeJavascript(value) {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\u0008/g, '\\b')
      .replace(/\f/g, '\\f')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function unescapeCommon(value) {
    return value
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\f/g, '\f')
      .replace(/\\b/g, '\b')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, '\\');
  }

  function unescapeRegex(value) {
    return value.replace(/\\([.*+?^${}()|[\]\\])/g, '$1');
  }

  function updateStats() {
    document.getElementById('modeStat').textContent = mode === 'escape' ? strings.modeEscape : strings.modeUnescape;
    document.getElementById('presetStat').textContent = preset === 'json' ? strings.presetJson : preset === 'javascript' ? strings.presetJavascript : strings.presetRegex;
    document.getElementById('charStat').textContent = String(output.value.length);
    inputHint.textContent = mode === 'escape' ? strings.inputHintEscape : strings.inputHintUnescape;
  }

  function convert() {
    if (!input.value) {
      output.value = '';
      updateStats();
      return;
    }

    if (mode === 'escape') {
      if (preset === 'json') {
        output.value = escapeJson(input.value);
      } else if (preset === 'javascript') {
        output.value = escapeJavascript(input.value);
      } else {
        output.value = escapeRegex(input.value);
      }
    } else if (preset === 'regex') {
      output.value = unescapeRegex(input.value);
    } else {
      output.value = unescapeCommon(input.value);
    }

    updateStats();
    DevFormat.trackEvent('tool_convert', {
      tool: 'escape',
      mode: mode,
      preset: preset,
      input_chars: input.value.length,
      output_chars: output.value.length,
      line_count: input.value ? input.value.split('\n').length : 0
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
      preset = button.dataset.preset;
      document.querySelectorAll('[data-preset]').forEach(function (node) {
        node.classList.toggle('active', node === button);
      });
      convert();
      DevFormat.trackEvent('preset_select', { tool: 'escape', preset: preset });
    });
  });

  input.addEventListener('input', convert);
  copyButton.addEventListener('click', function () {
    DevFormat.copyText(output.value, strings.copySuccess);
  });
  clearButton.addEventListener('click', function () {
    input.value = '';
    output.value = '';
    updateStats();
    input.focus();
  });

  DevFormat.wireExampleButtons(function (key) {
    input.value = examples[key] || '';
    convert();
  });

  input.value = examples[config.defaultExample || 'json'] || examples.json;
  updateStats();
  convert();
})();
