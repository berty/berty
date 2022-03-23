package tinder

import (
	"strings"

	p2p_discovery "github.com/libp2p/go-libp2p-core/discovery"
)

type tinderOption string

const (
	optionKeepContext  tinderOption = "keepctx"
	optionFilterDriver tinderOption = "filterdriver"
)

func WatchdogDiscoverKeepContextOption(opts *p2p_discovery.Options) error {
	if opts.Other == nil {
		opts.Other = make(map[interface{}]interface{})
	}
	opts.Other[optionKeepContext] = true
	return nil
}

// FilterDriverNameOption filter driver by prefix name
func FilterDriverNameOption(driversName ...string) p2p_discovery.Option {
	return func(opts *p2p_discovery.Options) error {
		if opts.Other == nil {
			opts.Other = make(map[interface{}]interface{})
		}
		opts.Other[optionFilterDriver] = driversName
		return nil
	}
}

func shoudlFilterDriver(name string, filters []string) bool {
	for _, filter := range filters {
		if strings.HasPrefix(name, filter) {
			return true
		}
	}

	return false
}
