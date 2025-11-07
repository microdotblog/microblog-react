//
//  AppDelegate.swift
//  MicroBlog_RN
//
//  Created by Vincent Ritter on 02/10/2025.
//


import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
//import RNCPushNotificationIOS
import RNShareMenu

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "Micro.blog",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }

  func application(_ application: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    return ShareMenuManager.application(application, open: url, options: options)
  }

//  // Required to register for notifications
//  func application(_ application: UIApplication, didRegister notificationSettings: UIUserNotificationSettings) {
//    RNCPushNotificationIOS.didRegister(notificationSettings)
//  }
//
//  // Required for the register event.
//  func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
//    RNCPushNotificationIOS.didRegisterForRemoteNotifications(withDeviceToken: deviceToken)
//  }
//
//  // Required for the notification event. You must call the completion handler after handling the remote notification.
//  func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable : Any], fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
//    RNCPushNotificationIOS.didReceiveRemoteNotification(userInfo, fetchCompletionHandler: completionHandler)
//  }
//
//  // Required for the registrationError event.
//  func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
//    RNCPushNotificationIOS.didFailToRegisterForRemoteNotificationsWithError(error)
//  }
//
//  // Required for the localNotification event.
//  func application(_ application: UIApplication, didReceive notification: UILocalNotification) {
//    RNCPushNotificationIOS.didReceive(notification)
//  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
