import opentelemetry, { Span } from '@opentelemetry/api'

export default (name: string, callback: (span: Span) => void) => {
	// To create a span in a trace, we used the global singleton tracer to start a new span.
	const span = opentelemetry.trace.getTracer('default').startSpan(name)

	// Set a span attribute
	span.setAttribute('key', 'value')

	callback(span)

	// We must end the spans so they become available for exporting.
	span.end()
}
