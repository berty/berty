package libp2p

import (
	"context"

	config "github.com/libp2p/go-libp2p/config"

	host "github.com/libp2p/go-libp2p-host"
)

// Config describes a set of settings for a libp2p node
type Config = config.Config

// Option is a libp2p config option that can be given to the libp2p constructor
// (`libp2p.New`).
type Option = config.Option

// ChainOptions chains multiple options into a single option.
func ChainOptions(opts ...Option) Option {
	return func(cfg *Config) error {
		for _, opt := range opts {
			if err := opt(cfg); err != nil {
				return err
			}
		}
		return nil
	}
}

// New constructs a new libp2p node with the given options (falling back on
// reasonable defaults).
//
// Canceling the passed context will stop the returned libp2p node.
func New(ctx context.Context, opts ...Option) (host.Host, error) {
	return NewWithoutDefaults(ctx, append(opts, FallbackDefaults)...)
}

// NewWithoutDefaults constructs a new libp2p node with the given options but
// *without* falling back on reasonable defaults.
//
// Warning: This function should not be considered a stable interface. We may
// choose to add required services at any time and, by using this function, you
// opt-out of any defaults we may provide.
func NewWithoutDefaults(ctx context.Context, opts ...Option) (host.Host, error) {
	var cfg Config
	if err := cfg.Apply(opts...); err != nil {
		return nil, err
	}
	return cfg.NewNode(ctx)
}
