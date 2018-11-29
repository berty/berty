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

func EnterFunc(ctx context.Context, args ...interface{}) (opentracing.Span, context.Context) {
	// FIXME: add a way to completely disable the following behavior
	function, _, _, _ := runtime.Caller(1)
	funcName := runtime.FuncForPC(function).Name()
	topic := fmt.Sprintf("call::%s()", funcName)
	topic = strings.Replace(topic, "call::berty.tech/core/", "call::./", 1)
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
