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
      word-break: break-all;
    }

    .editor_quote {
      color: var(--editor-quote);
    }

    .editor_tag {
      color: var(--editor-tag);
    }

    .editor_attr_name {
      color: var(--editor-attribute);
    }

    .editor_attr_value {
      color: var(--editor-link);
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
<body><div class="editor_shell"><div contenteditable="true" class="editor" id="editor" spellcheck="true" autocapitalize="sentences"></div><div class="editor_bottom_scrim" aria-hidden="true"></div></div>
  <script>
    (function () {
      var isIgnoringInput = false;
      var isApplyingStyles = false;
      var isComposing = false;
      var changeTimer = null;
      var selectionTimer = null;
      var viewportHeight = null;
      var touchStartY = 0;
      var lastText = "";
      var didApplyInitialValue = false;
      var editorMarkerSelector = '[data-editor-marker="caret"]';
      var markdownCharacters = [' ', '*', '_', '[', ']', '(', ')', '<', '>', '"', '\`', '#', '-', '@'];

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

      function maxEditorScroll() {
        var root = editor();
        return Math.max(0, root.scrollHeight - root.clientHeight);
      }

      function clampScrollOffsets() {
        var root = editor();
        var maxScroll = maxEditorScroll();

        if (window.scrollX !== 0 || window.scrollY !== 0) {
          window.scrollTo(0, 0);
        }

        if (document.documentElement.scrollTop !== 0) {
          document.documentElement.scrollTop = 0;
        }

        if (document.body.scrollTop !== 0) {
          document.body.scrollTop = 0;
        }

        if (root.scrollTop < 0) {
          root.scrollTop = 0;
        }
        else if (root.scrollTop > maxScroll) {
          root.scrollTop = maxScroll;
        }
      }

      function scheduleClampScrollOffsets() {
        requestAnimationFrame(clampScrollOffsets);
      }

      function shouldBlockEditorPan(deltaY) {
        var root = editor();
        var maxScroll = maxEditorScroll();

        if (maxScroll <= 0) {
          return true;
        }

        if (deltaY > 0 && root.scrollTop <= 0) {
          return true;
        }

        if (deltaY < 0 && root.scrollTop >= maxScroll) {
          return true;
        }

        return false;
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

      function escapeHtml(text) {
        return text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
      }

      function preserveTrailingNewline(html) {
        if (html.endsWith("\n")) {
          return html.slice(0, -1) + '<br><span class="editor_marker" data-editor-marker="caret" aria-hidden="true">\u200b</span>';
        }

        return html;
      }

      function highlightHtml(text) {
        var urls = [];
        var s = text.replace(/\bhttps?:\/\/[^\s<()]+(?:\([^\s<()]*\)[^\s<()]*)*/g, function (match) {
          var index = urls.length;
          urls.push(match);
          return "MICROBLOGURLPLACEHOLDER" + index + "TOKEN";
        });

        s = escapeHtml(s);
        s = s.replace(/(&lt;\/?[a-zA-Z][a-zA-Z0-9-]*)(\s|&gt;)/g, '<span class="editor_tag">$1</span>$2');
        s = s.replace(/([a-zA-Z:-]+)=(&quot;[^&]*?&quot;)/g, '<span class="editor_attr_name">$1</span>=<span class="editor_attr_value">$2</span>');
        s = s.replace(/(\`\`\`[\s\S]*?\`\`\`)/g, '<span class="editor_code_block">$1</span>');
        s = s.replace(/(^|[^\`])\`([^\`\r\n]+)\`(?!\`)/g, '$1<span class="editor_code_inline">\`$2\`</span>');
        s = s.replace(/\*\*(.*?)\*\*/g, '<span class="editor_bold">**$1**</span>');
        s = s.replace(/(^|[^\w<>])_([^_\r\n()]+)_/g, '$1<span class="editor_italic">_$2_</span>');
        s = s.replace(/\[([^\]\r\n]+)\]\(([^\)\r\n]*)\)/g, '<span class="editor_link_text">[$1]</span><span class="editor_link_url">($2)</span>');
        s = s.replace(/^&gt;(.*)/gm, '<span class="editor_quote">&gt;$1</span>');
        s = s.replace(/^(#+ .*)$/gm, '<span class="editor_header">$1</span>');
        s = s.replace(/(-{3,})/g, '<span class="editor_divider">$1</span>');
        s = s.replace(/@([a-zA-Z0-9@_]+(?:\.[a-zA-Z]+)*)/g, '<span class="editor_username">@$1</span>');
        s = s.replace(/MICROBLOGURLPLACEHOLDER(\d+)TOKEN/g, function (match, index) {
          return escapeHtml(urls[Number(index)] || match);
        });

        return preserveTrailingNewline(s);
      }

      function shouldSkipHighlighting(text) {
        return text.length > 5000;
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
        isApplyingStyles = true;
        root.innerHTML = highlightHtml(text);
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
        var text = editorPlainText(root);
        var selection = currentSelection();
        var start = Math.min(selection.start, selection.end);
        var end = Math.max(selection.start, selection.end);
        var nextText = text.slice(0, start) + insertedText + text.slice(end);
        var nextPosition = start + insertedText.length;

        root.textContent = nextText;
        applyStyles({
          start: nextPosition,
          end: nextPosition
        }, {
          force: true
        });
        if (insertedText.indexOf("\n") > -1) {
          setTimeout(function () {
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
            replaceSelectionWithText("\n");
            return;
          }

          if (event.inputType === "insertText" && event.data && hasTrailingMarker(root)) {
            event.preventDefault();
            replaceSelectionWithText(event.data);
          }
        });

        root.addEventListener("input", handleInput);
        root.addEventListener("scroll", clampScrollOffsets);
        window.addEventListener("scroll", clampScrollOffsets);
        document.addEventListener("scroll", clampScrollOffsets);

        root.addEventListener("touchstart", function (event) {
          if (event.touches.length > 0) {
            touchStartY = event.touches[0].clientY;
          }
        }, {
          passive: true
        });

        root.addEventListener("touchmove", function (event) {
          if (event.touches.length === 0) {
            return;
          }

          var deltaY = event.touches[0].clientY - touchStartY;
          if (shouldBlockEditorPan(deltaY)) {
            event.preventDefault();
            clampScrollOffsets();
          }
        }, {
          passive: false
        });

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
