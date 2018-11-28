package node

import (
	"context"

	"github.com/jinzhu/gorm"
	opentracing "github.com/opentracing/opentracing-go"
)

// WithSQL registers a gorm connection as the node database
func WithSQL(sql *gorm.DB) NewNodeOption {
	return func(n *Node) {
		n.sqlDriver = sql.Unscoped()
	}
}

func (n *Node) sql(ctx context.Context) *gorm.DB {
	// FIXME: check if jaeger is enable before losing time calling complex functions
	if ctx == nil {
		// FIXME: create a special span for non-contexted streams
		return n.sqlDriver
	}
	if span := opentracing.SpanFromContext(ctx); span != nil {
		return n.sqlDriver.Set("rootSpan", span)
	}
	return n.sqlDriver
}
