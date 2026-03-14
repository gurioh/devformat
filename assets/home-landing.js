(function () {
  const input = document.getElementById('homeSqlInput');
  const output = document.getElementById('homeSqlOutput');
  const copyButton = document.getElementById('homeSqlCopy');
  const clearButton = document.getElementById('homeSqlClear');
  const presetLabel = document.getElementById('homePresetLabel');
  const presetLabelCard = document.getElementById('homePresetLabelCard');
  const itemStat = document.getElementById('homeItemStat');
  const charStat = document.getElementById('homeCharStat');

  if (!input || !output || !copyButton || !clearButton || !presetLabel || !presetLabelCard || !itemStat || !charStat) {
    return;
  }

  const presets = {
    'sql-in': { label: 'SQL IN clause', delimiter: ', ', quote: "'", wrapStart: '(', wrapEnd: ')' },
    'js-array': { label: 'JavaScript array', delimiter: ', ', quote: '"', wrapStart: '[', wrapEnd: ']' },
    'comma': { label: 'Comma-separated list', delimiter: ', ', quote: '', wrapStart: '', wrapEnd: '' }
  };

  const examples = {
    ids: '1001\n1002\n1003\n1004',
    emails: 'hello@example.com\nops@example.com\nsupport@example.com',
    fruits: 'apple\nbanana\ncherry\ndragonfruit'
  };

  let activePreset = 'sql-in';

  function render() {
    const raw = input.value;
    if (!raw.trim()) {
      output.value = '';
      itemStat.textContent = '0';
      charStat.textContent = '0';
      return null;
    }

    const preset = presets[activePreset];
    const values = raw
      .split('\n')
      .map(function (line) { return line.trim(); })
      .filter(function (line) { return line.length > 0; });

    const result = preset.wrapStart + values.map(function (value) {
      return preset.quote + value + preset.quote;
    }).join(preset.delimiter) + preset.wrapEnd;

    output.value = result;
    presetLabel.textContent = preset.label;
    presetLabelCard.textContent = preset.label;
    itemStat.textContent = String(values.length);
    charStat.textContent = String(result.length);

    return {
      values: values,
      raw: raw,
      result: result
    };
  }

  function convert() {
    const rendered = render();
    if (!rendered) return;

    DevFormat.trackEvent('tool_convert', {
      tool: 'home_sql_widget',
      preset: activePreset,
      item_count: rendered.values.length,
      line_count: rendered.raw ? rendered.raw.split('\n').length : 0,
      input_chars: rendered.raw.length,
      output_chars: rendered.result.length,
      page: 'catalog'
    });
  }

  document.querySelectorAll('[data-home-preset]').forEach(function (button) {
    button.addEventListener('click', function () {
      activePreset = button.dataset.homePreset;
      document.querySelectorAll('[data-home-preset]').forEach(function (node) {
        node.classList.toggle('active', node === button);
      });
      presetLabel.textContent = presets[activePreset].label;
      presetLabelCard.textContent = presets[activePreset].label;
      convert();
      DevFormat.trackEvent('preset_select', {
        tool: 'home_sql_widget',
        preset: activePreset,
        page: 'catalog'
      });
    });
  });

  document.querySelectorAll('[data-home-example]').forEach(function (button) {
    button.addEventListener('click', function () {
      input.value = examples[button.dataset.homeExample] || '';
      convert();
      DevFormat.trackEvent('example_click', {
        tool: 'home_sql_widget',
        example: button.dataset.homeExample,
        page: 'catalog'
      });
    });
  });

  input.addEventListener('input', convert);

  copyButton.addEventListener('click', function () {
    if (!output.value) return;
    navigator.clipboard.writeText(output.value).then(function () {
      DevFormat.showToast('Homepage output copied.');
      DevFormat.trackEvent('copy_output', {
        tool: 'home_sql_widget',
        length: output.value.length,
        page: 'catalog'
      });
    }).catch(function () {
      DevFormat.showToast('Clipboard access failed.');
    });
  });

  clearButton.addEventListener('click', function () {
    input.value = '';
    output.value = '';
    itemStat.textContent = '0';
    charStat.textContent = '0';
    input.focus();
  });

  input.value = examples.ids;
  presetLabel.textContent = presets[activePreset].label;
  presetLabelCard.textContent = presets[activePreset].label;
  render();
})();
