module.exports = {
  presets: [
    ['@vue/app',
      {
        useBuiltIns: 'entry',
        polyfills: [
          'es6.array.iterator',
          'es6.promise',
          'es6.symbol'
        ]
      }
    ]
  ]
}
