import {
	BasicTracerProvider,
	SimpleSpanProcessor,
	ConsoleSpanExporter,
} from './opentelemetry-tracing/src/index'
import { JaegerExporter, ExporterConfig } from '@berty-tech/exporter-jaeger-web'

const JAEGER_CONFIG: ExporterConfig = {
	serviceName: 'chat',
	port: 14268,
	host: 'localhost',
}

export default () => {
	console.log('setting up tracer provider')
	const provider = new BasicTracerProvider()
	provider.addSpanProcessor(new SimpleSpanProcessor(new JaegerExporter(JAEGER_CONFIG)))
	provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()))
	provider.register()
	return provider
}
