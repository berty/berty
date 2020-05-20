# OpenTelemetry Web SDK
[![Gitter chat][gitter-image]][gitter-url]
[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

This module provides *automated instrumentation and tracing* for Web applications.

For manual instrumentation see the
[@opentelemetry/tracing](https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-tracing) package.

## How does automatic tracing work?
This package exposes a class `WebTracerProvider` that will be able to automatically trace things in Browser only.

See the example how to use it.

OpenTelemetry comes with a growing number of instrumentation plugins for well know modules (see [supported modules](https://github.com/open-telemetry/opentelemetry-js#plugins)) and an API to create custom plugins (see [the plugin developer guide](https://github.com/open-telemetry/opentelemetry-js/blob/master/doc/plugin-guide.md)).

Web Tracer currently supports one plugin for document load.
Unlike Node Tracer (`NodeTracerProvider`), the plugins needs to be initialised and passed in configuration.
The reason is to give user full control over which plugin will be bundled into web page.

You can choose to use the `ZoneContextManager` if you want to trace asynchronous operations.

## Installation

```bash
npm install --save @opentelemetry/web
```

## Usage

```js
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing';
import { WebTracerProvider } from '@opentelemetry/web';
import { DocumentLoad } from '@opentelemetry/plugin-document-load';
import { ZoneContextManager } from '@opentelemetry/context-zone';

// Minimum required setup - supports only synchronous operations
const provider = new WebTracerProvider({
  plugins: [
    new DocumentLoad()
  ]
});

provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register();

const providerWithZone = new WebTracerProvider({
  plugins: [
    new DocumentLoad()
  ]
});
providerWithZone.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

// Changing default contextManager to use ZoneContextManager - supports asynchronous operations
providerWithZone.register({
  contextManager: new ZoneContextManager(),
});

```

## Useful links
- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us on [gitter][gitter-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[gitter-image]: https://badges.gitter.im/open-telemetry/opentelemetry-js.svg
[gitter-url]: https://gitter.im/open-telemetry/opentelemetry-node?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/master/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-web
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-web
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-web
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-web&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/web
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fweb.svg
