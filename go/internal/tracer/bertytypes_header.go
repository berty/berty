package tracer

import (
	"context"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"go.opentelemetry.io/otel/api/kv"
	"go.opentelemetry.io/otel/api/propagation"
	"go.opentelemetry.io/otel/api/trace"
)

type metadataSupplier struct {
	header *bertytypes.MessageHeaders
}

func (m *metadataSupplier) Get(key string) string {
	if meta := m.header.GetMetadata(); meta != nil {
		if v, ok := meta[key]; ok {
			return v
		}
	}

	return ""
}

func (m *metadataSupplier) Set(key string, val string) {
	if m.header.Metadata == nil {
		m.header.Metadata = make(map[string]string)
	}

	m.header.Metadata[key] = val
}

func InjectSpanContextToMessageHeaders(ctx context.Context, h *bertytypes.MessageHeaders) {
	propagation.InjectHTTP(ctx, Propagators(), &metadataSupplier{h})
}

func ExtractSpanContextFromMessageHeaders(ctx context.Context, h *bertytypes.MessageHeaders) context.Context {
	return propagation.ExtractHTTP(ctx, Propagators(), &metadataSupplier{h})
}

func SpanFromMessageHeaders(ctx context.Context, h *bertytypes.MessageHeaders, name string, attrs ...kv.KeyValue) (context.Context, trace.Span) {
	hctx := ExtractSpanContextFromMessageHeaders(context.Background(), h)
	sctx := trace.RemoteSpanContextFromContext(hctx)
	return From(ctx).Start(hctx, name, trace.LinkedTo(sctx))
}
