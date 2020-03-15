# nuxt-rezdy

## Setup

1. Add `nuxt-rezdy` dependency to your project

```bash
yarn add nuxt-rezdy # or npm install nuxt-rezdy
```

2. Add `nuxt-rezdy` to the `modules` section of `nuxt.config.js`

```js
{
  modules: [
    // Simple usage
    'nuxt-rezdy',

    // With options
    ['nuxt-rezdy', { /* module options */ }]
  ]
}
```

Force additional required Rezdy fields by adding fieldOverrides to the module configuration.

```js
fieldOverrides: [
  { label: 'First Name', fieldType: 'String' },
  { label: 'Last Name', fieldType: 'String' },
  { label: 'Address', fieldType: 'String' },
  { label: 'City', fieldType: 'String' },
  { label: 'Country', fieldType: 'List' },
  { label: 'Email', fieldType: 'String' },
  { label: 'Postcode/ZIP', fieldType: 'String', countries: ['US', 'BR', 'RO'] },
  { label: 'State/County/Region', fieldType: 'String', countries: ['US', 'BR', 'RO', 'IN'] }
]
```

Vinti4 requires an urlMerchantResponse as a vinti4 option
```js
vinti4: {
  urlMerchantResponse: YOUR_CUSTOM_URL
}
```

## Development

1. Clone this repository
2. Install dependencies using `yarn install` or `npm install`
3. Start development server using `npm run dev`

## License

[MIT License](./LICENSE)

Copyright (c) Broc Gailit <brocgailit@gmail.com>

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-rezdy/latest.svg?style=flat-square
[npm-version-href]: https://npmjs.com/package/nuxt-rezdy

[npm-downloads-src]: https://img.shields.io/npm/dt/nuxt-rezdy.svg?style=flat-square
[npm-downloads-href]: https://npmjs.com/package/nuxt-rezdy

[circle-ci-src]: https://img.shields.io/circleci/project/github/.svg?style=flat-square
[circle-ci-href]: https://circleci.com/gh/

[codecov-src]: https://img.shields.io/codecov/c/github/.svg?style=flat-square
[codecov-href]: https://codecov.io/gh/

[license-src]: https://img.shields.io/npm/l/nuxt-rezdy.svg?style=flat-square
[license-href]: https://npmjs.com/package/nuxt-rezdy
