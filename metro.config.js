const {
  getDefaultConfig: getReactNativeDefaultConfig,
  mergeConfig,
} = require('@react-native/metro-config')
const { getDefaultConfig: getExpoDefaultConfig } = require('expo/metro-config')

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
}

module.exports = mergeConfig(
  getReactNativeDefaultConfig(__dirname),
  getExpoDefaultConfig(__dirname),
  config
)
