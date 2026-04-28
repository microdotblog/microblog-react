package blog.micro.android.text

import android.content.Context
import android.content.res.Configuration
import android.graphics.Color
import android.graphics.Typeface
import android.os.Build
import android.text.Editable
import android.text.Spannable
import android.text.Spanned
import android.text.TextWatcher
import android.text.style.ForegroundColorSpan
import android.text.style.StyleSpan
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.views.textinput.ReactEditText

class MBHighlightingEditText(context: Context) : ReactEditText(context) {
  private var is_highlighting = false
  private var did_install_highlighting_watcher = false
  private var color_scheme: String? = null
  private var react_padding_left = paddingLeft
  private var react_padding_top = paddingTop
  private var react_padding_right = paddingRight
  private var react_padding_bottom = paddingBottom
  private var bottom_overlay_height = 0
  private var react_selection_start: Int? = null
  private var react_selection_end: Int? = null

  init {
    setTextColor(themeTextColor())
    setBackgroundColor(themeBackgroundColor())
  }

  fun installHighlightingWatcher() {
    if (did_install_highlighting_watcher) {
      return
    }

    addTextChangedListener(object : TextWatcher {
      override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) = Unit

      override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) = Unit

      override fun afterTextChanged(s: Editable?) {
        applyHighlighting()
      }
    })

    did_install_highlighting_watcher = true
    applyHighlighting()
  }

  fun setColorScheme(value: String?) {
    if (color_scheme == value) {
      return
    }

    color_scheme = value
    applyTheme()
    applyHighlighting()
  }

  fun setBottomOverlayHeight(value: Float) {
    bottom_overlay_height = PixelUtil.toPixelFromDIP(value.toDouble()).toInt()
    applyReactPadding()
  }

  fun setReactPadding(left: Int, top: Int, right: Int, bottom: Int) {
    react_padding_left = left
    react_padding_top = top
    react_padding_right = right
    react_padding_bottom = bottom
    applyReactPadding()
  }

  fun applyTheme() {
    setTextColor(themeTextColor())
    setBackgroundColor(themeBackgroundColor())
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      importantForAutofill = IMPORTANT_FOR_AUTOFILL_NO
    }
  }

  fun applyHighlighting() {
    val editable = text ?: return
    if (is_highlighting) {
      return
    }

    is_highlighting = true
    try {
      clearHighlightingSpans(editable)
      processBold(editable)
      processItalic(editable)
      processBlockquote(editable)
      processLinks(editable)
      processUsernames(editable)
      processHeaders(editable)
      processTags(editable)
    } finally {
      is_highlighting = false
    }
  }

  fun setSelectionFromReact(start: Int, end: Int) {
    react_selection_start = start
    react_selection_end = end
    applySelectionFromReact()
  }

  fun applySelectionFromReact(): Boolean {
    val start = react_selection_start ?: return false
    val end = react_selection_end ?: start
    val text_length = text?.length ?: 0
    val clamped_start = start.coerceIn(0, text_length)
    val clamped_end = end.coerceIn(0, text_length)
    val real_start = minOf(clamped_start, clamped_end)
    val real_end = maxOf(clamped_start, clamped_end)

    if (selectionStart != real_start || selectionEnd != real_end) {
      setSelection(real_start, real_end)
    }

    return true
  }

  private fun applyReactPadding() {
    super.setPadding(
      react_padding_left,
      react_padding_top,
      react_padding_right,
      react_padding_bottom + bottom_overlay_height
    )
  }

  private fun clearHighlightingSpans(editable: Editable) {
    editable.getSpans(0, editable.length, MBHighlightSpan::class.java).forEach {
      editable.removeSpan(it)
    }
  }

  private fun processBold(editable: Editable) {
    val string = editable.toString()
    var current_start = 0
    var is_bold = false

    for (i in string.indices) {
      val c = string[i]
      val next_c = string.getOrNull(i + 1)

      if (c == '*' && next_c == '*') {
        if (!is_bold) {
          is_bold = true
          current_start = i
        } else {
          is_bold = false
          editable.safeSetSpan(MBStyleSpan(Typeface.BOLD), current_start, i + 2)
        }
      }
    }

    if (is_bold) {
      editable.safeSetSpan(MBStyleSpan(Typeface.BOLD), current_start, string.length)
    }
  }

  private fun processItalic(editable: Editable) {
    val string = editable.toString()
    var current_start = 0
    var is_italic = false
    var is_link = false
    var is_username = false

    for (i in string.indices) {
      val c = string[i]
      val next_c = string.getOrNull(i + 1)
      val prev_c = if (i - 1 > 0) string[i - 1] else null

      when {
        c == '_' -> {
          if (!is_link && !is_username) {
            if (!is_italic) {
              if (prev_c == ' ' || prev_c == null) {
                is_italic = true
                current_start = i
              }
            } else {
              is_italic = false
              editable.safeSetSpan(MBStyleSpan(Typeface.ITALIC), current_start, i + 1)
            }
          }
        }
        c == '[' -> {
          if (!is_link) {
            is_link = true
          }
        }
        c == ')' -> {
          if (is_link) {
            is_link = false
          }
        }
        c == '@' && next_c?.isValidUsernameChar() == true -> {
          if (!is_username) {
            is_username = true
          }
        }
        !c.isValidUsernameChar() -> {
          if (is_username) {
            is_username = false
          }
        }
      }
    }

    if (is_italic) {
      editable.safeSetSpan(MBStyleSpan(Typeface.ITALIC), current_start, string.length)
    }
  }

  private fun processBlockquote(editable: Editable) {
    val string = editable.toString()
    var current_start = 0
    var is_blockquote = false

    for (i in string.indices) {
      val c = string[i]
      val next_c = string.getOrNull(i + 1)

      when {
        i == 0 && c == '>' -> {
          if (!is_blockquote) {
            is_blockquote = true
            current_start = i
          }
        }
        c == '\n' && next_c == '>' -> {
          if (!is_blockquote) {
            is_blockquote = true
            current_start = i + 1
          }
        }
        c == '\n' && next_c == '\n' -> {
          if (is_blockquote) {
            is_blockquote = false
            editable.safeSetSpan(MBForegroundColorSpan(BLOCKQUOTE_COLOR), current_start, i)
          }
        }
      }
    }

    if (is_blockquote) {
      editable.safeSetSpan(MBForegroundColorSpan(BLOCKQUOTE_COLOR), current_start, string.length)
    }
  }

  private fun processLinks(editable: Editable) {
    val string = editable.toString()
    var current_start = 0
    var is_title = false
    var is_url = false
    var is_inbetween = false

    for (i in string.indices) {
      val c = string[i]
      val next_c = string.getOrNull(i + 1)

      when (c) {
        '[' -> {
          if (!is_title) {
            is_title = true
            current_start = i
          }
        }
        ']' -> {
          if (is_title) {
            is_title = false
            editable.safeSetSpan(MBForegroundColorSpan(LINK_TITLE_COLOR), current_start, i + 1)

            if (next_c == '(') {
              is_inbetween = true
            }
          }
        }
        '(' -> {
          if (is_inbetween && !is_url) {
            is_url = true
            current_start = i
          }

          is_inbetween = false
        }
        ')' -> {
          if (is_url) {
            is_url = false
            editable.safeSetSpan(MBForegroundColorSpan(LINK_URL_COLOR), current_start, i + 1)
          }
        }
      }
    }

    when {
      is_title -> editable.safeSetSpan(MBForegroundColorSpan(LINK_TITLE_COLOR), current_start, string.length)
      is_url -> editable.safeSetSpan(MBForegroundColorSpan(LINK_URL_COLOR), current_start, string.length)
    }
  }

  private fun processUsernames(editable: Editable) {
    val string = editable.toString()
    var current_start = 0
    var is_username = false

    for (i in string.indices) {
      val c = string[i]
      val next_c = string.getOrNull(i + 1)

      if (c == '@' && next_c?.isValidUsernameChar() == true) {
        if (!is_username) {
          is_username = true
          current_start = i
        }
      } else if (!c.isValidUsernameChar()) {
        if (is_username) {
          is_username = false
          editable.safeSetSpan(MBForegroundColorSpan(USERNAME_COLOR), current_start, i)
        }
      }
    }

    if (is_username) {
      editable.safeSetSpan(MBForegroundColorSpan(USERNAME_COLOR), current_start, string.length)
    }
  }

  private fun processHeaders(editable: Editable) {
    val string = editable.toString()
    var current_start = 0
    var is_header = false

    for (i in string.indices) {
      val c = string[i]
      val next_c = string.getOrNull(i + 1)

      when {
        c == '\n' && next_c == '#' -> {
          if (!is_header) {
            is_header = true
            current_start = i + 1
          }
        }
        i == 0 && c == '#' -> {
          if (!is_header) {
            is_header = true
            current_start = i
          }
        }
        c == '\n' -> {
          if (is_header) {
            is_header = false
            editable.safeSetSpan(MBStyleSpan(Typeface.BOLD), current_start, i)
            editable.safeSetSpan(MBForegroundColorSpan(themeTextColor()), current_start, i)
          }
        }
      }
    }

    if (is_header) {
      editable.safeSetSpan(MBStyleSpan(Typeface.BOLD), current_start, string.length)
      editable.safeSetSpan(MBForegroundColorSpan(themeTextColor()), current_start, string.length)
    }
  }

  private fun processTags(editable: Editable) {
    val string = editable.toString()
    var current_start = 0
    var is_tag = false
    var is_attr = false
    var is_value = false
    var is_quote = false
    var tag_start = 0
    var attr_start = 0
    var value_start = 0

    for (i in string.indices) {
      val c = string[i]
      val next_c = string.getOrNull(i + 1)

      when {
        c == '<' -> {
          if (!is_tag) {
            is_tag = true
            is_attr = false
            is_value = false
            attr_start = 0
            value_start = 0
            tag_start = i
            current_start = i
          }
        }
        c == '"' -> is_quote = !is_quote
        c == ' ' && !is_quote -> {
          if (is_tag) {
            is_tag = false
            is_attr = true
            is_value = false
            editable.safeSetSpan(MBForegroundColorSpan(tagColor()), current_start, i)
            attr_start = i + 1
          } else if (is_value) {
            is_tag = false
            is_attr = true
            is_value = false
            editable.safeSetSpan(MBForegroundColorSpan(LINK_TITLE_COLOR), value_start, i)
            attr_start = i + 1
          }
        }
        c == '=' -> {
          if (is_attr) {
            is_attr = false
            is_value = true
            editable.safeSetSpan(MBForegroundColorSpan(LINK_URL_COLOR), attr_start, i)
            value_start = i + 1
          }
        }
        c == '/' && next_c == '>' -> {
          is_tag = true
          is_attr = false
          is_value = false
          tag_start = i
        }
        c == '>' -> {
          if (is_value) {
            is_tag = false
            is_attr = true
            is_value = false
            editable.safeSetSpan(MBForegroundColorSpan(LINK_TITLE_COLOR), value_start, i)
            attr_start = i + 1
          } else if (is_tag) {
            is_tag = false
            editable.safeSetSpan(MBForegroundColorSpan(tagColor()), tag_start, i + 1)
          }
        }
      }
    }

    if (is_tag) {
      editable.safeSetSpan(MBForegroundColorSpan(tagColor()), current_start, string.length)
    }
  }

  private fun isDarkMode(): Boolean {
    if (color_scheme == "dark") {
      return true
    }

    if (color_scheme == "light") {
      return false
    }

    return (resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES
  }

  private fun themeTextColor(): Int = if (isDarkMode()) Color.WHITE else Color.BLACK

  private fun themeBackgroundColor(): Int = if (isDarkMode()) DARK_BACKGROUND_COLOR else Color.WHITE

  private fun tagColor(): Int = if (isDarkMode()) TAG_DARK_COLOR else TAG_LIGHT_COLOR

  private fun Char.isValidUsernameChar(): Boolean =
    (this in 'a'..'z') || (this in 'A'..'Z') || (this in '0'..'9') || this == '_'

  private fun Spannable.safeSetSpan(span: Any, start: Int, end: Int) {
    if (start >= 0 && end > start && end <= length) {
      setSpan(span, start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
    }
  }

  companion object {
    private val DARK_BACKGROUND_COLOR = Color.rgb(31, 41, 55)
    private val BLOCKQUOTE_COLOR = Color.rgb(0, 153, 1)
    private val LINK_TITLE_COLOR = Color.rgb(51, 122, 183)
    private val LINK_URL_COLOR = Color.rgb(128, 128, 128)
    private val USERNAME_COLOR = Color.rgb(128, 128, 128)
    private val TAG_LIGHT_COLOR = Color.rgb(150, 38, 138)
    private val TAG_DARK_COLOR = Color.rgb(227, 171, 237)
  }
}

private interface MBHighlightSpan

private class MBForegroundColorSpan(color: Int) : ForegroundColorSpan(color), MBHighlightSpan

private class MBStyleSpan(style: Int) : StyleSpan(style), MBHighlightSpan
