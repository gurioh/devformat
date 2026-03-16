(function () {
  const defaults = {
    toolKey: 'compare-two-lists',
    inputAHint: 'One value per line',
    inputBHint: 'One value per line',
    commonHint: 'Values found in both lists',
    onlyAHint: 'Values only in list A',
    onlyBHint: 'Values only in list B',
    copySuccess: 'Compared list copied.',
    examples: {},
    exampleButtons: [],
    defaultExample: '',
    controls: { trim: true, skipEmpty: true },
    stats: []
  };

  const config = Object.assign({}, defaults, window.DevFormatCompareConfig || {});
  const inputA = document.getElementById('inputA');
  const inputB = document.getElementById('inputB');
  const commonOutput = document.getElementById('commonOutput');
  const onlyAOutput = document.getElementById('onlyAOutput');
  const onlyBOutput = document.getElementById('onlyBOutput');
  const trimValues = document.getElementById('trimValues');
  const skipEmpty = document.getElementById('skipEmpty');
  const clearAButton = document.getElementById('clearAButton');
  const clearBButton = document.getElementById('clearBButton');

  if (!inputA || !inputB || !commonOutput || !onlyAOutput || !onlyBOutput || !trimValues || !skipEmpty || !clearAButton || !clearBButton) return;

  const storedSettings = DevFormat.loadToolSettings(config.toolKey, {
    trim: Boolean(config.controls.trim),
    skipEmpty: Boolean(config.controls.skipEmpty)
  });
  storedSettings.trim = DevFormat.readQueryBool('trim', storedSettings.trim);
  storedSettings.skipEmpty = DevFormat.readQueryBool('skip', storedSettings.skipEmpty);

  function persistSettings() {
    DevFormat.saveToolSettings(config.toolKey, {
      trim: Boolean(trimValues.checked),
      skipEmpty: Boolean(skipEmpty.checked)
    });
  }

  function updateStats(metrics) {
    document.querySelectorAll('[data-stat]').forEach(function (node) {
      const key = node.dataset.stat;
      const value = metrics[key];
      node.textContent = value === undefined || value === null ? '0' : String(value);
    });
  }

  function emptyMetrics() {
    const metrics = {};
    (config.stats || []).forEach(function (stat) {
      metrics[stat.key] = 0;
    });
    return metrics;
  }

  function prepare(raw) {
    let values = raw.split('\n');
    if (trimValues.checked) values = values.map(function (line) { return line.trim(); });
    if (skipEmpty.checked) values = values.filter(function (line) { return line.length > 0; });
    return values;
  }

  function compare() {
    const valuesA = prepare(inputA.value);
    const valuesB = prepare(inputB.value);
    const setB = new Set(valuesB);
    const setA = new Set(valuesA);

    const common = valuesA.filter(function (value, index) {
      return setB.has(value) && valuesA.indexOf(value) === index;
    });
    const onlyA = valuesA.filter(function (value, index) {
      return !setB.has(value) && valuesA.indexOf(value) === index;
    });
    const onlyB = valuesB.filter(function (value, index) {
      return !setA.has(value) && valuesB.indexOf(value) === index;
    });

    commonOutput.value = common.join('\n');
    onlyAOutput.value = onlyA.join('\n');
    onlyBOutput.value = onlyB.join('\n');

    updateStats({
      totalA: valuesA.length,
      totalB: valuesB.length,
      commonCount: common.length,
      onlyACount: onlyA.length,
      onlyBCount: onlyB.length,
      commonUnique: common.length
    });

    DevFormat.trackEvent('tool_convert', {
      tool: config.toolKey,
      mode: 'compare',
      item_count: valuesA.length + valuesB.length,
      line_count: valuesA.length + valuesB.length,
      unique_count: common.length,
      input_chars: inputA.value.length + inputB.value.length,
      output_chars: commonOutput.value.length + onlyAOutput.value.length + onlyBOutput.value.length
    });
  }

  function loadExample(key) {
    const example = config.examples[key] || {};
    inputA.value = example.left || '';
    inputB.value = example.right || '';
    compare();
  }

  inputA.addEventListener('input', compare);
  inputB.addEventListener('input', compare);
  trimValues.addEventListener('change', function () {
    persistSettings();
    compare();
  });
  skipEmpty.addEventListener('change', function () {
    persistSettings();
    compare();
  });

  DevFormat.wireExampleButtons(function (key) {
    loadExample(key);
  });

  document.querySelectorAll('[data-copy-result]').forEach(function (button) {
    button.addEventListener('click', function () {
      const target = button.dataset.copyResult;
      const map = {
        common: commonOutput.value,
        'only-a': onlyAOutput.value,
        'only-b': onlyBOutput.value
      };
      DevFormat.copyText(map[target], config.copySuccess, { tool: config.toolKey, action: target });
    });
  });

  clearAButton.addEventListener('click', function () {
    inputA.value = '';
    compare();
    inputA.focus();
  });

  clearBButton.addEventListener('click', function () {
    inputB.value = '';
    compare();
    inputB.focus();
  });

  trimValues.checked = Boolean(storedSettings.trim);
  skipEmpty.checked = Boolean(storedSettings.skipEmpty);
  updateStats(emptyMetrics());
  loadExample(config.defaultExample);
  persistSettings();

  DevFormat.wireShareButton('shareSettingsButton', {
    tool: config.toolKey,
    successMessage: 'Settings link copied.',
    getParams: function () {
      return {
        trim: trimValues.checked ? 1 : 0,
        skip: skipEmpty.checked ? 1 : 0
      };
    }
  });
})();
