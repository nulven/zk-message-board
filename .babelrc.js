module.exports = {
  env: {
    development: {
      compact: false
    }
  },
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          esmodules: true,
        },
      },
    ],
  ],
  plugins: [
    "@babel/plugin-transform-runtime",
  ],
}
