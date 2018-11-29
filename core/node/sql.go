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

// sql returns a gorm.DB object with opentracing context
func (n *Node) sql(ctx context.Context) *gorm.DB {
	if ctx == nil {
		return n.sqlDriver.Set("rootSpan", n.rootSpan)
	}
	if span := opentracing.SpanFromContext(ctx); span != nil {
		return n.sqlDriver.Set("rootSpan", span)
	}
	return n.sqlDriver
}
