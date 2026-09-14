const editorHtml = String.raw`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
  >
  <style>
    :root {
      --editor-background: #ffffff;
      --editor-text: #000000;
      --editor-placeholder: #9ca3af;
      --editor-link: #337ab7;
      --editor-link-url: #808080;
      --editor-quote: #2f7d32;
      --editor-tag: #96268a;
      --editor-attribute: #808080;
      --editor-code-background: #efefef;
      --editor-divider: #808080;
      --editor-caret: #111827;
      --editor-bottom-scrim: rgba(255, 255, 255, 0.82);
      --editor-font-size: 18px;
      --editor-padding-top: 8px;
      --editor-padding-right: 8px;
      --editor-padding-bottom: 8px;
      --editor-padding-left: 8px;
      --editor-bottom-overlay: 0px;
      --editor-viewport-height: 100vh;
    }

    html,
    body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
      overscroll-behavior: none;
      background: var(--editor-background);
      color: var(--editor-text);
      color-scheme: light dark;
      -webkit-text-size-adjust: 100%;
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
    }

    body {
      overflow-x: hidden;
      overflow-y: hidden;
    }

    body.dark {
      --editor-background: #1f2937;
      --editor-text: #ffffff;
      --editor-placeholder: #9ca3af;
      --editor-code-background: #000000;
      --editor-quote: #78b855;
      --editor-tag: #e3abed;
      --editor-caret: #ffffff;
      --editor-bottom-scrim: rgba(31, 41, 55, 0.86);
    }

    .editor_shell {
      box-sizing: border-box;
      width: 100%;
      height: var(--editor-viewport-height);
      overflow: hidden;
      overscroll-behavior: none;
      position: relative;
      background: var(--editor-background);
    }

    .editor {
      box-sizing: border-box;
      width: 100%;
      height: var(--editor-viewport-height);
      min-height: 44px;
      overflow-x: hidden;
      overflow-y: auto;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
      white-space: pre-wrap;
      word-break: break-word;
      outline: none;
      border: 0;
      margin: 0;
      padding-top: var(--editor-padding-top);
      padding-right: var(--editor-padding-right);
      padding-bottom: calc(var(--editor-padding-bottom) + var(--editor-bottom-overlay));
      padding-left: var(--editor-padding-left);
      background: var(--editor-background);
      color: var(--editor-text);
      caret-color: var(--editor-caret);
      font-size: var(--editor-font-size);
      line-height: 1.35;
      font-weight: 400;
      -webkit-user-select: text;
      user-select: text;
    }

    .editor[contenteditable="false"] {
      opacity: 0.55;
    }

    .editor_plain {
      color: var(--editor-text);
      font-weight: normal;
      font-style: normal;
    }

    .editor_marker {
      display: inline-block;
      width: 0;
      min-width: 0;
      height: 1em;
      overflow: hidden;
      line-height: inherit;
      color: transparent;
      caret-color: var(--editor-caret);
      pointer-events: none;
      -webkit-user-select: none;
      user-select: none;
    }

    .editor_bold {
      font-weight: 700;
    }

    .editor_italic {
      font-style: italic;
    }

    .editor_link_text {
      color: var(--editor-link);
      text-decoration: underline;
    }

    .editor_link_url {
      color: var(--editor-link-url);
      font-weight: 300;
      word-break: break-all;
    }

    .editor_quote {
      color: var(--editor-quote);
    }

    .editor_tag {
      color: var(--editor-tag);
      font-weight: 300;
    }

    .editor_attr_name {
      color: var(--editor-attribute);
    }

    .editor_attr_value {
      color: var(--editor-link);
      font-weight: normal;
    }

    .editor_code_inline,
    .editor_code_block {
      background-color: var(--editor-code-background);
      border-radius: 4px;
      padding: 2px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      font-size: 0.9em;
    }

    .editor_code_block {
      display: inline-block;
    }

    .editor_header {
      font-weight: 700;
    }

    .editor_divider {
      color: var(--editor-divider);
    }

    .editor_username {
      color: var(--editor-link);
    }

    .editor_bottom_scrim {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      height: var(--editor-bottom-overlay);
      background: var(--editor-bottom-scrim);
      pointer-events: none;
      z-index: 10;
    }

  </style>
</head>
<body><div class="editor_shell"><div contenteditable="true" class="editor" id="editor" spellcheck="true" autocapitalize="sentences" enterkeyhint="enter" inputmode="text"></div><div class="editor_bottom_scrim" aria-hidden="true"></div></div>
  <script>
    (function () {
      var isIgnoringInput = false;
      var isApplyingStyles = false;
      var isComposing = false;
      var changeTimer = null;
      var selectionTimer = null;
      var viewportHeight = null;
      var lastText = "";
      var didApplyInitialValue = false;
      var editorMarkerSelector = '[data-editor-marker="caret"]';
      var markdownCharacters = [' ', '*', '_', '[', ']', '(', ')', '<', '>', '"', '\`', '#', '-', '@', '~', '\\'];

      function editor() {
        return document.getElementById("editor");
      }

      function postMessage(type, payload) {
        if (!window.ReactNativeWebView || !window.ReactNativeWebView.postMessage) {
          return;
        }

        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: type,
          payload: payload || {}
        }));
      }

      function isEditorMarker(node) {
        return node &&
          node.nodeType === Node.ELEMENT_NODE &&
          node.matches &&
          node.matches(editorMarkerSelector);
      }

      function hasTrailingMarker(root) {
        return isEditorMarker(root && root.lastChild);
      }

      function childIndex(node) {
        var index = 0;
        while (node && node.previousSibling) {
          index++;
          node = node.previousSibling;
        }
        return index;
      }

      function logicalLength(node) {
        if (isEditorMarker(node)) {
          return 0;
        }

        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent.length;
        }

        if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === "BR") {
          return 1;
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
          var length = 0;
          for (var child = node.firstChild; child; child = child.nextSibling) {
            length += logicalLength(child);
          }
          return length;
        }

        return 0;
      }

      function editorPlainText(root) {
        var text = "";

        function step(node) {
          if (isEditorMarker(node)) {
            return;
          }

          if (node.nodeType === Node.TEXT_NODE) {
            text += node.textContent;
          }
          else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === "BR") {
            text += "\n";
          }
          else if (node.nodeType === Node.ELEMENT_NODE) {
            for (var child = node.firstChild; child; child = child.nextSibling) {
              step(child);
            }
          }
        }

        step(root);
        return text;
      }

      function selectionPosition(root, targetNode, targetOffset) {
        var current = 0;
        var found = false;

        function step(node) {
          if (found || isEditorMarker(node)) {
            return;
          }

          if (node === targetNode) {
            if (node.nodeType === Node.TEXT_NODE) {
              current += Math.min(targetOffset, node.textContent.length);
            }
            else if (node.nodeType === Node.ELEMENT_NODE) {
              var childCount = Math.min(targetOffset, node.childNodes.length);
              for (var i = 0; i < childCount; i++) {
                current += logicalLength(node.childNodes[i]);
              }
            }
            found = true;
            return;
          }

          if (node.nodeType === Node.TEXT_NODE) {
            current += node.textContent.length;
          }
          else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === "BR") {
            current++;
          }
          else if (node.nodeType === Node.ELEMENT_NODE) {
            for (var child = node.firstChild; child; child = child.nextSibling) {
              step(child);
            }
          }
        }

        step(root);
        return current;
      }

      function currentSelection() {
        var root = editor();
        var selection = window.getSelection();
        var length = editorPlainText(root).length;

        if (!selection || selection.rangeCount === 0) {
          return {
            start: length,
            end: length
          };
        }

        var range = selection.getRangeAt(0);
        if (!root.contains(range.startContainer) && range.startContainer !== root) {
          return {
            start: length,
            end: length
          };
        }

        var start = selectionPosition(root, range.startContainer, range.startOffset);
        var end = selectionPosition(root, range.endContainer, range.endOffset);
        return {
          start: Math.min(start, end),
          end: Math.max(start, end)
        };
      }

      function setDomSelection(root, startNode, startOffset, endNode, endOffset) {
        var range = document.createRange();
        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);

        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }

      function positionForOffset(root, offset) {
        var target = Math.max(0, offset);
        var current = 0;
        var result = null;

        if (target > 0 && hasTrailingMarker(root) && target >= editorPlainText(root).length) {
          return {
            node: root,
            offset: root.childNodes.length
          };
        }

        function use(node, innerOffset) {
          result = {
            node: node,
            offset: innerOffset
          };
        }

        function step(node) {
          if (result || isEditorMarker(node)) {
            return;
          }

          if (node.nodeType === Node.TEXT_NODE) {
            var length = node.textContent.length;
            if (target <= current + length) {
              use(node, target - current);
            }
            else {
              current += length;
            }
          }
          else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === "BR") {
            if (target <= current + 1) {
              use(node.parentNode, childIndex(node) + 1);
            }
            else {
              current++;
            }
          }
          else if (node.nodeType === Node.ELEMENT_NODE) {
            for (var child = node.firstChild; child; child = child.nextSibling) {
              step(child);
            }
          }
        }

        if (target === 0) {
          return {
            node: root,
            offset: 0
          };
        }

        step(root);

        if (!result) {
          result = {
            node: root,
            offset: root.childNodes.length
          };
        }

        return result;
      }

      function setSelectionRange(start, end) {
        var root = editor();
        var textLength = editorPlainText(root).length;
        var safeStart = Math.max(0, Math.min(start || 0, textLength));
        var safeEnd = Math.max(0, Math.min(end == null ? safeStart : end, textLength));
        var first = positionForOffset(root, Math.min(safeStart, safeEnd));
        var last = positionForOffset(root, Math.max(safeStart, safeEnd));

        try {
          setDomSelection(root, first.node, first.offset, last.node, last.offset);
        }
        catch (error) {
          var fallback = positionForOffset(root, textLength);
          setDomSelection(root, fallback.node, fallback.offset, fallback.node, fallback.offset);
        }
      }

      function moveCursorToEnd() {
        var length = editorPlainText(editor()).length;
        setSelectionRange(length, length);
      }

      function clampScrollOffsets() {
        // Keep the outer page fixed while allowing the editor itself to bounce.
        if (window.scrollX !== 0 || window.scrollY !== 0) {
          window.scrollTo(0, 0);
        }

        if (document.documentElement.scrollTop !== 0) {
          document.documentElement.scrollTop = 0;
        }

        if (document.body.scrollTop !== 0) {
          document.body.scrollTop = 0;
        }
      }

      function scheduleClampScrollOffsets() {
        requestAnimationFrame(clampScrollOffsets);
      }

      function scrollSelectionIntoView() {
        var root = editor();
        var selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
          return;
        }

        var range = selection.getRangeAt(0);
        if (!root.contains(range.endContainer) && range.endContainer !== root) {
          return;
        }

        var caretRange = range.cloneRange();
        caretRange.collapse(false);
        var rect = caretRange.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
          var savedSelection = currentSelection();
          var marker = document.createElement("span");
          marker.setAttribute("data-editor-marker", "caret");
          marker.className = "editor_marker";
          marker.appendChild(document.createTextNode("\u200b"));
          caretRange.insertNode(marker);
          rect = marker.getBoundingClientRect();
          marker.parentNode.removeChild(marker);
          setSelectionRange(savedSelection.start, savedSelection.end);
        }

        var editorRect = root.getBoundingClientRect();
        var visibleTop = editorRect.top;
        var visibleBottom = editorRect.bottom;
        var scrollPadding = 12;

        if (rect.bottom + scrollPadding > visibleBottom) {
          root.scrollTop += rect.bottom + scrollPadding - visibleBottom;
        }
        else if (rect.top - scrollPadding < visibleTop) {
          root.scrollTop += rect.top - scrollPadding - visibleTop;
        }

        clampScrollOffsets();
      }

      function preserveTrailingNewline(html) {
        if (html.endsWith("\n")) {
          return html.slice(0, -1) + '<br><span class="editor_marker" data-editor-marker="caret" aria-hidden="true">\u200b</span>';
        }

        return html;
      }

      function escapeEditorHTML(text) {
        return String(text)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
      }

      function formatHTMLTag(text) {
        if (text.startsWith('<!') || text.startsWith('<?')) {
          return '<span class="editor_tag">' + escapeEditorHTML(text) + '</span>'
        }
        let current_pos = text[1] == '/' ? 2 : 1
        while (/[A-Za-z0-9:-]/.test(text[current_pos] ?? '')) {
          current_pos++
        }
        let formatted = escapeEditorHTML(text.substring(0, current_pos))
        while (current_pos < text.length) {
          const char = text[current_pos]
          if (isWhitespace(char) || char == '/' || char == '>') {
            formatted += escapeEditorHTML(char)
            current_pos++
            continue
          }
          const name_start = current_pos
          while (current_pos < text.length && !/[\s=/>]/.test(text[current_pos])) {
            current_pos++
          }
          formatted +=
            '<span class="editor_attr_name">' + escapeEditorHTML(text.substring(name_start, current_pos)) + '</span>'
          while (isWhitespace(text[current_pos])) {
            formatted += escapeEditorHTML(text[current_pos])
            current_pos++
          }
          if (text[current_pos] != '=') {
            continue
          }
          formatted += '='
          current_pos++
          while (isWhitespace(text[current_pos])) {
            formatted += escapeEditorHTML(text[current_pos])
            current_pos++
          }
          const value_start = current_pos
          const quote = text[current_pos] == '"' || text[current_pos] == "'" ? text[current_pos] : null
          if (quote) {
            current_pos++
            while (current_pos < text.length && text[current_pos] != quote) {
              current_pos++
            }
            if (text[current_pos] == quote) {
              current_pos++
            }
          } else {
            while (current_pos < text.length && !/[\s>]/.test(text[current_pos])) {
              current_pos++
            }
          }
          formatted +=
            '<span class="editor_attr_value">' + escapeEditorHTML(text.substring(value_start, current_pos)) + '</span>'
        }
        return '<span class="editor_tag">' + formatted + '</span>'
      }

      function createPlaceholderStore(text) {
        let attempt = 0
        let prefix = '\uE000' + text.length + '\uE001'
        while (text.includes(prefix)) {
          attempt++
          prefix = '\uE000' + text.length + ':' + attempt + '\uE001'
        }
        const entries = []
        const token_source = prefix + '(\\d+)' + prefix
        function add(type, value) {
          const index = entries.length
          entries.push({
            type: type,
            value: value
          })
          return prefix + index + prefix
        }
        function tokenAt(value, position, type) {
          if (!value.startsWith(prefix, position)) {
            return null
          }
          const index_start = position + prefix.length
          const token_end = value.indexOf(prefix, index_start)
          if (token_end == -1) {
            return null
          }
          const index_text = value.substring(index_start, token_end)
          if (!/^\d+$/.test(index_text)) {
            return null
          }
          const entry = entries[Number(index_text)]
          if (!entry || entry.type != type) {
            return null
          }
          return {
            end: token_end + prefix.length
          }
        }
        function rawText(value) {
          // outer atoms can contain tokens created by earlier protection passes
          const token_regex = new RegExp(token_source, 'g')
          return value.replace(token_regex, (match, index) => {
            const nested_entry = entries[Number(index)]
            if (!nested_entry || nested_entry.type == 'markup') {
              return match
            }
            return rawText(nested_entry.value)
          })
        }
        function restore(value) {
          const token_regex = new RegExp(token_source, 'g')
          return value.replace(token_regex, (match, index) => {
            const entry = entries[Number(index)]
            if (!entry) {
              return match
            }
            if (entry.type == 'markup') {
              return entry.value
            }
            const raw_value = rawText(entry.value)
            if (entry.type == 'html_tag') {
              return formatHTMLTag(raw_value)
            }
            const escaped_value = escapeEditorHTML(raw_value)
            if (entry.type == 'code_block') {
              return '<span class="editor_code_block">' + escaped_value + '</span>'
            } else if (entry.type == 'code_inline') {
              return '<span class="editor_code_inline">' + escaped_value + '</span>'
            }
            return escaped_value
          })
        }
        return {
          add: add,
          tokenAt: tokenAt,
          restore: restore
        }
      }

      function isEscaped(text, position) {
        let slash_count = 0
        for (let i = position - 1; i >= 0 && text[i] == '\\'; i--) {
          slash_count++
        }
        return slash_count % 2 == 1
      }

      function isSpaceOrTab(char) {
        return char == ' ' || char == '\t'
      }

      function isWhitespace(char) {
        return !char || /\s/u.test(char)
      }

      function lineEnd(text, start) {
        let end = text.indexOf('\n', start)
        if (end == -1) {
          end = text.length
        }
        if (end > start && text[end - 1] == '\r') {
          end--
        }
        return end
      }

      function findMarkdownTargetEnd(text, start, limit, closing_char, allow_empty, recovery_starts = null) {
        let current_pos = start
        let destination_end = start

        // angle-wrapped destinations have their own delimiter rules
        if (text[current_pos] == '<') {
          current_pos++
          let found_angle_end = false
          let escaped = false
          while (current_pos < limit) {
            if (recovery_starts?.has(current_pos)) {
              return -1
            }
            const char = text[current_pos]
            if (escaped) {
              escaped = false
            } else if (char == '\\') {
              escaped = true
            } else if (char == '<') {
              return -1
            } else if (char == '>') {
              found_angle_end = true
              current_pos++
              break
            }
            current_pos++
          }
          if (!found_angle_end) {
            return -1
          }
          destination_end = current_pos
        } else {
          let parenthesis_depth = 0
          let escaped = false
          while (current_pos < limit) {
            if (recovery_starts?.has(current_pos)) {
              return -1
            }
            const char = text[current_pos]
            if (escaped) {
              if (isSpaceOrTab(char)) {
                return -1
              }
              escaped = false
            } else if (char == '\\') {
              escaped = true
            } else if (isSpaceOrTab(char)) {
              if (parenthesis_depth != 0) {
                return -1
              }
              break
            } else if (char == '<' || char == '>') {
              return -1
            } else if (char == '(') {
              parenthesis_depth++
            } else if (char == ')') {
              if (parenthesis_depth == 0) {
                if (closing_char == ')') {
                  break
                }
                return -1
              }
              parenthesis_depth--
            }
            current_pos++
          }
          if (parenthesis_depth != 0 || (!allow_empty && current_pos == start)) {
            return -1
          }
          destination_end = current_pos
        }
        while (current_pos < limit && isSpaceOrTab(text[current_pos])) {
          current_pos++
        }
        if (closing_char ? text[current_pos] == closing_char : current_pos == limit) {
          return current_pos
        }

        // an optional title must be separated from the destination by whitespace
        if (current_pos == destination_end) {
          return -1
        }
        const title_open = text[current_pos]
        let title_close
        if (title_open == '"' || title_open == "'") {
          title_close = title_open
        } else if (title_open == '(') {
          title_close = ')'
        } else {
          return -1
        }
        current_pos++
        let found_title_end = false
        let escaped = false
        while (current_pos < limit) {
          if (recovery_starts?.has(current_pos)) {
            return -1
          }
          const char = text[current_pos]
          if (escaped) {
            escaped = false
          } else if (char == '\\') {
            escaped = true
          } else if (title_open == '(' && char == '(') {
            return -1
          } else if (char == title_close) {
            found_title_end = true
            current_pos++
            break
          }
          current_pos++
        }
        if (!found_title_end) {
          return -1
        }
        while (current_pos < limit && isSpaceOrTab(text[current_pos])) {
          current_pos++
        }
        if (closing_char ? text[current_pos] == closing_char : current_pos == limit) {
          return current_pos
        }
        return -1
      }

      function parseLineContainer(text, start, end) {
        let current_pos = start
        let quote_depth = 0

        // blockquote markers are part of the fence's container
        while (current_pos < end) {
          let marker_pos = current_pos
          let spaces = 0
          while (spaces < 3 && text[marker_pos] == ' ') {
            marker_pos++
            spaces++
          }
          if (text[marker_pos] != '>') {
            break
          }
          quote_depth++
          current_pos = marker_pos + 1
          if (isSpaceOrTab(text[current_pos])) {
            current_pos++
          }
        }
        const content_start = current_pos
        let indent = 0
        while (isSpaceOrTab(text[current_pos])) {
          indent = text[current_pos] == '\t' ? indent + 4 - (indent % 4) : indent + 1
          current_pos++
        }
        let has_list_marker = false
        let list_indent = 0
        const list_indents = []
        let marker_column = indent
        while (current_pos < end) {
          const marker_start = current_pos
          let marker_end = marker_start
          if (/[-+*]/.test(text[marker_end] ?? '')) {
            marker_end++
          } else if (/\d/.test(text[marker_end] ?? '')) {
            while (marker_end < end && /\d/.test(text[marker_end]) && marker_end - marker_start < 9) {
              marker_end++
            }
            if (text[marker_end] != '.' && text[marker_end] != ')') {
              marker_end = marker_start
            } else {
              marker_end++
            }
          }
          if (marker_end == marker_start) {
            break
          }
          if (marker_end == end) {
            has_list_marker = true
            marker_column += marker_end - marker_start
            list_indent = marker_column + 1
            list_indents.push(list_indent)
            current_pos = marker_end
            break
          }
          if (!isSpaceOrTab(text[marker_end])) {
            break
          }
          has_list_marker = true
          marker_column += marker_end - marker_start
          while (isSpaceOrTab(text[marker_end])) {
            marker_column = text[marker_end] == '\t' ? marker_column + 4 - (marker_column % 4) : marker_column + 1
            marker_end++
          }
          current_pos = marker_end
          list_indent = marker_column
          list_indents.push(list_indent)
        }
        return {
          quote_depth: quote_depth,
          has_list_marker: has_list_marker,
          indent: indent,
          list_indent: list_indent,
          list_indents: list_indents,
          in_list: has_list_marker,
          content_position: current_pos,
          is_blank: text.substring(content_start, end).trim() == ''
        }
      }

      function parseFenceLine(text, start, end, container = null) {
        const line_container = container ?? parseLineContainer(text, start, end)
        let current_pos = line_container.content_position
        const fence_char = text[current_pos]
        if (fence_char != '\`' && fence_char != '~') {
          return null
        }
        const fence_start = current_pos
        while (text[current_pos] == fence_char) {
          current_pos++
        }
        const fence_length = current_pos - fence_start
        if (fence_length < 3) {
          return null
        }
        const remainder = text.substring(current_pos, end)
        const is_closing = /^[ \t]*$/.test(remainder)
        if (!is_closing && fence_char == '\`' && remainder.includes('\`')) {
          return null
        }
        return {
          start: start,
          quote_depth: line_container.quote_depth,
          has_list_marker: line_container.has_list_marker,
          indent: line_container.indent,
          list_indent: line_container.list_indent,
          in_list: line_container.in_list,
          fence_char: fence_char,
          fence_length: fence_length,
          is_closing: is_closing
        }
      }

      function canOpenFence(candidate) {
        return candidate.indent <= 3 || (candidate.in_list && candidate.inherited_list)
      }

      function fenceContainerEnded(opening, container) {
        if (container.quote_depth < opening.quote_depth) {
          return true
        }
        if (container.is_blank) {
          return false
        }
        return opening.in_list && container.quote_depth == opening.quote_depth && container.indent < opening.list_indent
      }

      function fenceCloses(opening, candidate) {
        if (
          !candidate.is_closing ||
          candidate.fence_char != opening.fence_char ||
          candidate.fence_length < opening.fence_length ||
          candidate.quote_depth != opening.quote_depth
        ) {
          return false
        }
        if (!opening.in_list) {
          return !candidate.has_list_marker && candidate.indent <= 3
        }
        return (
          !candidate.has_list_marker && candidate.indent >= opening.list_indent && candidate.indent <= opening.list_indent + 3
        )
      }

      function protectFencedCode(text, placeholders) {
        let result = ''
        let last_pos = 0
        let opening = null
        let active_lists = []
        let line_start = 0
        while (line_start <= text.length) {
          const newline_pos = text.indexOf('\n', line_start)
          const line_end = newline_pos == -1 ? text.length : newline_pos
          const content_end = line_end > line_start && text[line_end - 1] == '\r' ? line_end - 1 : line_end
          const container = parseLineContainer(text, line_start, content_end)
          const candidate = parseFenceLine(text, line_start, content_end, container)

          // carry list indentation onto continuation lines and nested list items
          let line_lists = []
          let inherited_list = false
          if (container.is_blank && (active_lists.length == 0 || active_lists[0].quote_depth == container.quote_depth)) {
            line_lists = active_lists
            inherited_list = line_lists.length > 0
          } else {
            line_lists = active_lists.filter((item) => {
              return item.quote_depth == container.quote_depth && item.indent <= container.indent
            })
            inherited_list = line_lists.length > 0
            if (container.indent <= 3 || inherited_list) {
              for (const indent of container.list_indents) {
                line_lists.push({
                  quote_depth: container.quote_depth,
                  indent: indent
                })
              }
            }
          }
          if (candidate && line_lists.length > 0) {
            const line_list = line_lists[line_lists.length - 1]
            candidate.in_list = true
            candidate.inherited_list = inherited_list
            candidate.list_indent = line_list.indent
            candidate.list_contexts = line_lists.slice()
          }
          if (opening && fenceContainerEnded(opening, container)) {
            let block_end = line_start - 1
            if (block_end > opening.start && text[block_end - 1] == '\r') {
              block_end--
            }
            result += text.substring(last_pos, opening.start)
            result += placeholders.add('code_block', text.substring(opening.start, block_end))
            last_pos = block_end
            opening = null
          }
          if (!opening && candidate && canOpenFence(candidate)) {
            opening = candidate
          } else if (opening && candidate && fenceCloses(opening, candidate)) {
            result += text.substring(last_pos, opening.start)
            result += placeholders.add('code_block', text.substring(opening.start, line_end))
            last_pos = line_end
            opening = null
          }
          // code contents are opaque, so keep their opening list context unchanged
          if (opening?.in_list) {
            active_lists = opening.list_contexts
          } else {
            active_lists = line_lists
          }
          if (newline_pos == -1) {
            break
          }
          line_start = newline_pos + 1
        }
        if (opening) {
          result += text.substring(last_pos, opening.start)
          result += placeholders.add('code_block', text.substring(opening.start))
          last_pos = text.length
        }
        return result + text.substring(last_pos)
      }

      function protectReferenceDefinitions(text, placeholders) {
        const reference_start_regex = /^[ \t]{0,3}\[[^\]\r\n]+\]:[ \t]*/gm
        let result = ''
        let last_pos = 0
        let match
        while ((match = reference_start_regex.exec(text)) != null) {
          const target_start = reference_start_regex.lastIndex
          const target_limit = lineEnd(text, target_start)
          const target_end = findMarkdownTargetEnd(text, target_start, target_limit, null, false)
          if (target_end != target_limit) {
            continue
          }
          result += text.substring(last_pos, match.index)
          result += placeholders.add('reference', text.substring(match.index, target_limit))
          last_pos = target_limit
          reference_start_regex.lastIndex = target_limit
        }
        return result + text.substring(last_pos)
      }

      function protectCodeSpans(text, placeholders) {
        const runs = []
        let current_pos = 0
        while ((current_pos = text.indexOf('\`', current_pos)) != -1) {
          const run_start = current_pos
          while (text[current_pos] == '\`') {
            current_pos++
          }
          runs.push({
            start: run_start,
            end: current_pos,
            length: current_pos - run_start,
            escaped: isEscaped(text, run_start)
          })
        }
        const next_run = []
        const next_by_length = new Map()
        for (let i = runs.length - 1; i >= 0; i--) {
          next_run[i] = next_by_length.get(runs[i].length) ?? -1
          next_by_length.set(runs[i].length, i)
        }
        let result = ''
        let last_pos = 0
        let run_index = 0
        while (run_index < runs.length) {
          if (runs[run_index].escaped) {
            run_index++
            continue
          }
          const closing_index = next_run[run_index]
          if (closing_index == -1) {
            run_index++
            continue
          }
          const opening = runs[run_index]
          const closing = runs[closing_index]
          result += text.substring(last_pos, opening.start)
          result += placeholders.add('code_inline', text.substring(opening.start, closing.end))
          last_pos = closing.end
          run_index = closing_index + 1
        }
        return result + text.substring(last_pos)
      }

      function findInlineLinkCandidates(text) {
        const candidates = new Map()
        const starts = new Set()
        let current_pos = 0
        const brackets = []
        while (current_pos < text.length) {
          const char = text[current_pos]
          if (char == '\r' || char == '\n') {
            brackets.length = 0
            current_pos++
            continue
          }
          if (char == '[' && !isEscaped(text, current_pos)) {
            brackets.push(current_pos)
            current_pos++
            continue
          }
          if (char != ']' || isEscaped(text, current_pos) || brackets.length == 0) {
            current_pos++
            continue
          }
          const label_start = brackets.pop()
          if (text[current_pos + 1] == '(') {
            candidates.set(current_pos, label_start)
            starts.add(label_start)
          }
          current_pos++
        }
        return {
          candidates: candidates,
          starts: starts
        }
      }

      function protectInlineLinkTargets(text, placeholders) {
        let result = ''
        let last_pos = 0
        let minimum_label_start = 0
        let failed_label_start = -1
        let retried_containing_label = false
        let recovering = false
        const links = findInlineLinkCandidates(text)
        for (const [label_end, label_start] of links.candidates) {
          if (label_start < last_pos) {
            continue
          }
          if (label_start < minimum_label_start) {
            // retry one containing label, then skip further overlaps to keep this linear
            if (retried_containing_label || label_start >= failed_label_start) {
              continue
            }
            retried_containing_label = true
          }
          const target_start = label_end + 2
          const target_limit = lineEnd(text, target_start)
          const recovery_starts = recovering ? links.starts : null
          const target_end = findMarkdownTargetEnd(text, target_start, target_limit, ')', true, recovery_starts)
          if (target_end == -1) {
            // later candidates whose labels overlap this target cannot be separate links
            minimum_label_start = Math.max(minimum_label_start, target_start)
            failed_label_start = label_start
            recovering = true
            continue
          }
          result += text.substring(last_pos, label_end + 1)
          result += placeholders.add('link_target', text.substring(label_end + 1, target_end + 1))
          last_pos = target_end + 1
          minimum_label_start = last_pos
          failed_label_start = -1
          retried_containing_label = false
          recovering = false
        }
        return result + text.substring(last_pos)
      }

      function markInlineLinks(text, placeholders, text_open, url_open, span_close) {
        let result = ''
        let last_pos = 0
        let current_pos = 0
        const brackets = []
        while (current_pos < text.length) {
          const char = text[current_pos]
          if (char == '\r' || char == '\n') {
            brackets.length = 0
            current_pos++
            continue
          }
          if (char == '[' && !isEscaped(text, current_pos)) {
            brackets.push(current_pos)
            current_pos++
            continue
          }
          if (char != ']' || isEscaped(text, current_pos) || brackets.length == 0) {
            current_pos++
            continue
          }
          const label_start = brackets.pop()
          const target = placeholders.tokenAt(text, current_pos + 1, 'link_target')
          if (!target) {
            current_pos++
            continue
          }
          result += text.substring(last_pos, label_start)
          result += text_open + text.substring(label_start, current_pos + 1) + span_close
          result += url_open + text.substring(current_pos + 1, target.end) + span_close
          last_pos = target.end
          current_pos = target.end
          brackets.length = 0
        }
        return result + text.substring(last_pos)
      }

      function findHTMLTagEnd(text, start) {
        if (text.startsWith('<!--', start)) {
          const comment_end = text.indexOf('-->', start + 4)
          return comment_end == -1 ? -1 : comment_end + 2
        }
        if (text.startsWith('<![CDATA[', start)) {
          const cdata_end = text.indexOf(']]>', start + 9)
          return cdata_end == -1 ? -1 : cdata_end + 2
        }
        if (text.startsWith('<?', start)) {
          const instruction_end = text.indexOf('?>', start + 2)
          return instruction_end == -1 ? -1 : instruction_end + 1
        }
        if (text.startsWith('<!', start)) {
          return text.indexOf('>', start + 2)
        }
        let current_pos = start + 1
        if (text[current_pos] == '/') {
          current_pos++
        }
        if (!/[A-Za-z]/.test(text[current_pos] ?? '')) {
          return -1
        }
        while (/[A-Za-z0-9:-]/.test(text[current_pos] ?? '')) {
          current_pos++
        }
        if (!isSpaceOrTab(text[current_pos]) && text[current_pos] != '/' && text[current_pos] != '>') {
          return -1
        }
        let quote = null
        while (current_pos < text.length) {
          const char = text[current_pos]
          if (char == '\r' || char == '\n') {
            return -1
          }
          if (quote) {
            if (char == quote) {
              quote = null
            }
          } else if (char == '"' || char == "'") {
            quote = char
          } else if (char == '<') {
            return -1
          } else if (char == '>') {
            return current_pos
          }
          current_pos++
        }
        return -1
      }

      function protectHTMLTags(text, placeholders) {
        let result = ''
        let last_pos = 0
        let current_pos = 0
        while ((current_pos = text.indexOf('<', current_pos)) != -1) {
          if (isEscaped(text, current_pos)) {
            current_pos++
            continue
          }
          const tag_end = findHTMLTagEnd(text, current_pos)
          if (tag_end == -1) {
            if (text.startsWith('<!', current_pos) || text.startsWith('<?', current_pos)) {
              result += text.substring(last_pos, current_pos)
              result += placeholders.add('html_tag', text.substring(current_pos))
              last_pos = text.length
              break
            }
            current_pos++
            continue
          }
          result += text.substring(last_pos, current_pos)
          result += placeholders.add('html_tag', text.substring(current_pos, tag_end + 1))
          last_pos = tag_end + 1
          current_pos = tag_end + 1
        }
        return result + text.substring(last_pos)
      }

      function protectURLs(text, placeholders) {
        const url_regex = /\bhttps?:\/\/[^\s<()]+(?:\([^\s<()]*\)[^\s<()]*)*/g
        return text.replace(url_regex, (match) => {
          let url = match
          let suffix = ''
          function trimSuffix(length) {
            suffix = url.substring(url.length - length) + suffix
            url = url.substring(0, url.length - length)
          }
          const trailing = url.match(/[*_.,!?;:]+$/)
          if (trailing) {
            trimSuffix(trailing[0].length)
          }
          return placeholders.add('url', url) + suffix
        })
      }

      function protectAutolinks(text, placeholders) {
        const autolink_regex = /<(?:https?:\/\/[^<>\s]+|[A-Za-z0-9.!#$%&'*+/=?^_\`{|}~-]+@[A-Za-z0-9.-]+)>/g
        return text.replace(autolink_regex, (match) => placeholders.add('url', match))
      }

      function markDelimited(text, delimiter, open_marker, close_marker, can_open, can_close) {
        let result = ''
        let last_pos = 0
        let opening_pos = -1
        let current_pos = 0
        let previous_pos = 0
        while ((current_pos = text.indexOf(delimiter, current_pos)) != -1) {
          if (opening_pos != -1 && /[\r\n]/.test(text.substring(previous_pos, current_pos))) {
            opening_pos = -1
          }
          if (isEscaped(text, current_pos)) {
            current_pos += delimiter.length
            previous_pos = current_pos
            continue
          }
          if (opening_pos == -1) {
            if (can_open(text, current_pos)) {
              opening_pos = current_pos
            }
          } else if (can_close(text, current_pos)) {
            result += text.substring(last_pos, opening_pos)
            result += open_marker
            result += text.substring(opening_pos + delimiter.length, current_pos)
            result += close_marker
            last_pos = current_pos + delimiter.length
            opening_pos = -1
          } else if (can_open(text, current_pos)) {
            // prefer a later viable opener over an unmatched earlier delimiter
            opening_pos = current_pos
          }
          current_pos += delimiter.length
          previous_pos = current_pos
        }
        return result + text.substring(last_pos)
      }

      function isWordCharacter(char) {
        return !!char && /[\p{L}\p{N}_]/u.test(char)
      }

      function markItalics(text, open_marker, close_marker) {
        return markDelimited(
          text,
          '_',
          open_marker,
          close_marker,
          (value, position) => {
            return !isWordCharacter(value[position - 1]) && !isWhitespace(value[position + 1]) && value[position + 1] != '_'
          },
          (value, position) => {
            return !isWhitespace(value[position - 1]) && value[position - 1] != '_' && !isWordCharacter(value[position + 1])
          }
        )
      }

      function markBold(text, open_marker, close_marker) {
        return markDelimited(
          text,
          '**',
          open_marker,
          close_marker,
          (value, position) => {
            return value[position - 1] != '*' && !isWhitespace(value[position + 2]) && value[position + 2] != '*'
          },
          (value, position) => {
            return value[position - 1] != '*' && !isWhitespace(value[position - 1]) && value[position + 2] != '*'
          }
        )
      }

      function formatEditorHTML(text) {
        const quote_regex = /^ {0,3}>.*$/gm
        const header_regex = /^ {0,3}#{1,6}(?:[ \t]+.*)?$/gm
        const divider_regex = /^ {0,3}(?:-[ \t]*){3,}(?=\r?$)/gm
        const username_regex = /@([a-zA-Z0-9_@-]+(?:\.[a-zA-Z0-9_@-]+)*)/g
        let s = String(text)
        const placeholders = createPlaceholderStore(s)

        // protect atomic Markdown ranges before looking for formatting delimiters
        s = protectFencedCode(s, placeholders)
        s = protectReferenceDefinitions(s, placeholders)
        s = protectCodeSpans(s, placeholders)
        s = protectInlineLinkTargets(s, placeholders)
        s = protectAutolinks(s, placeholders)
        s = protectHTMLTags(s, placeholders)
        s = protectURLs(s, placeholders)

        // formatting markers stay as placeholders until every source regex has run
        const italic_open = placeholders.add('markup', '<span class="editor_italic">_')
        const italic_close = placeholders.add('markup', '_</span>')
        const bold_open = placeholders.add('markup', '<span class="editor_bold">**')
        const bold_close = placeholders.add('markup', '**</span>')
        const quote_open = placeholders.add('markup', '<span class="editor_quote">')
        const header_open = placeholders.add('markup', '<span class="editor_header">')
        const divider_open = placeholders.add('markup', '<span class="editor_divider">')
        const username_open = placeholders.add('markup', '<span class="editor_username">')
        const link_text_open = placeholders.add('markup', '<span class="editor_link_text">')
        const link_url_open = placeholders.add('markup', '<span class="editor_link_url">')
        const span_close = placeholders.add('markup', '</span>')
        s = markItalics(s, italic_open, italic_close)
        s = markBold(s, bold_open, bold_close)
        s = s.replace(quote_regex, (match) => quote_open + match + span_close)
        s = s.replace(header_regex, (match) => header_open + match + span_close)
        s = s.replace(divider_regex, (match) => divider_open + match + span_close)
        s = s.replace(username_regex, (match) => username_open + match + span_close)
        s = markInlineLinks(s, placeholders, link_text_open, link_url_open, span_close)

        // escape all remaining source once, then restore trusted markup and escaped atoms
        s = escapeEditorHTML(s)
        return placeholders.restore(s)
      }

      function highlightHtml(text) {
        return preserveTrailingNewline(formatEditorHTML(text))
      }

      function shouldSkipHighlighting(text) {
        return text.length > 5000;
      }

      function editorHasFocus(root) {
        var active = document.activeElement;
        return active === root || !!(root && root.contains(active));
      }

      function insertLineBreakInPlace() {
        var root = editor();
        var selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
          return false;
        }

        try {
          var range = selection.getRangeAt(0);
          range.deleteContents();
          var br = document.createElement("br");
          range.insertNode(br);
          range.setStartAfter(br);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
          root.focus();
          return true;
        }
        catch (error) {
          return false;
        }
      }

      function applyStyles(selection, options) {
        var force = options && options.force;
        if ((!force && isIgnoringInput) || isComposing || isApplyingStyles) {
          return;
        }

        var root = editor();
        var text = editorPlainText(root);
        if (shouldSkipHighlighting(text)) {
          return;
        }

        var saved = selection || currentSelection();
        var hadFocus = options && options.hadFocus != null ? !!options.hadFocus : editorHasFocus(root);
        isApplyingStyles = true;
        root.innerHTML = highlightHtml(text);
        if (hadFocus) {
          root.focus();
        }
        setSelectionRange(saved.start, saved.end);
        scheduleClampScrollOffsets();
        isApplyingStyles = false;
      }

      function sendSelectionNow() {
        postMessage("selection", currentSelection());
      }

      function scheduleSelection() {
        clearTimeout(selectionTimer);
        selectionTimer = setTimeout(sendSelectionNow, 20);
      }

      function sendChangeNow() {
        var text = editorPlainText(editor());
        lastText = text;
        postMessage("change", {
          text: text,
          selection: currentSelection()
        });
      }

      function scheduleChange() {
        clearTimeout(changeTimer);
        changeTimer = setTimeout(sendChangeNow, 60);
      }

      function replaceSelectionWithText(insertedText) {
        var root = editor();
        var hadFocus = editorHasFocus(root);
        var text = editorPlainText(root);
        var selection = currentSelection();
        var start = Math.min(selection.start, selection.end);
        var end = Math.max(selection.start, selection.end);
        var nextText = text.slice(0, start) + insertedText + text.slice(end);
        var nextPosition = start + insertedText.length;
        var insertedNewline = insertedText.indexOf("\n") > -1;

        root.textContent = nextText;
        applyStyles({
          start: nextPosition,
          end: nextPosition
        }, {
          force: true,
          hadFocus: hadFocus || insertedNewline
        });
        if (insertedNewline) {
          setTimeout(function () {
            editor().focus();
            setSelectionRange(nextPosition, nextPosition);
            scrollSelectionIntoView();
            sendSelectionNow();
          }, 0);
        }
        sendChangeNow();
        sendSelectionNow();
        scheduleClampScrollOffsets();
      }

      function setText(text, cursorToEnd) {
        var root = editor();
        var nextText = text || "";
        var selection = cursorToEnd ? {
          start: nextText.length,
          end: nextText.length
        } : currentSelection();

        root.textContent = nextText;
        applyStyles(selection, {
          force: true
        });

        if (cursorToEnd) {
          moveCursorToEnd();
        }

        lastText = nextText;
        scheduleClampScrollOffsets();
      }

      function setEditable(editable) {
        var root = editor();
        root.setAttribute("contenteditable", editable ? "true" : "false");
        if (!editable) {
          root.blur();
        }
      }

      function applyConfig(config) {
        var root = document.documentElement;
        var body = document.body;

        body.classList.toggle("dark", config.colorScheme === "dark");

        if (config.backgroundColor) {
          root.style.setProperty("--editor-background", config.backgroundColor);
        }
        if (config.textColor) {
          root.style.setProperty("--editor-text", config.textColor);
          root.style.setProperty("--editor-caret", config.textColor);
        }
        if (config.placeholderTextColor) {
          root.style.setProperty("--editor-placeholder", config.placeholderTextColor);
        }
        if (config.fontSize) {
          root.style.setProperty("--editor-font-size", Number(config.fontSize) + "px");
        }

        root.style.setProperty("--editor-padding-top", Number(config.paddingTop || 0) + "px");
        root.style.setProperty("--editor-padding-right", Number(config.paddingRight || 0) + "px");
        root.style.setProperty("--editor-padding-bottom", Number(config.paddingBottom || 0) + "px");
        root.style.setProperty("--editor-padding-left", Number(config.paddingLeft || 0) + "px");
        var bottomOverlayHeight = Number(config.bottomOverlayHeight || 0);
        root.style.setProperty("--editor-bottom-overlay", bottomOverlayHeight + "px");
        viewportHeight = Number(config.viewportHeight || 0) || null;
        root.style.setProperty("--editor-viewport-height", (viewportHeight || window.innerHeight) + "px");
        scheduleClampScrollOffsets();

        setEditable(config.editable !== false);
      }

      function updateFromReact(config) {
        config = config || {};
        var shouldFocus = !!config.focus;
        applyConfig(config);

        if (config.hasOwnProperty("value")) {
          var nextValue = config.value || "";
          if (!didApplyInitialValue || nextValue !== editorPlainText(editor())) {
            setText(nextValue, !!config.cursorToEnd);
          }
          didApplyInitialValue = true;
        }

        if (config.selection) {
          setSelectionRange(config.selection.start, config.selection.end);
        }

        if (shouldFocus && config.editable !== false) {
          setTimeout(function () {
            editor().focus();
            if (config.cursorToEnd) {
              moveCursorToEnd();
            }
          }, 0);
        }

        if (config.scrollSelectionIntoView) {
          setTimeout(scrollSelectionIntoView, 0);
        }
      }

      function handleInput(event) {
        if (isApplyingStyles) {
          return;
        }

        if (event.inputType === "insertParagraph" || event.inputType === "insertLineBreak") {
          scheduleChange();
          scheduleSelection();
          scheduleClampScrollOffsets();
          return;
        }

        var root = editor();
        var data = event.data || "";
        var shouldForce = hasTrailingMarker(root);
        var shouldApply = !data || markdownCharacters.some(function (character) {
          return data.indexOf(character) > -1;
        });

        if (shouldApply || shouldForce) {
          applyStyles(null, {
            force: shouldForce
          });
        }

        scheduleChange();
        scheduleSelection();
        scheduleClampScrollOffsets();
      }

      function setup() {
        var root = editor();

        root.addEventListener("beforeinput", function (event) {
          if (event.isComposing) {
            return;
          }

          if (event.inputType === "insertParagraph" || event.inputType === "insertLineBreak") {
            event.preventDefault();
            var isAndroid = /Android/i.test(navigator.userAgent);
            if (isAndroid) {
              var insertedNewline = false;
              try {
                insertedNewline = document.execCommand("insertLineBreak");
              }
              catch (error) {
                insertedNewline = false;
              }
              if (!insertedNewline) {
                insertLineBreakInPlace();
              }
            }
            else {
              replaceSelectionWithText("\n");
            }
            scheduleChange();
            scheduleSelection();
            scheduleClampScrollOffsets();
            return;
          }

          if (event.inputType === "insertText" && event.data && hasTrailingMarker(root)) {
            event.preventDefault();
            replaceSelectionWithText(event.data);
          }
        });

        root.addEventListener("input", handleInput);
        window.addEventListener("scroll", clampScrollOffsets);
        document.addEventListener("scroll", clampScrollOffsets);

        root.addEventListener("compositionstart", function () {
          isComposing = true;
          isIgnoringInput = true;
        });

        root.addEventListener("compositionend", function () {
          isComposing = false;
          isIgnoringInput = false;
          applyStyles();
          sendChangeNow();
          sendSelectionNow();
        });

        root.addEventListener("keydown", function (event) {
          if (/^[a-z]$/i.test(event.key)) {
            isIgnoringInput = true;
          }
        });

        root.addEventListener("keyup", function (event) {
          if (event.isComposing) {
            return;
          }

          isIgnoringInput = false;
        });

        root.addEventListener('copy', function (e) {
          const selection = window.getSelection()
          if (!e.clipboardData || !selection || selection.rangeCount == 0 || selection.isCollapsed) {
            return
          }
          const parts = []
          for (let i = 0; i < selection.rangeCount; i++) {
            const selected_range = selection.getRangeAt(i)
            if (!root.contains(selected_range.startContainer) || !root.contains(selected_range.endContainer)) {
              return
            }

            // Keep partially selected caret markers wrapped so text extraction can omit them.
            const range = selected_range.cloneRange()
            const start_node = selected_range.startContainer
            const end_node = selected_range.endContainer
            const start_element = start_node.nodeType == Node.ELEMENT_NODE ? start_node : start_node.parentElement
            const end_element = end_node.nodeType == Node.ELEMENT_NODE ? end_node : end_node.parentElement
            const start_marker = start_element?.closest(editorMarkerSelector)
            const end_marker = end_element?.closest(editorMarkerSelector)
            if (start_marker) {
              range.setStartBefore(start_marker)
            }
            if (end_marker) {
              range.setEndAfter(end_marker)
            }
            const container = document.createElement('div')
            container.appendChild(range.cloneContents())
            parts.push(editorPlainText(container))
          }
          e.clipboardData.setData('text/plain', parts.join(''))
          e.preventDefault()
        })

        root.addEventListener("paste", function (event) {
          event.preventDefault();
          var clipboard = event.clipboardData || window.clipboardData;
          var text = clipboard ? clipboard.getData("text/plain") : "";
          if (text.length > 0) {
            replaceSelectionWithText(text.replace(/\r\n/g, "\n"));
          }
        });

        document.addEventListener("selectionchange", function () {
          var selection = window.getSelection();
          if (!selection || selection.rangeCount === 0) {
            return;
          }

          var range = selection.getRangeAt(0);
          if (root.contains(range.startContainer) || range.startContainer === root) {
            scheduleSelection();
          }
        });

        postMessage("ready", {});
      }

      window.MicroBlogReactEditor = {
        updateFromReact: updateFromReact,
        setText: setText,
        getMarkdown: function () {
          return editorPlainText(editor());
        },
        focus: function () {
          editor().focus();
        },
        setSelection: setSelectionRange,
        insertText: replaceSelectionWithText,
        scrollSelectionIntoView: scrollSelectionIntoView
      };

      setup();
    })();
  </script>
</body>
</html>`

export default editorHtml
