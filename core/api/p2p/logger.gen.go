// Code generated by github.com/berty/berty/core/.scripts/generate-logger.sh

package p2p

import "go.uber.org/zap"

func logger() *zap.Logger {
	return zap.L().Named("core.api.p2p")
}
