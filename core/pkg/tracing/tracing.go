package tracing

import (
	"context"
	"fmt"
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
}

func GetCallerName(prefix string, skip int) string {
	function, _, _, _ := runtime.Caller(skip + 1)
	funcName := runtime.FuncForPC(function).Name()
	caller := strings.Replace(funcName, "berty.tech/core/", "./", 1)
	return fmt.Sprintf("%s::%s()", prefix, caller)
}
