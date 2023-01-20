package tinder

type Filter map[string]struct{}

func (f Filter) ShouldFilter(name string) (yes bool) {
	if f == nil {
		return
	}

	_, yes = f[name]
	return
}

type Options struct {
	DriverFilters Filter
}

type Option func(opts *Options) error

func (o *Options) apply(opts ...Option) error {
	for _, opt := range opts {
		if err := opt(o); err != nil {
			return err
		}
	}

	return nil
}

func FilterOutDrivers(drivers ...string) Option {
	return func(opts *Options) error {
		opts.DriverFilters = map[string]struct{}{}
		for _, driver := range drivers {
			opts.DriverFilters[driver] = struct{}{}
		}

		return nil
	}
}
