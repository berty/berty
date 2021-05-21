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

func ContextWithTraceID(ctx context.Context) (context.Context, bool) {
	if eid := GetTraceIDFromContext(ctx); eid != noTraceID {
		return ctx, false
	}
	return ContextWithConstantTraceID(ctx, NewTraceID()), true
}

func ContextWithConstantTraceID(ctx context.Context, traceID string) context.Context {
	if existingTraceID := GetTraceIDFromContext(ctx); existingTraceID != noTraceID {
		md, _ := metadata.FromOutgoingContext(ctx)
		md = md.Copy()
		md.Set(string(traceIDKey), traceID)
		return metadata.NewOutgoingContext(ctx, md)
	}
	return metadata.AppendToOutgoingContext(ctx, string(traceIDKey), traceID)
}

func GetTraceIDFromContext(ctx context.Context) string {
	if md, ok := metadata.FromIncomingContext(ctx); ok {
		ids := md.Get(string(traceIDKey))
		if len(ids) > 0 && len(ids[0]) > 0 {
			return ids[0]
		}
	}
	if md, ok := metadata.FromOutgoingContext(ctx); ok {
		ids := md.Get(string(traceIDKey))
		if len(ids) > 0 && len(ids[0]) > 0 {
			return ids[0]
		}
	}
	return noTraceID
}

func ContextWithNewTraceID(ctx context.Context) context.Context {
	return ContextWithConstantTraceID(ctx, NewTraceID())
}
