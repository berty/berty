# OpenTelemetry Core
[![Gitter chat][gitter-image]][gitter-url]
[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

This package provides default implementations of the OpenTelemetry API for trace and metrics. It's intended for use both on the server and in the browser.

## Built-in Implementations

- [Built-in Propagators](#built-in-propagators)
  * [HttpTraceContext Propagator](#httptracecontext-propagator)
  * [B3 Propagator](#b3-propagator)
  * [Composite Propagator](#composite-propagator)
  * [Correlation Context Propagator](#correlation-context-propagator)
- [Built-in Sampler](#built-in-sampler)
  * [Always Sampler](#always-sampler)
  * [Never Sampler](#never-sampler)
  * [Probability Sampler](#probability-sampler)

### Built-in Propagators

#### HttpTraceContext Propagator
OpenTelemetry provides a text-based approach to propagate context to remote services using the [W3C Trace Context](https://www.w3.org/TR/trace-context/) HTTP headers.

> This is used as a default Propagator

```js
const api = require("@opentelemetry/api");
const { HttpTraceContext } = require("@opentelemetry/core");

/* Set Global Propagator */
api.propagation.setGlobalPropagator(new HttpTraceContext());
```

#### B3 Propagator
This is propagator for the B3 HTTP header format, which sends a `SpanContext` on the wire in an HTTP request, allowing other services to create spans with the right context. Based on: https://github.com/openzipkin/b3-propagation

```js
const api = require("@opentelemetry/api");
const { B3Propagator } = require("@opentelemetry/core");

/* Set Global Propagator */
api.propagation.setGlobalPropagator(new B3Propagator());
```

#### Composite Propagator
Combines multiple propagators into a single propagator.

```js
const api = require("@opentelemetry/api");
const { CompositePropagator } = require("@opentelemetry/core");

/* Set Global Propagator */
api.propagation.setGlobalPropagator(new CompositePropagator());
```

#### Correlation Context Propagator
Provides a text-based approach to propagate [correlation context](https://w3c.github.io/correlation-context/) to remote services using the [OpenTelemetry CorrelationContext Propagation](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/correlationcontext/api.md#header-name) HTTP headers.

```js
const api = require("@opentelemetry/api");
const { HttpCorrelationContext } = require("@opentelemetry/core");

/* Set Global Propagator */
api.propagation.setGlobalPropagator(new HttpCorrelationContext());
```

### Built-in Sampler
Sampler is used to make decisions on `Span` sampling.

#### Always Sampler
Samples every trace regardless of upstream sampling decisions.

> This is used as a default Sampler

```js
const { NodeTracerProvider } = require("@opentelemetry/node");
const { ALWAYS_SAMPLER } = require("@opentelemetry/core");

const tracerProvider = new NodeTracerProvider({
  sampler: ALWAYS_SAMPLER
});
```

#### Never Sampler
Doesn't sample any trace, regardless of upstream sampling decisions.

```js
const { NodeTracerProvider } = require("@opentelemetry/node");
const { NEVER_SAMPLER } = require("@opentelemetry/core");

const tracerProvider = new NodeTracerProvider({
  sampler: NEVER_SAMPLER
});
```

#### Probability Sampler
Samples a configurable percentage of traces, and additionally samples any trace that was sampled upstream.

```js
const { NodeTracerProvider } = require("@opentelemetry/node");
const { ProbabilitySampler } = require("@opentelemetry/core");

const tracerProvider = new NodeTracerProvider({
  sampler: new ProbabilitySampler(0.5)
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
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-core
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-core
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-core
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-core&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/core
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fcore.svg
