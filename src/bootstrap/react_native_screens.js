import { featureFlags } from 'react-native-screens'

if (featureFlags?.experiment && 'iosPreventReattachmentOfDismissedScreens' in featureFlags.experiment) {
  featureFlags.experiment.iosPreventReattachmentOfDismissedScreens = true
}
