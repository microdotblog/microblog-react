package blog.micro.android.theme

import android.graphics.Color
import android.os.Build

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

import java.util.Locale

class MBAndroidThemeModule(
  reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "MBAndroidTheme"

  @ReactMethod
  fun getAccentColor(colorScheme: String?, promise: Promise) {
    try {
      promise.resolve(colorToHex(resolveAccentColor(colorScheme)))
    } catch (error: Exception) {
      promise.resolve(MICRO_BLOG_ACCENT_COLOR)
    }
  }

  private fun resolveAccentColor(colorScheme: String?): Int {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      val accentResource = if (colorScheme == "dark") {
        android.R.color.system_accent1_400
      } else {
        android.R.color.system_accent1_600
      }

      return reactApplicationContext.resources.getColor(
        accentResource,
        reactApplicationContext.theme
      )
    }

    return Color.parseColor(MICRO_BLOG_ACCENT_COLOR)
  }

  private fun colorToHex(color: Int): String =
    String.format(Locale.US, "#%06X", 0xFFFFFF and color)

  companion object {
    private const val MICRO_BLOG_ACCENT_COLOR = "#ff8800"
  }
}
