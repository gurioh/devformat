(function () {
  const defaults = {
    toolKey: 'csv-column-to-lines',
    modeLabel: 'Extract column',
    inputHint: 'CSV, TSV, or delimited rows',
    outputHint: 'One extracted value per line',
    placeholder: '',
    copySuccess: 'Column values copied.',
    examples: {},
    exampleButtons: [],
    defaultExample: '',
    presets: [],
    defaultPreset: 'comma',
    controls: { trim: true, skipEmpty: true, hasHeader: true },
    stats: []
  };

  const config = Object.assign({}, defaults, window.DevFormatCsvColumnConfig || {});
  const input = document.getElementById('input');
  const output = document.getElementById('output');
  const copyButton = document.getElementById('copyButton');
  const clearButton = document.getElementById('clearButton');
  const trimValues = document.getElementById('trimValues');
  const skipEmpty = document.getElementById('skipEmpty');
  const hasHeader = document.getElementById('hasHeader');
  const columnIndex = document.getElementById('columnIndex');
  const inputHint = document.getElementById('inputHint');
  const outputHint = document.getElementById('outputHint');

  if (!input || !output || !copyButton || !clearButton || !trimValues || !skipEmpty || !hasHeader || !columnIndex) return;

  const storedSettings = DevFormat.loadToolSettings(config.toolKey, {
    preset: config.defaultPreset || 'comma',
    trim: Boolean(config.controls.trim),
    skipEmpty: Boolean(config.controls.skipEmpty),
    hasHeader: Boolean(config.controls.hasHeader),
    columnIndex: '1'
  });
  storedSettings.preset = DevFormat.readQueryValue('preset', storedSettings.preset);
  storedSettings.trim = DevFormat.readQueryBool('trim', storedSettings.trim);
  storedSettings.skipEmpty = DevFormat.readQueryBool('skip', storedSettings.skipEmpty);
  storedSettings.hasHeader = DevFormat.readQueryBool('header', storedSettings.hasHeader);
  storedSettings.columnIndex = DevFormat.readQueryValue('col', storedSettings.columnIndex);

  let activePreset = storedSettings.preset || config.defaultPreset || (config.presets[0] && config.presets[0].key) || 'comma';
  if (config.presets.length && !config.presets.some(function (item) { return item.key === activePreset; })) {
    activePreset = config.defaultPreset || config.presets[0].key;
  }

  function persistSettings() {
    DevFormat.saveToolSettings(config.toolKey, {
      preset: activePreset,
      trim: Boolean(trimValues.checked),
      skipEmpty: Boolean(skipEmpty.checked),
      hasHeader: Boolean(hasHeader.checked),
      columnIndex: columnIndex.value || '1'
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
    const metrics = { modeLabel: config.modeLabel };
    (config.stats || []).forEach(function (stat) {
      if (stat.key !== 'modeLabel') metrics[stat.key] = 0;
    });
    return metrics;
  }

  function parseDelimiter(value) {
    if (value === 'tab') return '\t';
    if (value === 'pipe') return '|';
    if (value === 'semicolon') return ';';
    return ',';
  }

  function parseRow(line, delimiter) {
    const cells = [];
    let current = '';
    let inQuotes = false;
    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      if (char === '"') {
        if (inQuotes && line[index + 1] === '"') {
          current += '"';
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        cells.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    cells.push(current);
    return cells;
  }

  function convert() {
    const raw = input.value;
    if (!raw.length) {
      output.value = '';
      updateStats(emptyMetrics());
      return;
    }

    const lines = raw.split('\n').filter(function (line) { return line.length > 0; });
    const dataLines = hasHeader.checked ? lines.slice(1) : lines.slice();
    const delimiter = parseDelimiter(activePreset);
    const targetIndex = Math.max(1, Number(columnIndex.value) || 1) - 1;
    const values = dataLines.map(function (line) {
      const cells = parseRow(line, delimiter);
      let value = cells[targetIndex] || '';
      if (trimValues.checked) value = value.trim();
      return value;
    }).filter(function (value) {
      return skipEmpty.checked ? value.length > 0 : true;
    });

    const result = values.join('\n');
    output.value = result;
    updateStats({
      modeLabel: config.modeLabel,
      totalRows: lines.length,
      dataRows: dataLines.length,
      extractedValues: values.length,
      emptyValues: Math.max(0, dataLines.length - values.length),
      columnNumber: targetIndex + 1,
      inputChars: raw.length,
      outputChars: result.length,
      deltaChars: result.length - raw.length >= 0 ? '+' + (result.length - raw.length) : String(result.length - raw.length)
    });

    DevFormat.trackEvent('tool_convert', {
      tool: config.toolKey,
      mode: 'extract-column',
      preset: activePreset,
      item_count: values.length,
      line_count: dataLines.length,
      input_chars: raw.length,
      output_chars: result.length,
      delta_chars: result.length - raw.length
    });
  }

  document.querySelectorAll('[data-preset]').forEach(function (button) {
    button.addEventListener('click', function () {
      activePreset = button.dataset.preset;
      document.querySelectorAll('[data-preset]').forEach(function (node) {
        node.classList.toggle('active', node === button);
      });
      DevFormat.trackEvent('preset_select', { tool: config.toolKey, preset: activePreset });
      persistSettings();
      convert();
    });
  });

  [trimValues, skipEmpty, hasHeader].forEach(function (field) {
    field.addEventListener('change', function () {
      persistSettings();
      convert();
    });
  });
  columnIndex.addEventListener('input', function () {
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
  trimValues.checked = Boolean(storedSettings.trim);
  skipEmpty.checked = Boolean(storedSettings.skipEmpty);
  hasHeader.checked = Boolean(storedSettings.hasHeader);
  columnIndex.value = storedSettings.columnIndex || '1';
  document.querySelectorAll('[data-preset]').forEach(function (node) {
    node.classList.toggle('active', node.dataset.preset === activePreset);
  });
  updateStats(emptyMetrics());
  convert();
  persistSettings();

  DevFormat.wireShareButton('shareSettingsButton', {
    tool: config.toolKey,
    successMessage: 'Settings link copied.',
    getParams: function () {
      return {
        preset: activePreset,
        trim: trimValues.checked ? 1 : 0,
        skip: skipEmpty.checked ? 1 : 0,
        header: hasHeader.checked ? 1 : 0,
        col: columnIndex.value || '1'
      };
    }
  });
})();
