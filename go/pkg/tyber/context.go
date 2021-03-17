// +build !withoutTyber

package tyber

import (
	"context"
	"encoding/binary"
	"strconv"
	"time"

	"github.com/gofrs/uuid"
	"golang.org/x/crypto/sha3"
)

type traceIDKeyType string

const (
	traceIDKey   traceIDKeyType = "TyberTraceID"
	uuidFallback string         = "409123fa-4dd5-11eb-a4a1-675173c25b22"
)

func ContextWithTraceID(ctx context.Context) context.Context {
	// Skip if we are already tyber injected
	_, ok := ctx.Value(traceIDKey).(string)
	if ok {
		return ctx
	}

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

	return &tyberContext{
		contextWithoutValue: ctx,
		underlyingContext:   ctx,
		tid:                 id.String(),
	}
}

// ContextWithTraceIDFromSalt inject tyber with an id constant from the salt
func ContextWithTraceIDFromSalt(ctx context.Context, salts ...[]byte) context.Context {
	// Skip if we are already tyber injected
	_, ok := ctx.Value(traceIDKey).(string)
	if ok {
		return ctx
	}

	h := sha3.New224()
	h.Write([]byte(traceIDKey))
	h.Write([]byte(uuidFallback))

	for _, v := range salts {
		h.Write(v)
	}

	// Create the UUID
	var id string
	{
		buf := h.Sum([]byte(traceIDKey))

		_ = buf[15] // Go bound check optimisation

		buf[6] = (4 << 4) | (buf[6] & 0b00001111)    // Sets the version to 4 (random data)
		buf[8] = (0b10 << 6) | (buf[8] & 0b00111111) // Sets the variant to 2 (RFC 4122)

		// xxxxxxxx-
		id = strconv.FormatUint(uint64(binary.BigEndian.Uint32(buf)), 16)
		for len(id) < 8 {
			id = "0" + id
		}
		id += "-"

		// xxxx-
		{
			tid := strconv.FormatUint(uint64(binary.BigEndian.Uint16(buf[4:])), 16)
			for len(tid) < 4 {
				tid = "0" + tid
			}
			id += tid + "-"
		}

		// Mxxx-
		{
			tid := strconv.FormatUint(uint64(binary.BigEndian.Uint16(buf[6:])), 16)
			for len(tid) < 4 {
				tid = "0" + tid
			}
			id += tid + "-"
		}

		// Nxxx-
		{
			tid := strconv.FormatUint(uint64(binary.BigEndian.Uint16(buf[8:])), 16)
			for len(tid) < 4 {
				tid = "0" + tid
			}
			id += tid + "-"
		}

		// xxxxxxxxxxxx
		{
			tid := strconv.FormatUint((uint64(binary.BigEndian.Uint32(buf[12:])) | (uint64(binary.BigEndian.Uint16(buf[10:])) << 32)), 16)
			for len(tid) < 12 {
				tid = "0" + tid
			}
			id += tid
		}
	}

	return &tyberContext{
		contextWithoutValue: ctx,
		underlyingContext:   ctx,
		tid:                 id,
	}
}

func getTraceIDFromContext(ctx context.Context) string {
	id, ok := ctx.Value(traceIDKey).(string)
	if !ok {
		return "no_trace_id"
	}

	return id
}

type contextWithoutValue interface {
	Deadline() (deadline time.Time, ok bool)
	Done() <-chan struct{}
	Err() error
}

// This is a tiny optimisation to hopefully make tyber a bit less slow.
type tyberContext struct {
	contextWithoutValue

	underlyingContext context.Context
	tid               string
}

func (ctx *tyberContext) Value(key interface{}) interface{} {
	if key == traceIDKey {
		return ctx.tid
	}

	return ctx.underlyingContext.Value(key)
}
