package blog.micro.android.text

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

@Suppress("UNCHECKED_CAST")
class MBHighlightingTextPackage : ReactPackage {
  @Deprecated("ReactPackage.createNativeModules is deprecated in React Native new architecture.")
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
    emptyList()

  override fun createViewManagers(
    reactContext: ReactApplicationContext
  ): List<ViewManager<in Nothing, in Nothing>> =
    listOf(MBHighlightingTextManager()) as List<ViewManager<in Nothing, in Nothing>>
}
