//
//  AppDelegate.swift
//  MicroBlog_RN
//
//  Created by Vincent Ritter on 02/10/2025.
//
internal import Expo
import React
import ReactAppDependencyProvider
import RNShareMenu
import UserNotifications

@main
class AppDelegate: ExpoAppDelegate, UNUserNotificationCenterDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ExpoReactNativeFactoryDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  public override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    NSLog("PushDebug:didFinishLaunchingWithOptions launchOptions=%@", String(describing: launchOptions))
    let delegate = ReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "Micro.blog",
      in: window,
      launchOptions: launchOptions
    )

    UNUserNotificationCenter.current().delegate = self

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  public override func application(_ application: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    return ShareMenuManager.application(application, open: url, options: options) || super.application(application, open: url, options: options)
  }

  // Required to register for notifications
  func application(_ application: UIApplication, didRegister notificationSettings: UIUserNotificationSettings) {
    RNCPushNotificationIOS.didRegister(notificationSettings)
  }

  // Required for the register event.
  public override func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    NSLog("PushDebug:didRegisterForRemoteNotificationsWithDeviceToken")
    RNCPushNotificationIOS.didRegisterForRemoteNotifications(withDeviceToken: deviceToken)
  }

  // Required for the notification event. You must call the completion handler after handling the remote notification.
  public override func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable : Any], fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
    NSLog("PushDebug:didReceiveRemoteNotification userInfo=%@", String(describing: userInfo))
    RNCPushNotificationIOS.didReceiveRemoteNotification(userInfo, fetchCompletionHandler: completionHandler)
  }

  // Required for the registrationError event.
  public override func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
    RNCPushNotificationIOS.didFailToRegisterForRemoteNotificationsWithError(error)
  }

  // Required for the localNotification event.
  func application(_ application: UIApplication, didReceive notification: UILocalNotification) {
    RNCPushNotificationIOS.didReceive(notification)
  }

  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    NSLog(
      "PushDebug:userNotificationCenter:didReceive response action=%@ userInfo=%@",
      response.actionIdentifier,
      String(describing: response.notification.request.content.userInfo)
    )
    RNCPushNotificationIOS.didReceive(response)
    completionHandler()
  }

  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    NSLog(
      "PushDebug:userNotificationCenter:willPresent userInfo=%@",
      String(describing: notification.request.content.userInfo)
    )
    completionHandler([.badge, .sound, .banner, .list])
  }
}

class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    bridge.bundleURL ?? bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
