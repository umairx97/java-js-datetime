# mobile-framework-js

This mobile-framework is a library that can parse and format the various date formats that are commonly encountered across the VA Mobile environment.

## General Installation

The module is in VA Nexus registry.

```bash
npm login https://nexus.mobilehealth.va.gov/content/repositories/npm-all
npm i @va-mobile/mobile-framework-js
```

## Usage

Follow the instruction below depending on your application framework.

### Plain Javascript

1. Install the package `npm i --save @va-mobile/mobile-framework-js`

2. Import the component in `index.html`

```html
<script type="module">
  import '@va-mobile/mobile-framework-js';
</script>
```

### React
Install the package `npm i --save @va-mobile/mobile-framework-js`

## Publish

To test the package locally

```bash
npm link
```

Using it in a local project

```
npm link @va-mobile/mobile-framework-js
```

