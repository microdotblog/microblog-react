package blog.micro.android.text

import android.text.SpannableStringBuilder
import android.text.InputType
import android.view.Gravity
import android.view.ViewGroup
import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.views.text.ReactTextUpdate
import com.facebook.react.views.textinput.ReactEditText
import com.facebook.react.views.textinput.ReactTextInputManager
import kotlin.math.max
import kotlin.math.min

@ReactModule(name = MBHighlightingTextManager.REACT_CLASS)
class MBHighlightingTextManager : ReactTextInputManager() {
  override fun getName(): String = REACT_CLASS

  override fun createViewInstance(context: ThemedReactContext): ReactEditText {
    val editText = MBHighlightingEditText(context)
    val inputType = editText.inputType
    editText.inputType = inputType and InputType.TYPE_TEXT_FLAG_MULTI_LINE.inv()
    editText.gravity = Gravity.TOP or Gravity.START
    editText.returnKeyType = "done"
    editText.layoutParams =
      ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.WRAP_CONTENT,
        ViewGroup.LayoutParams.WRAP_CONTENT,
      )
    editText.applyTheme()
    return editText
  }

  override fun addEventEmitters(reactContext: ThemedReactContext, editText: ReactEditText) {
    super.addEventEmitters(reactContext, editText)
    (editText as? MBHighlightingEditText)?.installHighlightingWatcher()
  }

  @ReactProp(name = "value")
  fun setValue(view: ReactEditText, value: String?) {
    val highlightingView = view as? MBHighlightingEditText ?: return
    val nextText = value ?: ""

    if (highlightingView.text?.toString() != nextText) {
      val selectionStart = highlightingView.selectionStart
      val selectionEnd = highlightingView.selectionEnd
      highlightingView.maybeSetTextFromJS(
        ReactTextUpdate(
          SpannableStringBuilder(nextText),
          Int.MAX_VALUE,
          false,
          Gravity.NO_GRAVITY,
          highlightingView.breakStrategy,
          if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            highlightingView.justificationMode
          } else {
            0
          },
        )
      )
      if (!highlightingView.applySelectionFromReact()) {
        setClampedSelection(highlightingView, selectionStart, selectionEnd)
      }
    }

    highlightingView.applyHighlighting()
  }

  @ReactProp(name = "defaultValue")
  fun setDefaultValue(view: ReactEditText, value: String?) {
    if (view.text.isNullOrEmpty()) {
      setValue(view, value)
    }
  }

  @ReactProp(name = "selection")
  fun setSelection(view: ReactEditText, selection: Dynamic?) {
    val range = selection?.selectionRange() ?: return
    val highlightingView = view as? MBHighlightingEditText
    if (highlightingView != null) {
      highlightingView.setSelectionFromReact(range.first, range.second)
    } else {
      setClampedSelection(view, range.first, range.second)
    }
  }

  @ReactProp(name = "colorScheme")
  fun setColorScheme(view: ReactEditText, colorScheme: String?) {
    (view as? MBHighlightingEditText)?.setColorScheme(colorScheme)
  }

  @ReactProp(name = "bottomOverlayHeight", defaultFloat = 0f)
  fun setBottomOverlayHeight(view: ReactEditText, bottomOverlayHeight: Float) {
    (view as? MBHighlightingEditText)?.setBottomOverlayHeight(bottomOverlayHeight)
  }

  @ReactProp(name = "scrollEnabled", defaultBoolean = true)
  fun setScrollEnabled(view: ReactEditText, scrollEnabled: Boolean) {
    view.isVerticalScrollBarEnabled = scrollEnabled
  }

  @ReactProp(name = "clearButtonMode")
  fun setClearButtonMode(view: ReactEditText, value: String?) = Unit

  @ReactProp(name = "enablesReturnKeyAutomatically", defaultBoolean = false)
  fun setEnablesReturnKeyAutomatically(view: ReactEditText, value: Boolean) = Unit

  @ReactProp(name = "inputAccessoryViewID")
  fun setInputAccessoryViewID(view: ReactEditText, value: String?) = Unit

  override fun setPadding(view: ReactEditText, left: Int, top: Int, right: Int, bottom: Int) {
    val highlightingView = view as? MBHighlightingEditText
    if (highlightingView != null) {
      highlightingView.setReactPadding(left, top, right, bottom)
    } else {
      super.setPadding(view, left, top, right, bottom)
    }
  }

  private fun setClampedSelection(view: ReactEditText, start: Int, end: Int) {
    val textLength = view.text?.length ?: 0
    val clampedStart = start.coerceIn(0, textLength)
    val clampedEnd = end.coerceIn(0, textLength)

    if (view.selectionStart != clampedStart || view.selectionEnd != clampedEnd) {
      view.setSelection(min(clampedStart, clampedEnd), max(clampedStart, clampedEnd))
    }
  }

  private fun Dynamic.selectionRange(): Pair<Int, Int>? {
    return when (type) {
      ReadableType.Map -> asMap()?.selectionRange()
      ReadableType.String -> asString().selectionRange()
      else -> null
    }
  }

  private fun ReadableMap.selectionRange(): Pair<Int, Int>? {
    if (!hasKey("start")) {
      return null
    }

    val start = getInt("start")
    val end = if (hasKey("end") && !isNull("end")) getInt("end") else start
    return start to end
  }

  private fun String?.selectionRange(): Pair<Int, Int>? {
    if (isNullOrBlank()) {
      return 0 to 0
    }

    val pieces = trim().split(Regex("\\s+"))
    val start = pieces.getOrNull(0)?.toIntOrNull() ?: return null
    val end = pieces.getOrNull(1)?.toIntOrNull() ?: start
    return start to end
  }

  companion object {
    const val REACT_CLASS = "MBHighlightingTextView"
  }
}
