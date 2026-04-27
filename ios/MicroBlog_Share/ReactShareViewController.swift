//
//  ReactShareViewController.swift
//  MicroBlog_Share
//

internal import Expo
import React
import ReactAppDependencyProvider
import RNShareMenu

class ReactShareViewController: ShareViewController, ReactShareViewDelegate {
  private var reactNativeDelegate: ShareReactNativeDelegate?
  private var reactNativeFactory: ExpoReactNativeFactory?

  override func viewDidLoad() {
    super.viewDidLoad()

    let delegate = ShareReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    let rootView = factory.rootViewFactory.view(
      withModuleName: "ShareMenuModuleComponent",
      initialProperties: nil,
      launchOptions: nil
    )
    rootView.backgroundColor = configuredBackgroundColor()

    view = rootView

    ShareMenuReactView.attachViewDelegate(self)
  }

  override func viewDidDisappear(_ animated: Bool) {
    cancel()
    ShareMenuReactView.detachViewDelegate()

    super.viewDidDisappear(animated)
  }

  func loadExtensionContext() -> NSExtensionContext {
    return extensionContext!
  }

  func openApp() {
    openHostApp()
  }

  func continueInApp(with items: [NSExtensionItem], and extraData: [String:Any]?) {
    handlePost(items, extraData: extraData)
  }

  private func configuredBackgroundColor() -> UIColor? {
    guard let backgroundColorConfig = Bundle.main.infoDictionary?[REACT_SHARE_VIEW_BACKGROUND_COLOR_KEY] as? [String:Any] else {
      return UIColor(red: 1, green: 1, blue: 1, alpha: 1)
    }

    if let transparent = backgroundColorConfig[COLOR_TRANSPARENT_KEY] as? Bool, transparent {
      return nil
    }

    let red = numberValue(backgroundColorConfig[COLOR_RED_KEY], fallback: 1)
    let green = numberValue(backgroundColorConfig[COLOR_GREEN_KEY], fallback: 1)
    let blue = numberValue(backgroundColorConfig[COLOR_BLUE_KEY], fallback: 1)
    let alpha = numberValue(backgroundColorConfig[COLOR_ALPHA_KEY], fallback: 1)

    return UIColor(red: red, green: green, blue: blue, alpha: alpha)
  }

  private func numberValue(_ value: Any?, fallback: CGFloat) -> CGFloat {
    guard let number = value as? NSNumber else {
      return fallback
    }

    return CGFloat(number.floatValue)
  }
}

class ShareReactNativeDelegate: ExpoReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    bridge.bundleURL ?? bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index.share")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
