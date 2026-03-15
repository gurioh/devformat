const cleanupTools = [
  {
    slug: 'remove-duplicate-lines',
    title: 'Remove Duplicate Lines Online | DevFormat',
    description: 'Remove duplicate lines from text while keeping the first occurrence. Clean copied IDs, emails, config keys, and spreadsheet exports in your browser.',
    keywords: 'remove duplicate lines online, dedupe text lines, unique lines tool, remove duplicate list items',
    kicker: 'Cleanup & Extraction',
    h1: 'Remove Duplicate Lines Online',
    heroText: 'Paste one value per line, remove duplicate entries in original order, and copy a clean list for code, configs, or spreadsheet cleanup.',
    quickAnswer: [
      'This page removes repeated lines from copied text while keeping the first occurrence of each value.',
      'It works well for IDs, emails, tag lists, config keys, and any text export that needs a stable unique list.'
    ],
    howTo: [
      'Paste your values into the input box.',
      'Keep trim or skip-empty enabled if the copied data is messy.',
      'Copy the deduplicated result.'
    ],
    questions: [
      'How do I remove duplicate lines online?',
      'How do I keep only the first occurrence of each value?',
      'How do I clean repeated IDs or emails before pasting into code?' 
    ],
    example: {
      input: 'apple\nbanana\napple\ncherry\nbanana',
      outputTitle: 'Output with duplicate lines removed',
      output: 'apple\nbanana\ncherry'
    },
    faq: [
      { q: 'Does it keep the original order?', a: 'Yes. The tool keeps the first occurrence of each value and preserves that order in the output.' },
      { q: 'Can I ignore empty lines?', a: 'Yes. Leave skip-empty enabled to drop blank rows before deduplication.' },
      { q: 'Can I trim whitespace before comparing values?', a: 'Yes. Turn on trim to normalize copied values like ` apple ` and `apple` before removing duplicates.' }
    ],
    related: [
      { href: '../split-join/', label: 'Split / Join' },
      { href: '../multiline/', label: 'Multiline' },
      { href: '../line-counter/', label: 'Line Counter' },
      { href: '../compare-two-lists/', label: 'Compare Two Lists' }
    ],
    engine: 'list-cleanup',
    config: {
      toolKey: 'remove-duplicate-lines',
      operation: 'dedupe',
      modeLabel: 'Dedupe',
      inputHint: 'Text with repeated lines',
      outputHint: 'Unique lines in original order',
      placeholder: 'apple\nbanana\napple\ncherry',
      copySuccess: 'Unique lines copied.',
      examples: {
        duplicates: 'apple\nbanana\napple\ncherry\nbanana',
        ids: '1001\n1002\n1002\n1003\n1001',
        emails: 'hello@example.com\nops@example.com\nhello@example.com\nsupport@example.com'
      },
      exampleButtons: [
        { key: 'duplicates', label: 'Repeated values' },
        { key: 'ids', label: 'Record IDs' },
        { key: 'emails', label: 'Email list' }
      ],
      defaultExample: 'duplicates',
      controls: { trim: true, skipEmpty: true },
      stats: [
        { key: 'modeLabel', label: 'Mode', defaultValue: 'Dedupe' },
        { key: 'totalLines', label: 'Total lines', defaultValue: '0' },
        { key: 'uniqueLines', label: 'Unique lines', defaultValue: '0' },
        { key: 'duplicatesRemoved', label: 'Removed', defaultValue: '0' },
        { key: 'emptyLines', label: 'Empty lines', defaultValue: '0' },
        { key: 'outputLines', label: 'Output lines', defaultValue: '0' },
        { key: 'inputChars', label: 'Input chars', defaultValue: '0' },
        { key: 'outputChars', label: 'Output chars', defaultValue: '0' }
      ]
    }
  },
  {
    slug: 'sort-lines',
    title: 'Sort Lines Online | DevFormat',
    description: 'Sort lines alphabetically or numerically, then copy the cleaned result. Useful for IDs, tags, env vars, hostnames, and plain text exports.',
    keywords: 'sort lines online, alphabetical sort text, numeric sort lines, sort multiline text',
    kicker: 'Cleanup & Extraction',
    h1: 'Sort Lines Online',
    heroText: 'Sort one value per line by alphabetical or numeric order, clean copied lists, and copy a stable output for configs, spreadsheets, and debugging.',
    quickAnswer: [
      'This page sorts newline text in ascending or descending order and keeps the result as one value per line.',
      'It is useful for config keys, IDs, tag lists, exports, and any list that becomes easier to scan after sorting.'
    ],
    howTo: [
      'Paste one value per line into the input box.',
      'Choose alphabetical or numeric sorting.',
      'Copy the sorted output.'
    ],
    questions: [
      'How do I sort lines alphabetically online?',
      'How do I sort a list of numeric strings?',
      'How do I normalize and sort copied values before comparing them?'
    ],
    example: {
      input: 'gamma\nalpha\ndelta\nbeta',
      outputTitle: 'Output sorted A to Z',
      output: 'alpha\nbeta\ndelta\ngamma'
    },
    faq: [
      { q: 'Can I sort numbers numerically instead of alphabetically?', a: 'Yes. Use the numeric presets when your lines contain numeric strings like IDs or counters.' },
      { q: 'Will it remove blank lines?', a: 'It can. Leave skip-empty enabled if you want blank rows removed before sorting.' },
      { q: 'Can I trim whitespace before sorting?', a: 'Yes. Turn on trim to sort based on normalized values.' }
    ],
    related: [
      { href: '../remove-duplicate-lines/', label: 'Remove Duplicate Lines' },
      { href: '../line-counter/', label: 'Line Counter' },
      { href: '../compare-two-lists/', label: 'Compare Two Lists' },
      { href: '../split-join/', label: 'Split / Join' }
    ],
    engine: 'list-cleanup',
    config: {
      toolKey: 'sort-lines',
      operation: 'sort',
      modeLabel: 'Sort',
      inputHint: 'One value per line',
      outputHint: 'Sorted lines',
      placeholder: 'gamma\nalpha\ndelta\nbeta',
      copySuccess: 'Sorted lines copied.',
      examples: {
        names: 'gamma\nalpha\ndelta\nbeta',
        numbers: '42\n7\n105\n13\n9',
        hosts: 'api-3\napi-1\napi-2\napi-10'
      },
      exampleButtons: [
        { key: 'names', label: 'Names' },
        { key: 'numbers', label: 'Numbers' },
        { key: 'hosts', label: 'Hostnames' }
      ],
      defaultExample: 'names',
      presets: [
        { key: 'alpha-asc', label: 'A → Z' },
        { key: 'alpha-desc', label: 'Z → A' },
        { key: 'numeric-asc', label: '0 → 9' },
        { key: 'numeric-desc', label: '9 → 0' }
      ],
      defaultPreset: 'alpha-asc',
      controls: { trim: true, skipEmpty: true },
      stats: [
        { key: 'modeLabel', label: 'Mode', defaultValue: 'Sort' },
        { key: 'totalLines', label: 'Total lines', defaultValue: '0' },
        { key: 'uniqueLines', label: 'Unique lines', defaultValue: '0' },
        { key: 'duplicatesRemoved', label: 'Duplicates', defaultValue: '0' },
        { key: 'emptyLines', label: 'Empty lines', defaultValue: '0' },
        { key: 'outputLines', label: 'Output lines', defaultValue: '0' },
        { key: 'inputChars', label: 'Input chars', defaultValue: '0' },
        { key: 'outputChars', label: 'Output chars', defaultValue: '0' }
      ]
    }
  },
  {
    slug: 'line-counter',
    title: 'Line Counter Online | DevFormat',
    description: 'Count lines, words, characters, unique lines, and empty lines in copied text. Generate a clean summary report directly in the browser.',
    keywords: 'line counter online, text line count, count words and characters, unique line count',
    kicker: 'Cleanup & Extraction',
    h1: 'Line Counter Online',
    heroText: 'Count lines, words, characters, unique lines, and empty lines in copied text. Useful for logs, snippets, exports, docs, and payload inspection.',
    quickAnswer: [
      'This page counts lines, words, characters, unique lines, and empty lines from any pasted text.',
      'It also generates a copyable summary, which is useful for debugging, QA notes, and quick text inspection.'
    ],
    howTo: [
      'Paste any text into the input box.',
      'Optionally trim lines before counting.',
      'Review the stats or copy the generated summary report.'
    ],
    questions: [
      'How many lines are in this text?',
      'How many words and characters does this text have?',
      'How many unique lines or blank rows are included?'
    ],
    example: {
      input: 'alpha\n\nbeta gamma\nalpha',
      outputTitle: 'Generated summary report',
      output: 'Lines: 4\nNon-empty lines: 3\nEmpty lines: 1\nWords: 4\nCharacters: 23\nUnique lines: 3'
    },
    faq: [
      { q: 'Does it count blank lines?', a: 'Yes. Empty lines are tracked separately so you can see both total lines and non-empty lines.' },
      { q: 'Can I normalize whitespace first?', a: 'Yes. Enable trim to count lines after leading and trailing whitespace is removed.' },
      { q: 'What does the output box contain?', a: 'It contains a copyable summary report built from the current text.' }
    ],
    related: [
      { href: '../remove-duplicate-lines/', label: 'Remove Duplicate Lines' },
      { href: '../sort-lines/', label: 'Sort Lines' },
      { href: '../extract-emails/', label: 'Extract Emails' },
      { href: '../extract-urls/', label: 'Extract URLs' }
    ],
    engine: 'list-cleanup',
    config: {
      toolKey: 'line-counter',
      operation: 'count',
      modeLabel: 'Count',
      inputHint: 'Paste any text',
      outputHint: 'Copyable summary report',
      placeholder: 'alpha\n\nbeta gamma\nalpha',
      copySuccess: 'Summary report copied.',
      examples: {
        sample: 'alpha\n\nbeta gamma\nalpha',
        logs: 'INFO request started\nWARN retry scheduled\nINFO request started\nERROR timeout',
        paragraph: 'One paragraph with several words.\nAnd a second line for counting.'
      },
      exampleButtons: [
        { key: 'sample', label: 'Sample text' },
        { key: 'logs', label: 'Log lines' },
        { key: 'paragraph', label: 'Paragraph' }
      ],
      defaultExample: 'sample',
      controls: { trim: true, skipEmpty: false },
      stats: [
        { key: 'modeLabel', label: 'Mode', defaultValue: 'Count' },
        { key: 'totalLines', label: 'Total lines', defaultValue: '0' },
        { key: 'nonEmptyLines', label: 'Non-empty', defaultValue: '0' },
        { key: 'emptyLines', label: 'Empty', defaultValue: '0' },
        { key: 'wordCount', label: 'Words', defaultValue: '0' },
        { key: 'characters', label: 'Characters', defaultValue: '0' },
        { key: 'uniqueLines', label: 'Unique lines', defaultValue: '0' },
        { key: 'longestLine', label: 'Longest line', defaultValue: '0' }
      ]
    }
  },
  {
    slug: 'extract-emails',
    title: 'Extract Emails from Text | DevFormat',
    description: 'Extract email addresses from mixed text, logs, payloads, docs, and copied notes. Keep unique results and copy one address per line.',
    keywords: 'extract emails from text, email extractor online, find email addresses in text',
    kicker: 'Cleanup & Extraction',
    h1: 'Extract Emails from Text',
    heroText: 'Paste mixed text, pull out email addresses, and copy one clean email per line for support lists, exports, and debugging.',
    quickAnswer: [
      'This page extracts email addresses from mixed text like logs, docs, payloads, copied notes, and spreadsheet exports.',
      'You can keep unique results only or sort the extracted values before copying them.'
    ],
    howTo: [
      'Paste any mixed text into the input box.',
      'Choose whether to keep unique values or sort the output.',
      'Copy the extracted email list.'
    ],
    questions: [
      'How do I extract email addresses from a block of text?',
      'How do I turn mixed notes into one email per line?',
      'How do I remove duplicate emails from pasted text?'
    ],
    example: {
      input: 'Owner: hello@example.com\nBackup: ops@example.com\nEscalation: hello@example.com',
      outputTitle: 'Extracted emails',
      output: 'hello@example.com\nops@example.com'
    },
    faq: [
      { q: 'Can I remove duplicates from the extracted results?', a: 'Yes. Keep unique-only enabled to return each email address once.' },
      { q: 'Can I sort the results?', a: 'Yes. Enable sort output if you want the extracted email list in alphabetical order.' },
      { q: 'Does this send text to a server?', a: 'No. Extraction runs in the browser.' }
    ],
    related: [
      { href: '../remove-duplicate-lines/', label: 'Remove Duplicate Lines' },
      { href: '../quote/', label: 'Quote' },
      { href: '../split-join/', label: 'Split / Join' },
      { href: '../compare-two-lists/', label: 'Compare Two Lists' }
    ],
    engine: 'extract',
    config: {
      toolKey: 'extract-emails',
      extractType: 'emails',
      modeLabel: 'Extract emails',
      inputHint: 'Paste mixed text, docs, or logs',
      outputHint: 'One email per line',
      placeholder: 'Owner: hello@example.com\nBackup: ops@example.com',
      copySuccess: 'Extracted emails copied.',
      examples: {
        tickets: 'Owner: hello@example.com\nBackup: ops@example.com\nEscalation: hello@example.com',
        csv: 'name,email\nAlice,alice@example.com\nBob,bob@example.com',
        notes: 'Reach sales@company.com or support@company.com for help.'
      },
      exampleButtons: [
        { key: 'tickets', label: 'Support tickets' },
        { key: 'csv', label: 'CSV export' },
        { key: 'notes', label: 'Notes' }
      ],
      defaultExample: 'tickets',
      controls: { uniqueOnly: true, sortOutput: false },
      stats: [
        { key: 'modeLabel', label: 'Mode', defaultValue: 'Extract emails' },
        { key: 'matches', label: 'Matches', defaultValue: '0' },
        { key: 'uniqueMatches', label: 'Unique', defaultValue: '0' },
        { key: 'duplicatesRemoved', label: 'Duplicates', defaultValue: '0' },
        { key: 'outputLines', label: 'Output lines', defaultValue: '0' },
        { key: 'inputChars', label: 'Input chars', defaultValue: '0' },
        { key: 'outputChars', label: 'Output chars', defaultValue: '0' },
        { key: 'deltaChars', label: 'Delta', defaultValue: '0' }
      ]
    }
  },
  {
    slug: 'extract-urls',
    title: 'Extract URLs from Text | DevFormat',
    description: 'Extract URLs from logs, docs, payloads, and copied notes. Keep unique links and copy one URL per line in the browser.',
    keywords: 'extract urls from text, url extractor online, find links in text',
    kicker: 'Cleanup & Extraction',
    h1: 'Extract URLs from Text',
    heroText: 'Paste mixed text, extract links, and copy one clean URL per line for debugging, QA, and content cleanup.',
    quickAnswer: [
      'This page extracts URLs from mixed text like logs, tickets, docs, copied notes, and browser output.',
      'You can keep unique links only or sort the output before copying it into another tool.'
    ],
    howTo: [
      'Paste mixed text into the input box.',
      'Enable unique-only or sort-output if needed.',
      'Copy the extracted URLs.'
    ],
    questions: [
      'How do I extract URLs from text online?',
      'How do I pull links out of logs or notes?',
      'How do I turn mixed content into one URL per line?'
    ],
    example: {
      input: 'Primary: https://gurioh.github.io/devformat/multiline/\nFallback: https://gurioh.github.io/devformat/escape/\nAgain: https://gurioh.github.io/devformat/multiline/',
      outputTitle: 'Extracted URLs',
      output: 'https://gurioh.github.io/devformat/multiline/\nhttps://gurioh.github.io/devformat/escape/'
    },
    faq: [
      { q: 'Can I remove duplicate URLs?', a: 'Yes. Keep unique-only enabled to output each link once.' },
      { q: 'Can I sort the extracted links?', a: 'Yes. Enable sort output to alphabetize the extracted URL list.' },
      { q: 'Can I send extracted links into URL Encode next?', a: 'Yes. The output is one URL per line, so it is easy to move into URL Encode or compare tools.' }
    ],
    related: [
      { href: '../url-encode/', label: 'URL Encode' },
      { href: '../remove-duplicate-lines/', label: 'Remove Duplicate Lines' },
      { href: '../split-join/', label: 'Split / Join' },
      { href: '../compare-two-lists/', label: 'Compare Two Lists' }
    ],
    engine: 'extract',
    config: {
      toolKey: 'extract-urls',
      extractType: 'urls',
      modeLabel: 'Extract URLs',
      inputHint: 'Paste mixed text, logs, or notes',
      outputHint: 'One URL per line',
      placeholder: 'Primary: https://gurioh.github.io/devformat/multiline/\nFallback: https://gurioh.github.io/devformat/escape/',
      copySuccess: 'Extracted URLs copied.',
      examples: {
        logs: 'Primary: https://gurioh.github.io/devformat/multiline/\nFallback: https://gurioh.github.io/devformat/escape/\nAgain: https://gurioh.github.io/devformat/multiline/',
        docs: 'Read https://example.com/docs and also visit www.example.org/help',
        markdown: '[Docs](https://example.com/docs) and https://status.example.com'
      },
      exampleButtons: [
        { key: 'logs', label: 'Logs' },
        { key: 'docs', label: 'Docs' },
        { key: 'markdown', label: 'Markdown' }
      ],
      defaultExample: 'logs',
      controls: { uniqueOnly: true, sortOutput: false },
      stats: [
        { key: 'modeLabel', label: 'Mode', defaultValue: 'Extract URLs' },
        { key: 'matches', label: 'Matches', defaultValue: '0' },
        { key: 'uniqueMatches', label: 'Unique', defaultValue: '0' },
        { key: 'duplicatesRemoved', label: 'Duplicates', defaultValue: '0' },
        { key: 'outputLines', label: 'Output lines', defaultValue: '0' },
        { key: 'inputChars', label: 'Input chars', defaultValue: '0' },
        { key: 'outputChars', label: 'Output chars', defaultValue: '0' },
        { key: 'deltaChars', label: 'Delta', defaultValue: '0' }
      ]
    }
  },
  {
    slug: 'remove-empty-lines',
    title: 'Remove Empty Lines Online | DevFormat',
    description: 'Remove blank lines from copied text, logs, exports, and config lists. Keep only meaningful rows and copy the cleaned output in your browser.',
    keywords: 'remove empty lines online, remove blank lines from text, delete blank lines tool',
    kicker: 'Cleanup & Extraction',
    h1: 'Remove Empty Lines Online',
    heroText: 'Drop blank rows from copied text before you quote, compare, or turn it into a request-ready list.',
    quickAnswer: [
      'This page removes blank lines from pasted text and keeps only rows that contain actual values.',
      'It is useful when copied lists, logs, exports, or notes include empty rows that break the next transform step.'
    ],
    howTo: [
      'Paste the text that contains blank rows.',
      'Enable trim if whitespace-only rows should count as empty too.',
      'Copy the cleaned output without empty lines.'
    ],
    questions: [
      'How do I remove empty lines online?',
      'How do I delete blank rows from copied text?',
      'How do I clean whitespace-only lines before using another tool?'
    ],
    example: {
      input: 'alpha\n\nbeta\n   \ngamma',
      outputTitle: 'Output without empty lines',
      output: 'alpha\nbeta\ngamma'
    },
    faq: [
      { q: 'Can it remove whitespace-only rows too?', a: 'Yes. Keep trim enabled if rows with only spaces should be treated as empty.' },
      { q: 'Does it change the order of the remaining lines?', a: 'No. It only removes empty rows and keeps the remaining lines in the same order.' },
      { q: 'What should I use after cleanup?', a: 'Move to quote, multiline, compare, or join tools once the empty rows are gone.' }
    ],
    guide: { href: '../how-to-remove-empty-lines/', label: 'Guide' },
    related: [
      { href: '../trim-whitespace/', label: 'Trim Whitespace' },
      { href: '../remove-duplicate-lines/', label: 'Remove Duplicate Lines' },
      { href: '../split-join/', label: 'Split / Join' },
      { href: '../multiline/', label: 'Multiline' }
    ],
    engine: 'list-cleanup',
    config: {
      toolKey: 'remove-empty-lines',
      operation: 'remove-empty',
      modeLabel: 'Remove empty',
      inputHint: 'Text with blank rows',
      outputHint: 'Clean lines without blanks',
      placeholder: 'alpha\n\nbeta\n   \ngamma',
      copySuccess: 'Cleaned lines copied.',
      examples: {
        notes: 'alpha\n\nbeta\n   \ngamma',
        logs: 'INFO started\n\nWARN retry\n\nERROR timeout',
        csv: 'name,email\n\nAlice,alice@example.com\n\nBob,bob@example.com'
      },
      exampleButtons: [
        { key: 'notes', label: 'Notes' },
        { key: 'logs', label: 'Logs' },
        { key: 'csv', label: 'CSV rows' }
      ],
      defaultExample: 'notes',
      controls: { trim: true, skipEmpty: false },
      stats: [
        { key: 'modeLabel', label: 'Mode', defaultValue: 'Remove empty' },
        { key: 'totalLines', label: 'Total lines', defaultValue: '0' },
        { key: 'emptyLines', label: 'Empty lines', defaultValue: '0' },
        { key: 'removedLines', label: 'Removed', defaultValue: '0' },
        { key: 'outputLines', label: 'Output lines', defaultValue: '0' },
        { key: 'inputChars', label: 'Input chars', defaultValue: '0' },
        { key: 'outputChars', label: 'Output chars', defaultValue: '0' },
        { key: 'deltaChars', label: 'Delta', defaultValue: '0' }
      ]
    }
  },
  {
    slug: 'trim-whitespace',
    title: 'Trim Whitespace from Lines Online | DevFormat',
    description: 'Trim leading and trailing whitespace from each line of text. Clean copied values before dedupe, comparison, quoting, or encoding.',
    keywords: 'trim whitespace from lines online, trim spaces from text, remove leading trailing whitespace lines',
    kicker: 'Cleanup & Extraction',
    h1: 'Trim Whitespace from Lines Online',
    heroText: 'Normalize copied lines by trimming leading and trailing spaces before the next tool in your workflow.',
    quickAnswer: [
      'This page trims leading and trailing whitespace from each line while preserving the line order.',
      'It is useful before dedupe, comparison, quoting, slugifying, or turning copied exports into clean lists.'
    ],
    howTo: [
      'Paste the text with uneven spacing into the input box.',
      'Optionally remove empty rows after trimming.',
      'Copy the normalized output.'
    ],
    questions: [
      'How do I trim whitespace from each line online?',
      'How do I remove leading and trailing spaces from copied values?',
      'How do I normalize text before deduping or comparing it?'
    ],
    example: {
      input: '  alpha  \n beta\n\ngamma   ',
      outputTitle: 'Trimmed output',
      output: 'alpha\nbeta\n\ngamma'
    },
    faq: [
      { q: 'Does it keep blank lines?', a: 'Yes by default. Enable skip-empty if you want blank rows removed after trimming.' },
      { q: 'Will it change the order of the lines?', a: 'No. It only trims whitespace around each line.' },
      { q: 'What tool should I use next?', a: 'Trim first, then dedupe, compare, quote, or join the cleaned values.' }
    ],
    guide: { href: '../how-to-trim-whitespace/', label: 'Guide' },
    related: [
      { href: '../remove-empty-lines/', label: 'Remove Empty Lines' },
      { href: '../remove-duplicate-lines/', label: 'Remove Duplicate Lines' },
      { href: '../compare-two-lists/', label: 'Compare Two Lists' },
      { href: '../quote/', label: 'Quote' }
    ],
    engine: 'list-cleanup',
    config: {
      toolKey: 'trim-whitespace',
      operation: 'trim-whitespace',
      modeLabel: 'Trim whitespace',
      inputHint: 'Text with uneven spacing',
      outputHint: 'Whitespace-trimmed lines',
      placeholder: '  alpha  \n beta\n\ngamma   ',
      copySuccess: 'Trimmed lines copied.',
      examples: {
        values: '  alpha  \n beta\n\ngamma   ',
        ids: ' 1001 \n1002\n 1003 ',
        env: ' API_KEY \n API_SECRET\n\n API_HOST '
      },
      exampleButtons: [
        { key: 'values', label: 'Values' },
        { key: 'ids', label: 'Record IDs' },
        { key: 'env', label: 'Env keys' }
      ],
      defaultExample: 'values',
      controls: { trim: false, skipEmpty: true },
      stats: [
        { key: 'modeLabel', label: 'Mode', defaultValue: 'Trim whitespace' },
        { key: 'totalLines', label: 'Total lines', defaultValue: '0' },
        { key: 'trimmedLines', label: 'Changed lines', defaultValue: '0' },
        { key: 'emptyLines', label: 'Empty lines', defaultValue: '0' },
        { key: 'outputLines', label: 'Output lines', defaultValue: '0' },
        { key: 'inputChars', label: 'Input chars', defaultValue: '0' },
        { key: 'outputChars', label: 'Output chars', defaultValue: '0' },
        { key: 'deltaChars', label: 'Delta', defaultValue: '0' }
      ]
    }
  },
  {
    slug: 'extract-numbers',
    title: 'Extract Numbers from Text | DevFormat',
    description: 'Extract numbers from mixed text, logs, copied notes, payloads, and exports. Keep unique values or sort the numeric output before copying.',
    keywords: 'extract numbers from text, number extractor online, find numbers in text',
    kicker: 'Cleanup & Extraction',
    h1: 'Extract Numbers from Text',
    heroText: 'Pull integers and decimals out of mixed text, then copy one value per line for debugging, spreadsheet cleanup, or further formatting.',
    quickAnswer: [
      'This page extracts numeric values from mixed text like logs, notes, payloads, and exported rows.',
      'You can keep unique values only or sort the extracted numbers before sending them into another tool.'
    ],
    howTo: [
      'Paste mixed text that contains numbers into the input box.',
      'Choose whether to keep unique values or sort the output.',
      'Copy the extracted number list.'
    ],
    questions: [
      'How do I extract numbers from text online?',
      'How do I turn mixed notes into one number per line?',
      'How do I remove duplicate numbers from copied text?'
    ],
    example: {
      input: 'Order 1001 failed after 3 retries and 12.5 seconds. Order 1001 retried at 14:30.',
      outputTitle: 'Extracted numbers',
      output: '1001\n3\n12.5\n14\n30'
    },
    faq: [
      { q: 'Does it extract decimals?', a: 'Yes. Integers and decimal values are both supported.' },
      { q: 'Can I remove duplicate values?', a: 'Yes. Keep unique-only enabled to output each value once.' },
      { q: 'Can I sort the extracted output?', a: 'Yes. Turn on sort output if you want the number list ordered before copying.' }
    ],
    guide: { href: '../how-to-extract-numbers-from-text/', label: 'Guide' },
    related: [
      { href: '../remove-duplicate-lines/', label: 'Remove Duplicate Lines' },
      { href: '../sort-lines/', label: 'Sort Lines' },
      { href: '../compare-two-lists/', label: 'Compare Two Lists' },
      { href: '../multiline/', label: 'Multiline' }
    ],
    engine: 'extract',
    config: {
      toolKey: 'extract-numbers',
      extractType: 'numbers',
      modeLabel: 'Extract numbers',
      inputHint: 'Paste mixed text, logs, or notes',
      outputHint: 'One number per line',
      placeholder: 'Order 1001 failed after 3 retries and 12.5 seconds.',
      copySuccess: 'Extracted numbers copied.',
      examples: {
        orders: 'Order 1001 failed after 3 retries and 12.5 seconds. Order 1001 retried at 14:30.',
        logs: 'cpu=0.81 mem=512 req=1024 retry=2',
        notes: 'Budget: 2400, spent: 1300, remaining: 1100'
      },
      exampleButtons: [
        { key: 'orders', label: 'Orders' },
        { key: 'logs', label: 'Logs' },
        { key: 'notes', label: 'Notes' }
      ],
      defaultExample: 'orders',
      controls: { uniqueOnly: false, sortOutput: false },
      stats: [
        { key: 'modeLabel', label: 'Mode', defaultValue: 'Extract numbers' },
        { key: 'matches', label: 'Matches', defaultValue: '0' },
        { key: 'uniqueMatches', label: 'Unique', defaultValue: '0' },
        { key: 'duplicatesRemoved', label: 'Duplicates', defaultValue: '0' },
        { key: 'outputLines', label: 'Output lines', defaultValue: '0' },
        { key: 'inputChars', label: 'Input chars', defaultValue: '0' },
        { key: 'outputChars', label: 'Output chars', defaultValue: '0' },
        { key: 'deltaChars', label: 'Delta', defaultValue: '0' }
      ]
    }
  },
  {
    slug: 'csv-column-to-lines',
    title: 'CSV Column to Lines Online | DevFormat',
    description: 'Extract one column from CSV, TSV, or delimited text and turn it into one value per line. Useful for exports, copied tables, and spreadsheet cleanup.',
    keywords: 'csv column to lines, extract csv column online, csv to one column list, tsv column extractor',
    kicker: 'Cleanup & Extraction',
    h1: 'CSV Column to Lines Online',
    heroText: 'Extract a single column from CSV, TSV, semicolon, or pipe-delimited rows and copy one clean value per line.',
    quickAnswer: [
      'This page extracts one column from delimited rows and converts it into a newline list.',
      'It works well for CSV exports, copied tables, TSV data, and quick spreadsheet cleanup before the next transform step.'
    ],
    howTo: [
      'Paste CSV, TSV, or delimited text into the input box.',
      'Choose the delimiter and column number, then decide whether to skip the header row.',
      'Copy the extracted column as one value per line.'
    ],
    questions: [
      'How do I extract one CSV column into lines online?',
      'How do I turn a spreadsheet export into a one-column text list?',
      'How do I pull the email or ID column out of CSV data?'
    ],
    example: {
      input: 'name,email,team\nAlice,alice@example.com,Sales\nBob,bob@example.com,Support',
      outputTitle: 'Output for column 2',
      output: 'alice@example.com\nbob@example.com'
    },
    faq: [
      { q: 'Can I use TSV or pipe-delimited data?', a: 'Yes. Choose the matching delimiter preset before extracting the column.' },
      { q: 'Does it support quoted CSV cells?', a: 'Yes. The parser handles quoted cells and escaped double quotes inside a row.' },
      { q: 'Can I skip the header row?', a: 'Yes. Keep skip-header enabled when the first row contains column names.' }
    ],
    guide: { href: '../how-to-extract-a-column-from-csv/', label: 'Guide' },
    related: [
      { href: '../extract-emails/', label: 'Extract Emails' },
      { href: '../remove-empty-lines/', label: 'Remove Empty Lines' },
      { href: '../split-join/', label: 'Split / Join' },
      { href: '../multiline/', label: 'Multiline' }
    ],
    engine: 'csv-column',
    config: {
      toolKey: 'csv-column-to-lines',
      modeLabel: 'Extract column',
      inputHint: 'CSV, TSV, or delimited rows',
      outputHint: 'One extracted value per line',
      placeholder: 'name,email,team\nAlice,alice@example.com,Sales\nBob,bob@example.com,Support',
      copySuccess: 'Column values copied.',
      examples: {
        csv: 'name,email,team\nAlice,alice@example.com,Sales\nBob,bob@example.com,Support',
        tsv: 'id\tstatus\tnote\n1001\topen\tNeeds review\n1002\tclosed\tDone',
        pipe: 'sku|price|region\nsku-1|12.5|APAC\nsku-2|9.8|US'
      },
      exampleButtons: [
        { key: 'csv', label: 'CSV export' },
        { key: 'tsv', label: 'TSV export' },
        { key: 'pipe', label: 'Pipe export' }
      ],
      defaultExample: 'csv',
      presets: [
        { key: 'comma', label: 'Comma' },
        { key: 'tab', label: 'Tab' },
        { key: 'semicolon', label: 'Semicolon' },
        { key: 'pipe', label: 'Pipe' }
      ],
      defaultPreset: 'comma',
      controls: { trim: true, skipEmpty: true, hasHeader: true },
      stats: [
        { key: 'modeLabel', label: 'Mode', defaultValue: 'Extract column' },
        { key: 'totalRows', label: 'Total rows', defaultValue: '0' },
        { key: 'dataRows', label: 'Data rows', defaultValue: '0' },
        { key: 'columnNumber', label: 'Column', defaultValue: '1' },
        { key: 'extractedValues', label: 'Extracted', defaultValue: '0' },
        { key: 'emptyValues', label: 'Empty values', defaultValue: '0' },
        { key: 'inputChars', label: 'Input chars', defaultValue: '0' },
        { key: 'outputChars', label: 'Output chars', defaultValue: '0' }
      ]
    }
  },
  {
    slug: 'compare-two-lists',
    title: 'Compare Two Lists Online | DevFormat',
    description: 'Compare two newline lists and return common values, only-in-A values, and only-in-B values. Useful for IDs, exports, tags, and config diffs.',
    keywords: 'compare two lists online, list difference tool, compare newline lists, common values between two lists',
    kicker: 'Cleanup & Extraction',
    h1: 'Compare Two Lists Online',
    heroText: 'Paste two newline lists, compare them in the browser, and copy shared values or differences for debugging, QA, and export cleanup.',
    quickAnswer: [
      'This page compares two newline lists and shows three results: values in both lists, values only in list A, and values only in list B.',
      'It works well for IDs, exported rows, tag lists, feature flags, and support/debugging workflows.'
    ],
    howTo: [
      'Paste one list into A and the other into B.',
      'Choose whether to trim values or ignore empty lines.',
      'Copy the shared list or either side-only result.'
    ],
    questions: [
      'How do I compare two newline lists online?',
      'How do I find values only in one list?',
      'How do I get the intersection between two copied lists?'
    ],
    example: {
      left: '1001\n1002\n1003\n1004',
      right: '1003\n1004\n1005\n1006',
      common: '1003\n1004',
      onlyA: '1001\n1002',
      onlyB: '1005\n1006'
    },
    faq: [
      { q: 'Does it keep the original order?', a: 'Yes. Each result keeps the order from its source list while filtering by membership.' },
      { q: 'Can I ignore blank lines?', a: 'Yes. Leave skip-empty enabled to drop blank values before comparison.' },
      { q: 'Can I trim whitespace before comparing?', a: 'Yes. Turn on trim to compare normalized values.' }
    ],
    related: [
      { href: '../remove-duplicate-lines/', label: 'Remove Duplicate Lines' },
      { href: '../sort-lines/', label: 'Sort Lines' },
      { href: '../extract-emails/', label: 'Extract Emails' },
      { href: '../split-join/', label: 'Split / Join' }
    ],
    engine: 'compare',
    config: {
      toolKey: 'compare-two-lists',
      inputAHint: 'One value per line',
      inputBHint: 'One value per line',
      commonHint: 'Values found in both lists',
      onlyAHint: 'Values only in list A',
      onlyBHint: 'Values only in list B',
      copySuccess: 'Compared list copied.',
      examples: {
        ids: {
          left: '1001\n1002\n1003\n1004',
          right: '1003\n1004\n1005\n1006'
        },
        env: {
          left: 'API_KEY\nAPI_SECRET\nAPI_HOST\nLOG_LEVEL',
          right: 'API_HOST\nAPI_TIMEOUT\nLOG_LEVEL\nPORT'
        },
        emails: {
          left: 'hello@example.com\nops@example.com\nsupport@example.com',
          right: 'ops@example.com\nfinance@example.com\nsupport@example.com'
        }
      },
      exampleButtons: [
        { key: 'ids', label: 'Record IDs' },
        { key: 'env', label: 'Env keys' },
        { key: 'emails', label: 'Emails' }
      ],
      defaultExample: 'ids',
      controls: { trim: true, skipEmpty: true },
      stats: [
        { key: 'totalA', label: 'List A', defaultValue: '0' },
        { key: 'totalB', label: 'List B', defaultValue: '0' },
        { key: 'commonCount', label: 'Common', defaultValue: '0' },
        { key: 'onlyACount', label: 'Only A', defaultValue: '0' },
        { key: 'onlyBCount', label: 'Only B', defaultValue: '0' },
        { key: 'commonUnique', label: 'Unique overlap', defaultValue: '0' }
      ]
    }
  }
];

module.exports = {
  domain: 'https://gurioh.github.io/devformat',
  cleanupTools,
  cleanupHub: {
    title: 'Text Cleanup & Extraction Tools | DevFormat',
    description: 'Cleanup and extraction tools for duplicate lines, sorting, counting, extracting emails, extracting URLs, CSV column cleanup, and comparing two lists.',
    keywords: 'text cleanup tools, extraction tools online, remove duplicate lines, sort lines, compare two lists, remove empty lines, extract numbers, csv column to lines',
    heroTitle: 'Text cleanup and extraction tools for lists, logs, exports, and pasted notes.',
    heroText: 'Use this category when the job is not formatting one value, but cleaning a full set of values: remove duplicates, sort lines, delete blank rows, extract emails, extract URLs, pull out numbers, extract a CSV column, or compare two lists.',
    heroPrimary: { href: '../remove-duplicate-lines/', label: 'Start with duplicate cleanup' },
    heroSecondary: { href: '../compare-two-lists/', label: 'Compare two lists' },
    introTitle: 'What belongs here',
    introText: 'This category covers list cleanup, text inspection, value extraction, and side-by-side comparison. It is the next step after text transform when copied data is noisy, mixed, or spread across multiple rows.',
    nextStepsTitle: 'Good next steps',
    nextSteps: [
      'Use cleanup first when the copied text is messy, duplicated, or mixed with other content.',
      'Move to quote, multiline, split/join, or URL encode once the values are clean.',
      'Use related links and guides to chain tasks without losing your place.'
    ],
    searchQuestions: [
      'How do I remove duplicate lines online?',
      'How do I remove empty lines from copied text?',
      'How do I trim whitespace from each line before dedupe?',
      'How do I extract emails, URLs, or numbers from mixed text?',
      'How do I compare two lists and find differences?',
      'How do I extract one column from CSV into lines?'
    ],
    workflows: [
      {
        title: 'Clean a copied list before the next transform',
        body: 'Remove empty lines, trim whitespace, and dedupe values before quoting, joining, or turning them into SQL or code output.',
        links: [
          { href: '../remove-empty-lines/', label: 'Remove empty lines' },
          { href: '../trim-whitespace/', label: 'Trim whitespace' },
          { href: '../remove-duplicate-lines/', label: 'Remove duplicates' }
        ]
      },
      {
        title: 'Extract one signal from messy text',
        body: 'Pull emails, URLs, or numbers out of mixed logs, notes, payloads, and exports, then reuse the clean output in other tools.',
        links: [
          { href: '../extract-emails/', label: 'Extract emails' },
          { href: '../extract-urls/', label: 'Extract URLs' },
          { href: '../extract-numbers/', label: 'Extract numbers' }
        ]
      },
      {
        title: 'Prepare export data for a focused workflow',
        body: 'Extract one CSV column into lines, sort the result, and compare lists before it moves into quoting, encoding, or request-building tools.',
        links: [
          { href: '../csv-column-to-lines/', label: 'CSV column to lines' },
          { href: '../sort-lines/', label: 'Sort lines' },
          { href: '../compare-two-lists/', label: 'Compare lists' }
        ]
      }
    ],
    guides: [
      { href: '../how-to-remove-empty-lines/', label: 'Remove empty lines from text', body: 'Delete blank rows from copied notes, logs, and exports before the next cleanup or transform step.' },
      { href: '../how-to-trim-whitespace/', label: 'Trim whitespace from lines', body: 'Normalize copied values by removing leading and trailing spaces before dedupe or comparison.' },
      { href: '../how-to-extract-numbers-from-text/', label: 'Extract numbers from text', body: 'Pull integers and decimals out of mixed text for debugging, spreadsheet cleanup, or list comparison.' },
      { href: '../how-to-extract-a-column-from-csv/', label: 'Extract a column from CSV', body: 'Turn delimited rows into one value per line by choosing a column and copying the cleaned result.' }
    ]
  }
};
