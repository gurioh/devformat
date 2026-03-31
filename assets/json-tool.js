(function () {
  const defaults = {
    examples: {
      payload: '{"user":"devformat","roles":["editor","viewer"],"flags":{"beta":true}}',
      config: '{"featureA":true,"refreshInterval":30,"endpoints":["/users","/reports"]}',
      invalid: '{"featureA":true,,"broken":false}'
    },
    defaultAction: 'prettify',
    defaultExample: 'payload',
    strings: {
      statusReady: 'Ready',
      statusSuccess: 'Success',
      statusError: 'Error',
      actionPrettify: 'Prettify',
      actionMinify: 'Minify',
      actionValidate: 'Validate',
      outputHintFormatted: 'Formatted result',
      outputHintValidation: 'Validation result',
      validMessage: 'Valid JSON.',
      invalidPrefix: 'Invalid JSON: ',
      copySuccess: 'JSON output copied.'
    }
  };

  const config = window.DevFormatJsonConfig || {};
  const strings = Object.assign({}, defaults.strings, config.strings || {});
  const examples = config.examples || defaults.examples;
  let action = config.defaultAction || defaults.defaultAction;

  const input = document.getElementById('input');
  const output = document.getElementById('output');
  const outputHint = document.getElementById('outputHint');
  const copyButton = document.getElementById('copyButton');
  const clearButton = document.getElementById('clearButton');

  if (!input || !output || !outputHint || !copyButton || !clearButton) return;

  const storedSettings = DevFormat.loadToolSettings('json', {
    action: config.defaultAction || defaults.defaultAction
  });

  function persistSettings() {
    DevFormat.saveToolSettings('json', {
      action: action
    });
  }

  function actionLabel() {
    if (action === 'minify') return strings.actionMinify;
    if (action === 'validate') return strings.actionValidate;
    return strings.actionPrettify;
  }

  function updateStats(status) {
    document.getElementById('statusStat').textContent = status;
    document.getElementById('actionStat').textContent = actionLabel();
    document.getElementById('outputStat').textContent = String(output.value.length);
    outputHint.textContent = action === 'validate' ? strings.outputHintValidation : strings.outputHintFormatted;
  }

  function run() {
    if (!input.value.trim()) {
      output.value = '';
      updateStats(strings.statusReady);
      return;
    }

    try {
      const parsed = JSON.parse(input.value);
      if (action === 'prettify') {
        output.value = JSON.stringify(parsed, null, 2);
      } else if (action === 'minify') {
        output.value = JSON.stringify(parsed);
      } else {
        output.value = strings.validMessage;
      }
      updateStats(strings.statusSuccess);
      DevFormat.trackEvent('tool_convert', {
        tool: 'json',
        action: action,
        status: 'success',
        input_chars: input.value.length,
        output_chars: output.value.length,
        line_count: input.value ? input.value.split('\n').length : 0
      });
    } catch (error) {
      output.value = strings.invalidPrefix + error.message;
      updateStats(strings.statusError);
    }
  }

  document.querySelectorAll('[data-action]').forEach(function (button) {
    button.addEventListener('click', function () {
      action = button.dataset.action;
      document.querySelectorAll('[data-action]').forEach(function (node) {
        node.classList.toggle('active', node === button);
      });
      persistSettings();
      DevFormat.trackEvent('preset_select', { tool: 'json', preset: action });
      run();
    });
  });

  input.addEventListener('input', run);
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
    run();
  });

  action = DevFormat.readQueryValue('action', storedSettings.action);
  document.querySelectorAll('[data-action]').forEach(function (node) {
    node.classList.toggle('active', node.dataset.action === action);
  });
  if (!document.querySelector('[data-action].active')) {
    action = config.defaultAction || defaults.defaultAction;
    document.querySelectorAll('[data-action]').forEach(function (node) {
      node.classList.toggle('active', node.dataset.action === action);
    });
  }
  DevFormat.wireShareButton('shareSettingsButton', {
    tool: 'json',
    getParams: function () {
      return {
        action: action
      };
    }
  });
  persistSettings();
  input.value = examples[config.defaultExample || defaults.defaultExample] || examples.payload;
  updateStats(strings.statusReady);
  run();
})();
