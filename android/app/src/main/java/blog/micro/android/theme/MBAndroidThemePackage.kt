package blog.micro.android.theme

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class MBAndroidThemePackage : ReactPackage {
  @Deprecated("ReactPackage.createNativeModules is deprecated in React Native new architecture.")
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
    listOf(MBAndroidThemeModule(reactContext))

  override fun createViewManagers(
    reactContext: ReactApplicationContext
  ): List<ViewManager<*, *>> =
    emptyList()
}
