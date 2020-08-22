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

#### Test in Chrome locally

To watch files and rebuild when files change in development:

```
yarn build:chrome:dev
```

To open React devtools for the options page:

```
yarn react-devtools
```

- Chrome Settings > More Tools > Extensions...
- Turn on Developer mode
- Load unpacked > Select the `extension/chrome` directory

#### Test in Chrome locally

To watch files and rebuild when files change in development:

```
yarn build:firefox:dev
yarn launch:firefox
```

To open React devtools for the options page:

```
yarn react-devtools
```

### Format files

```
yarn fix
```

### Test if everything is fine

```
yarn test
```

### Help

To configure "Prettier options" via chrome:

- click on the prettier chrome extention,
  <img src="./chrome-web-store/first step.PNG"
     alt="first step"
     style="float: left; margin-right: 10px;" />

- You will get a Popup menu among which is **"Options"**.
  <img src="./chrome-web-store/second step.PNG"
     alt=" step  two"
     style="float: left; margin-right: 10px;" />
- Click on **options** and make your setups.
  <img src="./chrome-web-store/third step.PNG"
     alt=" step to configure"
     style="float: left; margin-right: 10px;" />
- Now Prettier is set up, and ready to be used.
  <img src="./chrome-web-store/prettier.gif"
     alt="how it works"
     style="float: left; margin-right: 10px;" />

  ## Help

We need your [help](https://github.com/prettier/prettier-chrome-extension/issues) :)
