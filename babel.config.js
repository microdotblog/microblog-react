module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    ["@babel/plugin-proposal-decorators", { "legacy": true }]
  ],
  env: {
    production: {
      plugins: ['transform-remove-console']
    }
  }
}
