import { Navigation } from "react-native-navigation";

Navigation.events().registerAppLaunchedListener(() => {
  console.log("APP:LAUNCHED")
});