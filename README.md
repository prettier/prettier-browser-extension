# Prettier Chrome Extension

> Extension that adds support for prettifying input boxes that support Markdown or Code.

## Chrome Web Store

[Install](https://chrome.google.com/webstore/detail/prettier/fbcfnmplppajblbmdehballiekfgdkhp) the extension from the store.

## Development

### Install Dependencies

```
yarn
```

### Build

For a one-time build in production:

```
yarn build
```

To watch files and rebuild when files change in development:

```
yarn start
```

To open React devtools for the options page:

```
yarn react-devtools
```

#### Test in Chrome locally

- Chrome Settings > More Tools > Extensions...
- Turn on Developer mode
- Load unpacked > Select the `extension` directory

### Format files

```
yarn fix
```

### Test if everything is fine

```
yarn test
```

## Help

We need your [help](https://github.com/prettier/prettier-chrome-extension/issues) :)
