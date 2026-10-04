(function () {
  function convertList(text, options) {
    if (!text) return { output: '', count: 0 };
    let values = text.split(/\r\n|\n|\r/);
    if (options.trim) values = values.map(value => value.trim());
    if (options.skipEmpty) values = values.filter(value => value !== '');
    if (options.dedupe) values = [...new Set(values)];
    const fields = options.mode === 'csv' ? values.map(value =>
      options.quoteAll || /[",\r\n]/.test(value) ? '"' + value.replace(/"/g, '""') + '"' : value
    ) : values;
    let output = fields.join(',');
    if (options.mode === 'env' && options.variable) {
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(options.variable)) return { output: '', count: values.length, error: 'Use a variable name with letters, numbers, and underscores; start with a letter or underscore.' };
      // Single-quoted dotenv values preserve spaces, hashes and dollar signs.
      // Reject embedded quotes rather than guessing parser-specific escaping.
      if (output.includes("'")) return { output: '', count: values.length, error: 'Single quotes need parser-specific escaping. Remove the variable name to copy the raw list instead.' };
      output = options.variable + "='" + output + "'";
    }
    return { output, count: values.length };
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
  const dedupe = document.getElementById('dedupeValues');
  const variable = document.getElementById('variableName');
  const download = document.getElementById('downloadResult');
  const mode = document.body.dataset.converter;
  function render(track) {
    const result = convertList(input.value, { mode, trim: trim.checked, skipEmpty: skip.checked, quoteAll: quote && quote.checked, dedupe: dedupe && dedupe.checked, variable: variable && variable.value.trim() });
    output.value = result.output;
    copy.disabled = !result.output;
    download.disabled = !result.output;
    if (variable) variable.setAttribute('aria-invalid', result.error ? 'true' : 'false');
    copy.textContent = 'Copy result';
    status.textContent = result.error || (result.count ? result.count + (result.count === 1 ? ' value' : ' values') + ' · ' + result.output.length + ' characters' : 'Paste your values to get started.');
    if (track && result.output) window.DevFormat.trackEvent('tool_convert', { tool: document.body.dataset.page, count: result.count });
  }
  input.addEventListener('input', () => render(true));
  [trim, skip, quote, dedupe].filter(Boolean).forEach(control => control.addEventListener('change', () => render(true)));
  if (variable) variable.addEventListener('input', () => render(true));
  download.addEventListener('click', () => {
    if (!output.value) return;
    const blob = new Blob([output.value + '\n'], { type: mode === 'csv' ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = mode === 'csv' ? 'values.csv' : variable.value.trim() ? '.env' : 'values.txt';
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    window.DevFormat.trackEvent('download_output', { tool: document.body.dataset.page });
  });
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
