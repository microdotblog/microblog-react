# Micro.blog Android App (React Native)

Welcome to the React Native app for Micro.blog. Here are some things to get started:

## Install & Run the project

In the main root of this repo, run `yarn` or `npm install`.

Note that you need to have a working installation of Android Studio and an enabled emulator. You can download it [here](https://developer.android.com/studio/).

Once your packages have been installed using the above command, you can open up the project in Android Studio. Once Gradle has finished doing what it needs to, "Run" the app in your emulator and/or real device.

Alternatively you can run `yarn android` which will do all the steps above without having to open Android Studio.

## Android Push Notifications

Push notifications on Android require the `google-services.json` file to be present in the root of `android/app`. There might be build errors if it isn't present. Note that this file has been excluded/ignored from source control. Check the Firebase dashboard to download it.