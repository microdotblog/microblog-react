# Micro.blog Android App (React Native)

Welcome to the React Native app for Micro.blog. Here are some things to get started:

## Install & Run the project

In the main root of this repo, run `yarn` or `npm install`.

Note that you need to have a working installation of Android Studio and an enabled emulator. You can download it [here](https://developer.android.com/studio/).

Once your packages have been installed using the above command, you can open up the project in Android Studio. Once Gradle has finished doing what it needs to, "Run" the app in your emulator and/or real device.

Alternatively you can run `yarn android` which will do all the steps above without having to open Android Studio.

## Android Push Notifications

Push notifications on Android require the `google-services.json` file to be present in the root of `android/app`. There might be build errors if it isn't present. Note that this file has been excluded/ignored from source control. Check the Firebase dashboard to download it.

To test notifications, use the following "data" within the message:
`{"from_user": "{"username":"gluon"}", "post_id": "12499040", "to_user": "{"username":"vincent"}"}`

## A note on snake_case syntax

A by product of loving the Ruby language so much, I started adopting snake_case in JavaScript years ago as it provided better readability for me. This might be confusing at first. I don't mind if camelCase will be used for anything, just be aware that I'll continue to adopt my approach in future (unless I change my mind).

## Connection issues to Metro in the si, or device, when running in develop mode

Sometimes the Android simulator won't connect to the Meto Bundler locally. In order to get it to work, use the following command in the terminal after the sim or device is connected/running.

`adb reverse tcp:8081 tcp:8081`

This basically adds a reverse proxy to the bundler. You can do this multiple times with different port numbers as needed. For example you might want to use a different port number when loading a local web view, web app or service.