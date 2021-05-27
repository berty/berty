package tyber

import (
	"context"
	"strconv"
	"time"

	"github.com/gofrs/uuid"
	"google.golang.org/grpc/metadata"
)

type traceIDKeyType string

const (
	traceIDKey   traceIDKeyType = "TyberTraceID"
	noTraceID    string         = "no_trace_id"
	uuidFallback string         = "409123fa-4dd5-11eb-a4a1-675173c25b22"
)

var (
	NewSessionID = newID
	NewTraceID   = newID
)

func ContextWithTraceID(ctx context.Context) (context.Context, bool) {
	if eid := GetTraceIDFromContext(ctx); eid != noTraceID {
		return ctx, false
	}
	if md, ok := metadata.FromIncomingContext(ctx); ok {
		if vals := md.Get(string(traceIDKey)); len(vals) != 0 {
			return ContextWithConstantTraceID(ctx, vals[0]), false
		}
	}
	return ContextWithConstantTraceID(ctx, NewTraceID()), true
}

func ContextWithConstantTraceID(ctx context.Context, traceID string) context.Context {
	md, ok := metadata.FromOutgoingContext(ctx)
	if ok {
		md = md.Copy()
	} else {
		md = metadata.New(nil)
	}
	md.Set(string(traceIDKey), traceID)
	return metadata.NewOutgoingContext(context.WithValue(ctx, traceIDKey, traceID), md)
}

func GetTraceIDFromContext(ctx context.Context) string {
	if val, ok := ctx.Value(traceIDKey).(string); ok {
		return val
	}
	return noTraceID
}

func ContextWithoutTraceID(ctx context.Context) context.Context {
	return ContextWithConstantTraceID(ctx, noTraceID)
}

func newID() string {
	uid, err := uuid.NewV4()
	// If error while reading random, fallback on uuid v5
	if err != nil {
		ns, err := uuid.FromString(uuidFallback)
		if err != nil {
			panic(err) // Should never happen
		}
		n := strconv.FormatInt(time.Now().UnixNano(), 10)
		uid = uuid.NewV5(ns, n)
	}

	return uid.String()
}
