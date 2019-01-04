package tracing

import (
	"context"
	"runtime"
	"strings"

	opentracing "github.com/opentracing/opentracing-go"
)

type Tracer interface {
	Finish()
	SetTag(key, value string)
	SetStringField(key, value string)
	SetAnyField(key string, value interface{})
	Span() opentracing.Span
	Context() context.Context
	SetMetadata(key, value string)
}

func GetCallerName(skip int) string {
	function, _, _, _ := runtime.Caller(skip + 1)
	funcName := runtime.FuncForPC(function).Name()
	return strings.Replace(funcName, "berty.tech/core/", "./", 1)
}
