package tracing

import (
	"context"
	"encoding/json"
	"fmt"
	"runtime"
	"strings"

	opentracing "github.com/opentracing/opentracing-go"
	"github.com/opentracing/opentracing-go/log"
)

func GetCallerName(prefix string, skip int) string {
	function, _, _, _ := runtime.Caller(skip + 1)
	funcName := runtime.FuncForPC(function).Name()
	caller := strings.Replace(funcName, "berty.tech/core/", "./", 1)
	return fmt.Sprintf("%s::%s()", prefix, caller)
}

func EnterFunc(ctx context.Context, args ...interface{}) (opentracing.Span, context.Context) {
	// FIXME: add a way to completely disable the following behavior
	topic := GetCallerName("call", 1)

	if ctx == nil {
		ctx = context.Background()
		logger().Warn("context is not set")
	}
	span, ctx := opentracing.StartSpanFromContext(ctx, topic)
	if len(args) > 0 {
		for idx, arg := range args {
			outBytes, err := json.Marshal(arg)
			out := string(outBytes)
			argName := fmt.Sprintf("arg%d", idx)

			if err != nil {
				out = fmt.Sprintf("%v", arg)
			}
			span.LogFields(log.String(argName, out))

		}
	}
	span.SetTag("component", "core.call")
	return span, ctx
}
