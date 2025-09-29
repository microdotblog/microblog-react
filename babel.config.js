module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    'react-native-reanimated/plugin'
  ],
  env: {
    production: {
      plugins: ['transform-remove-console']
    }
  }
};
