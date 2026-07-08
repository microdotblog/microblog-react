import { featureFlags } from 'react-native-screens'

// Prevent natively-dismissed screens from being reattached when JS state lags.
// Without this, a ghost screen can sit above the timeline and swallow touches
// until the next navigation forces the stack to reconcile.
if (featureFlags?.experiment && 'iosPreventReattachmentOfDismissedScreens' in featureFlags.experiment) {
  featureFlags.experiment.iosPreventReattachmentOfDismissedScreens = true
}
