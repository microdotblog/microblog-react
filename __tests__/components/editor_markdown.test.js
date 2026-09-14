import assert from 'node:assert/strict'
import vm from 'node:vm'
import editorHtml from '../../src/components/text/editor_html'

// Exercise the JavaScript actually delivered to the WebView, including raw-template escaping.
const script = editorHtml.match(/<script[^>]*>([\s\S]*?)<\/script>/)[1]
new vm.Script(script)
const context = {}
vm.runInNewContext(
  script.slice(script.indexOf('function escapeEditorHTML('), script.indexOf('function highlightHtml(')),
  context
)
const formatEditorHTML = context.formatEditorHTML

function textFromHTML(html) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
}

function classCount(html, class_name) {
  const matches = html.match(new RegExp(`class="${class_name}"`, 'g'))
  return matches ? matches.length : 0
}

function assertRoundTrip(markdown) {
  assert.equal(textFromHTML(formatEditorHTML(markdown)), markdown)
}

test('preserves source text through the generated editor HTML', () => {
  const examples = [
    'AT&amp;T and &#95;literal&#95;',
    '<span title="**not strong**">_yes_</span>',
    '![](/uploads/foo_(bar)_baz.png)',
    '[x](https://example.com/a_(b)_c_d "title)")',
    '[x](<https://example.com/a)b_c_d> "title")',
    '[post]: /foo_(bar)_baz "title)"',
    '[empty]: <> "_literal_"',
    '```\n\nintentional blank first line\n```',
    '~~~\n_literal_\n~~~',
    '- ```\n  _literal_\n  ```',
    '> ```\n> _literal_\n> ```',
    '`` _literal_ ``',
    '`first line\n_literal_`',
    'foo_bar_baz and \\_literal\\_',
    '<hello_world@example.com>',
    '<!DOCTYPE _literal_>',
    '<![CDATA[_literal_]]>',
    '<?pi _literal_?>',
    '\uE0000\uE000 _still italic_',
    '\uE00010\uE001aaaaaa',
    '<img src=x onerror="alert(1)">'
  ]

  examples.forEach(assertRoundTrip)
})

test('styles common emphasis without matching escaped or intraword delimiters', () => {
  let html = formatEditorHTML('_This is probably because revenue._')
  assert.equal(classCount(html, 'editor_italic'), 1)

  html = formatEditorHTML('**_both_**')
  assert.equal(classCount(html, 'editor_bold'), 1)
  assert.equal(classCount(html, 'editor_italic'), 1)

  html = formatEditorHTML('foo_bar_baz \\_not italic\\_ __not italic__ \\**not bold**')
  assert.equal(classCount(html, 'editor_italic'), 0)
  assert.equal(classCount(html, 'editor_bold'), 0)

  html = formatEditorHTML('\\\\_italic_ and \\\\**bold**')
  assert.equal(classCount(html, 'editor_italic'), 1)
  assert.equal(classCount(html, 'editor_bold'), 1)

  html = formatEditorHTML('_not italic\\_ and **not bold\\**')
  assert.equal(classCount(html, 'editor_italic'), 0)
  assert.equal(classCount(html, 'editor_bold'), 0)

  html = formatEditorHTML('_foo \\_ bar_')
  assert.equal(classCount(html, 'editor_italic'), 1)

  html = formatEditorHTML('_not italic\\_ and _yes_')
  assert.ok(html.includes('<span class="editor_italic">_yes_</span>'))

  html = formatEditorHTML('**not bold\\** and **yes**')
  assert.ok(html.includes('<span class="editor_bold">**yes**</span>'))
})

test('protects complete inline link targets and accepts empty labels', () => {
  const examples = [
    '![](/uploads/foo_(bar)_baz.png)',
    '[]()',
    '[x](https://example.com/a_(b)_c_d "title)")',
    '[x](<https://example.com/a)b_c_d> "title")'
  ]

  for (const markdown of examples) {
    const html = formatEditorHTML(markdown)
    assert.equal(classCount(html, 'editor_link_text'), 1, markdown)
    assert.equal(classCount(html, 'editor_link_url'), 1, markdown)
    assert.equal(classCount(html, 'editor_italic'), 0, markdown)
  }

  const escaped = formatEditorHTML('\\[label](/foo_bar)')
  assert.equal(classCount(escaped, 'editor_link_text'), 0)

  const nested = formatEditorHTML('[outer [inner]](url) and [la\\]bel](url)')
  assert.equal(classCount(nested, 'editor_link_text'), 2)

  const invalid = formatEditorHTML('[x](foo\\ bar) and [r]: foo\\ _literal_')
  assert.equal(classCount(invalid, 'editor_link_text'), 0)
  assert.equal(classCount(invalid, 'editor_italic'), 1)

  const recovered = formatEditorHTML('[broken](foo\\ bar) and [valid](url)')
  assert.equal(classCount(recovered, 'editor_link_text'), 1)
  assert.equal(classCount(formatEditorHTML('[broken](oops [valid](url)'), 'editor_link_text'), 1)
  assert.equal(classCount(formatEditorHTML('[broken](<unterminated [valid](url)'), 'editor_link_text'), 1)
  assert.equal(classCount(formatEditorHTML('[broken](url "unterminated [valid](url)'), 'editor_link_text'), 1)

  const formatted_label = formatEditorHTML('[**bold** _italic_ `code` @manton](url)')
  assert.equal(classCount(formatted_label, 'editor_link_text'), 1)
  assert.equal(classCount(formatted_label, 'editor_bold'), 1)
  assert.equal(classCount(formatted_label, 'editor_italic'), 1)
  assert.equal(classCount(formatted_label, 'editor_code_inline'), 1)
  assert.equal(classCount(formatted_label, 'editor_username'), 1)

  assert.equal(classCount(formatEditorHTML('[outer](foo[inner](path))'), 'editor_link_text'), 1)
  assert.equal(classCount(formatEditorHTML('[outer](url "title [inner](path)")'), 'editor_link_text'), 1)
  assert.equal(classCount(formatEditorHTML('[outer [inner](bad\\ dest)](url)'), 'editor_link_text'), 1)
  assert.equal(classCount(formatEditorHTML('[x](<foo\\ bar>)'), 'editor_link_text'), 1)
})

test('protects only valid same-line reference definitions', () => {
  let html = formatEditorHTML('[post]: /foo_(bar)_baz "title)"')
  assert.equal(classCount(html, 'editor_italic'), 0)

  html = formatEditorHTML('[empty]: <> "_literal_"')
  assert.equal(classCount(html, 'editor_italic'), 0)

  html = formatEditorHTML('[note]: this is _important_')
  assert.equal(classCount(html, 'editor_italic'), 1)
})

test('keeps fenced and inline code literal without merging separate blocks', () => {
  const markdown = '```\n_one_\n```\noutside _yes_\n```\n_two_\n```'
  let html = formatEditorHTML(markdown)
  assert.equal(classCount(html, 'editor_code_block'), 2)
  assert.equal(classCount(html, 'editor_italic'), 1)

  html = formatEditorHTML('`(_literal_)` and _visible_')
  assert.equal(classCount(html, 'editor_code_inline'), 1)
  assert.equal(classCount(html, 'editor_italic'), 1)

  html = formatEditorHTML('`` _literal_ `` and `first line\n_second line_`')
  assert.equal(classCount(html, 'editor_code_inline'), 2)
  assert.equal(classCount(html, 'editor_italic'), 0)

  html = formatEditorHTML('`code\\` _italic_`')
  assert.equal(classCount(html, 'editor_code_inline'), 1)
  assert.equal(classCount(html, 'editor_italic'), 1)

  html = formatEditorHTML('- ```\n  _code_\n  ```\n\nafter _yes_')
  assert.equal(classCount(html, 'editor_code_block'), 1)
  assert.equal(classCount(html, 'editor_italic'), 1)

  html = formatEditorHTML('> ```\n> _code_\n> ```\n\nafter _yes_')
  assert.equal(classCount(html, 'editor_code_block'), 1)
  assert.equal(classCount(html, 'editor_italic'), 1)

  html = formatEditorHTML('```\n_literal_\n````')
  assert.equal(classCount(html, 'editor_code_block'), 1)
  assert.equal(classCount(html, 'editor_italic'), 0)

  html = formatEditorHTML('```\n> ```\n_literal_\n```')
  assert.equal(classCount(html, 'editor_code_block'), 1)
  assert.equal(classCount(html, 'editor_italic'), 0)

  html = formatEditorHTML('> ```\n_literal_\n```')
  assert.equal(classCount(html, 'editor_code_block'), 2)
  assert.equal(classCount(html, 'editor_italic'), 1)

  html = formatEditorHTML('- ```\n  code\n- item _yes_\n- ```')
  assert.equal(classCount(html, 'editor_italic'), 1)

  html = formatEditorHTML('> ```\n> code\noutside _yes_\n> ```')
  assert.equal(classCount(html, 'editor_code_block'), 2)
  assert.equal(classCount(html, 'editor_italic'), 1)
  assert.equal(classCount(formatEditorHTML('> ```\n> code\n# heading'), 'editor_header'), 1)

  html = formatEditorHTML('> ```\n> code\n\n> _italic_')
  assert.equal(classCount(html, 'editor_italic'), 1)

  html = formatEditorHTML('- ```\n\t_literal_\n\t```')
  assert.equal(classCount(html, 'editor_code_block'), 1)
  assert.equal(classCount(html, 'editor_italic'), 0)

  html = formatEditorHTML('\t```\n_literal_')
  assert.equal(classCount(html, 'editor_code_block'), 0)
  assert.equal(classCount(html, 'editor_italic'), 1)

  html = formatEditorHTML('    - ```\n    _literal_\n    - ```')
  assert.equal(classCount(html, 'editor_code_block'), 0)
  assert.equal(classCount(html, 'editor_italic'), 0)

  html = formatEditorHTML('- ```\n    code\n    ```\n  _italic_')
  assert.equal(classCount(html, 'editor_code_block'), 1)
  assert.equal(classCount(html, 'editor_italic'), 1)

  html = formatEditorHTML('> ```\n> _literal_')
  assert.equal(classCount(html, 'editor_code_block'), 1)
  assert.equal(classCount(html, 'editor_italic'), 0)

  html = formatEditorHTML('- ```\n  _literal_')
  assert.equal(classCount(html, 'editor_code_block'), 1)
  assert.equal(classCount(html, 'editor_italic'), 0)

  html = formatEditorHTML('- item\n  ```\n  code\n- next _yes_')
  assert.equal(classCount(html, 'editor_code_block'), 1)
  assert.equal(classCount(html, 'editor_italic'), 1)

  html = formatEditorHTML('-\n  ```\n  code\n- next _yes_')
  assert.equal(classCount(html, 'editor_code_block'), 1)
  assert.equal(classCount(html, 'editor_italic'), 1)

  html = formatEditorHTML('- - ```\n    _literal_\n  - next _yes_')
  assert.equal(classCount(html, 'editor_code_block'), 1)
  assert.equal(classCount(html, 'editor_italic'), 1)

  html = formatEditorHTML('10. outer\n    - inner\n    ```\n    _literal_\n    ```\noutside _yes_')
  assert.equal(classCount(html, 'editor_code_block'), 1)
  assert.equal(classCount(html, 'editor_italic'), 1)

  html = formatEditorHTML('```\n_unclosed_')
  assert.equal(classCount(html, 'editor_code_block'), 1)
  assert.equal(classCount(html, 'editor_italic'), 0)
})

test('does not parse Markdown inside HTML tags', () => {
  const html = formatEditorHTML('<span title="**not strong**">_yes_</span>')
  assert.equal(classCount(html, 'editor_tag'), 2)
  assert.equal(classCount(html, 'editor_attr_name'), 1)
  assert.equal(classCount(html, 'editor_attr_value'), 1)
  assert.equal(classCount(html, 'editor_bold'), 0)
  assert.equal(classCount(html, 'editor_italic'), 1)
  assert.ok(!formatEditorHTML('<img src=x onerror="alert(1)">').includes('<img'))
  assert.equal(classCount(formatEditorHTML('<![CDATA[_literal_]]>'), 'editor_italic'), 0)
  assert.equal(classCount(formatEditorHTML('<?pi _literal_?>'), 'editor_italic'), 0)
  assert.equal(classCount(formatEditorHTML('<!-- unfinished _literal_'), 'editor_italic'), 0)
})

test('leaves surrounding Markdown delimiters outside protected URLs', () => {
  let html = formatEditorHTML('**https://example.com/path**')
  assert.equal(classCount(html, 'editor_bold'), 1)

  html = formatEditorHTML('_https://example.com/path_')
  assert.equal(classCount(html, 'editor_italic'), 1)

  html = formatEditorHTML('**read https://example.com/path**')
  assert.equal(classCount(html, 'editor_bold'), 1)

  html = formatEditorHTML('_read https://example.com/path_')
  assert.equal(classCount(html, 'editor_italic'), 1)

  html = formatEditorHTML('**https://example.com/path**.')
  assert.equal(classCount(html, 'editor_bold'), 1)

  html = formatEditorHTML('_visit https://example.com/path_.')
  assert.equal(classCount(html, 'editor_italic'), 1)

  html = formatEditorHTML('<hello_world@example.com>')
  assert.equal(classCount(html, 'editor_italic'), 0)
  assert.equal(classCount(html, 'editor_username'), 0)
})

const mentionExamples = [
  '@bob_test',
  '@bob_test_again',
  '@bob_test@social-server.example',
  '@bob.test_user@social2.example',
  '@bob-test.bsky.social',
  '@bob-test.social2.example'
]

test('highlights complete local and federated mentions without trailing punctuation', () => {
  for (const mention of mentionExamples) {
    for (const punctuation of ['.', ',', '!', '?', ':', ')']) {
      const markdown = `${mention}${punctuation} Hello.`
      assert.equal(formatEditorHTML(markdown), `<span class="editor_username">${mention}</span>${punctuation} Hello.`)
      assertRoundTrip(markdown)
    }
  }
  const markdown = '@bob_test and @bob-test.bsky.social say _hello_.'
  assert.equal(classCount(formatEditorHTML(markdown), 'editor_username'), 2)
  assert.equal(classCount(formatEditorHTML(markdown), 'editor_italic'), 1)
  assertRoundTrip(markdown)
})

test('mentions inside code, URLs and HTML attributes stay protected', () => {
  for (const markdown of ['`@bob_test`', 'https://social.example/@bob_test', '<a href="/@bob_test">link</a>']) {
    assert.equal(classCount(formatEditorHTML(markdown), 'editor_username'), 0)
    assertRoundTrip(markdown)
  }
})

test('preserves user-entered invisible characters, nonbreaking spaces and blank lines', () => {
  for (const text of [
    'one\u200B\u200Btwo\u00A0three',
    '\uE00010\uE001aaaaaa',
    '\u0060\u0060\u0060\n\nblank first line\n\u0060\u0060\u0060'
  ]) {
    assertRoundTrip(text)
  }
})
