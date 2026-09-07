(function () {
  function convertList(text, options) {
    if (!text) return { output: '', count: 0 };
    let values = text.split(/\r\n|\n|\r/);
    if (options.trim) values = values.map(value => value.trim());
    if (options.skipEmpty) values = values.filter(value => value !== '');
    const fields = options.mode === 'csv' ? values.map(value =>
      options.quoteAll || /[",\r\n]/.test(value) ? '"' + value.replace(/"/g, '""') + '"' : value
    ) : values;
    return { output: fields.join(','), count: values.length };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { convertList };
  if (typeof document === 'undefined') return;
  const input = document.getElementById('listInput');
  const output = document.getElementById('listOutput');
  const copy = document.getElementById('copyResult');
  const status = document.getElementById('conversionStatus');
  const trim = document.getElementById('trimValues');
  const skip = document.getElementById('skipEmpty');
  const quote = document.getElementById('quoteAll');
  const mode = document.body.dataset.converter;
  function render(track) {
    const result = convertList(input.value, { mode, trim: trim.checked, skipEmpty: skip.checked, quoteAll: quote && quote.checked });
    output.value = result.output;
    copy.disabled = !result.output;
    copy.textContent = 'Copy result';
    status.textContent = result.count ? result.count + (result.count === 1 ? ' value' : ' values') + ' · ' + result.output.length + ' characters' : 'Paste your values to get started.';
    if (track && input.value) window.DevFormat.trackEvent('tool_convert', { tool: document.body.dataset.page, count: result.count });
  }
  input.addEventListener('input', () => render(true));
  [trim, skip, quote].filter(Boolean).forEach(control => control.addEventListener('change', () => render(true)));
  document.getElementById('clearInput').addEventListener('click', () => { input.value = ''; render(false); input.focus(); });
  document.getElementById('loadExample').addEventListener('click', () => {
    input.value = mode === 'csv' ? 'apple\npear, ripe\n12" monitor' : 'feature_a\nfeature_b\nfeature_c';
    render(false);
    window.DevFormat.trackEvent('example_click', { tool: document.body.dataset.page });
    input.focus();
  });
  copy.addEventListener('click', async () => {
    const text = output.value;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      copy.textContent = 'Copied!';
      status.textContent = 'Result copied to clipboard.';
      window.DevFormat.trackEvent('copy_output', { tool: document.body.dataset.page, length: text.length });
    } catch (_) {
      output.focus(); output.select();
      status.textContent = 'Copy unavailable. Result selected — use Ctrl+C or ⌘C.';
    }
  });
  render(false);
})();
