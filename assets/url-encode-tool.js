(function () {
  const defaults = {
    examples: {
      query: 'hello world & lang=en',
      url: 'filter=status:open&sort=updated_at desc',
      encoded: 'hello%20world%20%26%20lang%3Den'
    },
    defaultMode: 'encode',
    defaultExample: 'query',
    strings: {
      statusReady: 'Ready',
      statusSuccess: 'Success',
      statusError: 'Error',
      inputHintEncode: 'Raw value',
      inputHintDecode: 'URL-encoded value',
      copySuccess: 'URL result copied.',
      invalidPrefix: 'Invalid input for '
    }
  };

  const config = window.DevFormatUrlEncodeConfig || {};
  const strings = Object.assign({}, defaults.strings, config.strings || {});
  const examples = config.examples || defaults.examples;
  let mode = config.defaultMode || defaults.defaultMode;

  const input = document.getElementById('input');
  const output = document.getElementById('output');
  const inputHint = document.getElementById('inputHint');
  const copyButton = document.getElementById('copyButton');
  const clearButton = document.getElementById('clearButton');

  if (!input || !output || !inputHint || !copyButton || !clearButton) return;

  function updateStats(status) {
    document.getElementById('statusStat').textContent = status;
    document.getElementById('inputStat').textContent = String(input.value.length);
    document.getElementById('outputStat').textContent = String(output.value.length);
    inputHint.textContent = mode === 'encode' ? strings.inputHintEncode : strings.inputHintDecode;
  }

  function convert() {
    if (!input.value) {
      output.value = '';
      updateStats(strings.statusReady);
      return;
    }

    try {
      output.value = mode === 'encode' ? encodeURIComponent(input.value) : decodeURIComponent(input.value);
      updateStats(strings.statusSuccess);
      DevFormat.trackEvent('tool_convert', {
        tool: 'url_encode',
        mode: mode,
        status: 'success',
        input_chars: input.value.length,
        output_chars: output.value.length,
        line_count: input.value ? input.value.split('\n').length : 0
      });
    } catch (error) {
      output.value = strings.invalidPrefix + mode + '.';
      updateStats(strings.statusError);
    }
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

  input.addEventListener('input', convert);
  copyButton.addEventListener('click', function () {
    DevFormat.copyText(output.value, strings.copySuccess);
  });
  clearButton.addEventListener('click', function () {
    input.value = '';
    output.value = '';
    updateStats(strings.statusReady);
    input.focus();
  });

  DevFormat.wireExampleButtons(function (key) {
    input.value = examples[key] || '';
    if (key === 'encoded') {
      mode = 'decode';
      document.querySelectorAll('[data-mode]').forEach(function (node) {
        node.classList.toggle('active', node.dataset.mode === 'decode');
      });
    } else {
      mode = 'encode';
      document.querySelectorAll('[data-mode]').forEach(function (node) {
        node.classList.toggle('active', node.dataset.mode === 'encode');
      });
    }
    convert();
  });

  input.value = examples[config.defaultExample || defaults.defaultExample] || examples.query;
  updateStats(strings.statusReady);
  convert();
})();
