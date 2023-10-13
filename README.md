# Prettier Browser Extension

> Extension that adds support for prettifying input boxes that support Markdown or Code. Currently supports Chrome and Firefox.

## Chrome Web Store

[Install](https://chrome.google.com/webstore/detail/prettier/fbcfnmplppajblbmdehballiekfgdkhp) the extension from the store.

## Usage

<!-- markdownlint-disable-next-line no-inline-html -->
Press <kbd>Control</kbd>+<kbd>Shift</kbd>+<kbd>,</kbd> (or <kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>,</kbd> on macOS) in a `<textarea>` to format valid [fenced code blocks](https://www.markdownguide.org/extended-syntax/#fenced-code-blocks) that are contained inside.

## Development

### Install Dependencies

```sh
yarn
```

### Build

For a one-time build in production:

```sh
yarn build
```

#### Test in Chrome locally

To watch files and rebuild when files change in development:

```sh
yarn dev:chrome
```

To load the extension in Chrome:

- Chrome Settings > More Tools > Extensions...
- Turn on Developer mode
- Load unpacked > Select the `extension/chrome` directory

To open React devtools for the options page:

```sh
yarn react-devtools
```

#### Test in Firefox locally

To watch files and rebuild when files change in development:

```sh
yarn dev:firefox
yarn launch:firefox
```

To open React devtools for the options page:

```sh
yarn react-devtools
```

### Lint files

```sh
yarn lint
```

### Format files

```sh
yarn format
```

### Run tests (to be added in the future)

```sh
yarn test-only
```

### Run all of the above

```sh
yarn test
```

## Help

We would love your [help](https://github.com/prettier/prettier-browser-extension/issues) :)
