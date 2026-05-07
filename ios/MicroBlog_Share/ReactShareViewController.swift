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
  private weak var reactRootView: UIView?
  private var appliedColorScheme: String?

  override func viewDidLoad() {
    super.viewDidLoad()

    let delegate = ShareReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    let colorScheme = currentColorScheme()
    let rootView = factory.rootViewFactory.view(
      withModuleName: "ShareMenuModuleComponent",
      initialProperties: ["colorScheme": colorScheme],
      launchOptions: nil
    )
    rootView.backgroundColor = configuredBackgroundColor(for: colorScheme)
    rootView.overrideUserInterfaceStyle = interfaceStyle(for: colorScheme)

    reactRootView = rootView
    view = rootView
    syncColorScheme()

    ShareMenuReactView.attachViewDelegate(self)
  }

  override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    syncColorScheme()
  }

  override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    syncColorScheme()
  }

  override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
    super.traitCollectionDidChange(previousTraitCollection)

    if previousTraitCollection?.userInterfaceStyle != traitCollection.userInterfaceStyle {
      syncColorScheme()
    }
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

  private func configuredBackgroundColor(for colorScheme: String) -> UIColor? {
    guard let backgroundColorConfig = Bundle.main.infoDictionary?[REACT_SHARE_VIEW_BACKGROUND_COLOR_KEY] as? [String:Any] else {
      return defaultBackgroundColor(for: colorScheme)
    }

    if let transparent = backgroundColorConfig[COLOR_TRANSPARENT_KEY] as? Bool, transparent {
      return nil
    }

    let red = numberValue(backgroundColorConfig[COLOR_RED_KEY], fallback: 1)
    let green = numberValue(backgroundColorConfig[COLOR_GREEN_KEY], fallback: 1)
    let blue = numberValue(backgroundColorConfig[COLOR_BLUE_KEY], fallback: 1)
    let alpha = numberValue(backgroundColorConfig[COLOR_ALPHA_KEY], fallback: 1)

    if red == 1 && green == 1 && blue == 1 && alpha == 1 {
      return defaultBackgroundColor(for: colorScheme)
    }

    return UIColor(red: red, green: green, blue: blue, alpha: alpha)
  }

  private func currentColorScheme() -> String {
    return currentInterfaceStyle() == .dark ? "dark" : "light"
  }

  private func currentInterfaceStyle() -> UIUserInterfaceStyle {
    let interfaceStyles = [
      viewIfLoaded?.window?.traitCollection.userInterfaceStyle,
      traitCollection.userInterfaceStyle,
      UIScreen.main.traitCollection.userInterfaceStyle,
      UITraitCollection.current.userInterfaceStyle,
      viewIfLoaded?.traitCollection.userInterfaceStyle
    ]

    return interfaceStyles.compactMap { $0 }.first { $0 != .unspecified } ?? .light
  }

  private func syncColorScheme() {
    let colorScheme = currentColorScheme()

    guard colorScheme != appliedColorScheme else {
      return
    }

    appliedColorScheme = colorScheme
    reactRootView?.overrideUserInterfaceStyle = interfaceStyle(for: colorScheme)
    reactRootView?.backgroundColor = configuredBackgroundColor(for: colorScheme)
    updateReactRootProperties(colorScheme: colorScheme)
  }

  private func updateReactRootProperties(colorScheme: String) {
    let properties = ["colorScheme": colorScheme]

    if let rootView = reactRootView as? RCTRootView {
      rootView.appProperties = properties
    }
    else if reactRootView?.responds(to: Selector(("setAppProperties:"))) == true {
      reactRootView?.setValue(properties, forKey: "appProperties")
    }
  }

  private func interfaceStyle(for colorScheme: String) -> UIUserInterfaceStyle {
    return colorScheme == "dark" ? .dark : .light
  }

  private func defaultBackgroundColor(for colorScheme: String) -> UIColor {
    if colorScheme == "dark" {
      return UIColor(red: 31.0 / 255.0, green: 41.0 / 255.0, blue: 55.0 / 255.0, alpha: 1)
    }

    return UIColor(red: 1, green: 1, blue: 1, alpha: 1)
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
