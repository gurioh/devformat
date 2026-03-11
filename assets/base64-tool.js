(function () {
  const defaults = {
    examples: {
      json: '{"user":"devformat","roles":["admin","editor"]}',
      url: 'https://example.com/path?q=hello world&lang=en',
      base64: 'eyJ1c2VyIjoiZGV2Zm9ybWF0Iiwicm9sZXMiOlsiYWRtaW4iLCJlZGl0b3IiXX0='
    },
    defaultMode: 'encode',
    defaultExample: 'json',
    strings: {
      statusReady: 'Ready',
      statusSuccess: 'Success',
      statusError: 'Error',
      inputHintEncode: 'Plain text',
      inputHintDecode: 'Base64 string',
      copySuccess: 'Base64 result copied.',
      invalidPrefix: 'Invalid input for '
    }
  };

  const config = window.DevFormatBase64Config || {};
  const strings = Object.assign({}, defaults.strings, config.strings || {});
  const examples = config.examples || defaults.examples;
  let mode = config.defaultMode || defaults.defaultMode;

  const input = document.getElementById('input');
  const output = document.getElementById('output');
  const inputHint = document.getElementById('inputHint');
  const copyButton = document.getElementById('copyButton');
  const clearButton = document.getElementById('clearButton');

  if (!input || !output || !inputHint || !copyButton || !clearButton) return;

  function utf8ToBase64(value) {
    const bytes = new TextEncoder().encode(value);
    let binary = '';
    bytes.forEach(function (byte) { binary += String.fromCharCode(byte); });
    return btoa(binary);
  }

  function base64ToUtf8(value) {
    const binary = atob(value);
    const bytes = Uint8Array.from(binary, function (char) { return char.charCodeAt(0); });
    return new TextDecoder().decode(bytes);
  }

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
      output.value = mode === 'encode' ? utf8ToBase64(input.value) : base64ToUtf8(input.value.trim());
      updateStats(strings.statusSuccess);
      DevFormat.trackEvent('tool_convert', {
        tool: 'base64',
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
    if (key === 'base64') {
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

  input.value = examples[config.defaultExample || defaults.defaultExample] || examples.json;
  updateStats(strings.statusReady);
  convert();
})();
