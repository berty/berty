// Code generated by berty.tech/core/.scripts/generate-logger.sh

package graphql

import "go.uber.org/zap"

func logger() *zap.Logger {
	return zap.L().Named("core.api.node.graphql")
}
