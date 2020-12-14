package tyber

import (
	"context"
	"strconv"
	"time"

	"github.com/gofrs/uuid"
)

type traceIDKeyType string

const (
	traceIDKey   traceIDKeyType = "TyberTraceID"
	uuidFallback string         = "409123fa-4dd5-11eb-a4a1-675173c25b22"
)

func ContextWithTraceID(ctx context.Context) context.Context {
	id, err := uuid.NewV4()
	// If error while reading random, fallback on uuid v5
	if err != nil {
		ns, err := uuid.FromString(uuidFallback)
		if err != nil {
			panic(err) // Should never happen
		}
		n := strconv.FormatInt(time.Now().UnixNano(), 10)
		id = uuid.NewV5(ns, n)
	}

	return context.WithValue(ctx, traceIDKey, id.String())
}

func getTraceIDFromContext(ctx context.Context) string {
	id, ok := ctx.Value(traceIDKey).(string)
	if !ok {
		return "no_trace_id"
	}

	return id
}
