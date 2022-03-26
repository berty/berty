package logutil

import (
	crand "crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"sync"

	"go.uber.org/zap"
)

var (
	global *PrivateField
	mu     sync.RWMutex
)

type PrivateField struct {
	Namespace []byte
	Enabled   bool
}

func (p *PrivateField) hash(value string) string {
	hash := sha256.New()
	if _, err := hash.Write(p.Namespace); err != nil {
		return "unrepresentable"
	}

	if _, err := hash.Write([]byte(value)); err != nil {
		return "unrepresentable"
	}

	hashed := hash.Sum(nil)

	return hex.EncodeToString(hashed)
}

func (p *PrivateField) PrivateString(key string, value string) zap.Field {
	if p.Enabled {
		return zap.String(key, p.hash(value))
	}

	return zap.String(key, value)
}

func (p *PrivateField) PrivateStrings(key string, values []string) zap.Field {
	if p.Enabled {
		strings := make([]string, len(values))
		for i := range values {
			strings[i] = p.hash(values[i])
		}

		return zap.Strings(key, strings)
	}

	return zap.Strings(key, values)
}

func (p *PrivateField) PrivateAny(key string, value interface{}) zap.Field {
	if p.Enabled {
		return zap.String(key, p.hash(fmt.Sprintf("%+v", value)))
	}

	return zap.Any(key, value)
}

func (p *PrivateField) PrivateBinary(key string, value []byte) zap.Field {
	if p.Enabled {
		return zap.String(key, p.hash(hex.EncodeToString(value)))
	}

	return zap.Binary(key, value)
}

func PrivateStrings(key string, value []string) zap.Field {
	mu.RLock()
	g := global
	mu.RUnlock()

	return g.PrivateStrings(key, value)
}

func PrivateString(key string, value string) zap.Field {
	mu.RLock()
	g := global
	mu.RUnlock()

	return g.PrivateString(key, value)
}

func PrivateAny(key string, value interface{}) zap.Field {
	mu.RLock()
	g := global
	mu.RUnlock()

	return g.PrivateAny(key, value)
}

func PrivateBinary(key string, value []byte) zap.Field {
	mu.RLock()
	g := global
	mu.RUnlock()

	return g.PrivateBinary(key, value)
}

func SetGlobal(namespace []byte, enabled bool) {
	mu.Lock()
	global = &PrivateField{
		Enabled:   enabled,
		Namespace: namespace,
	}
	mu.Unlock()
}

func DisablePrivateFields() {
	SetGlobal(nil, false)
}

func init() { // nolint:gochecknoinits
	namespace := make([]byte, 32)
	_, err := crand.Reader.Read(namespace)
	if err != nil {
		panic(err)
	}

	SetGlobal(namespace, true)
}
