package tinder

type Option func(cfg *config) error

func (cfg *config) apply(opts []Option) error {
	for _, opt := range opts {
		if err := opt(cfg); err != nil {
			return err
		}
	}
	return nil
}

type config struct {
	// subscribe
	Subscribe struct {
		NoPool bool
	}

	// Advertise
	Advertise struct {
		Ttl           int64
		ResetInterval int64
	}
}
