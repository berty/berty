package dht

import (
	ropts "github.com/libp2p/go-libp2p-routing/options"
)

type quorumOptionKey struct{}

// Quorum is a DHT option that tells the DHT how many peers it needs to get
// values from before returning the best one.
//
// Default: 16
func Quorum(n int) ropts.Option {
	return func(opts *ropts.Options) error {
		if opts.Other == nil {
			opts.Other = make(map[interface{}]interface{}, 1)
		}
		opts.Other[quorumOptionKey{}] = n
		return nil
	}
}

func getQuorum(opts *ropts.Options) int {
	responsesNeeded, ok := opts.Other[quorumOptionKey{}].(int)
	if !ok {
		responsesNeeded = 16
	}
	return responsesNeeded
}
