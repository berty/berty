import { SimpleSpanProcessor, ConsoleSpanExporter } from './opentelemetry-tracing/src/index'
import { JaegerExporter, ExporterConfig } from '@berty-tech/exporter-jaeger-web'
import { WebTracerProvider } from './opentelemetry-web/src/index'
import { ZoneContextManager } from '@opentelemetry/context-zone'

const JAEGER_CONFIG: ExporterConfig = {
	serviceName: 'chat',
	port: 14268,
	host: 'localhost',
}

export default () => {
	console.log('setting up tracer provider')
	const provider = new WebTracerProvider()
	provider.addSpanProcessor(new SimpleSpanProcessor(new JaegerExporter(JAEGER_CONFIG)))
	provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()))
	provider.register({ contextManager: new ZoneContextManager() })
	return provider
}
