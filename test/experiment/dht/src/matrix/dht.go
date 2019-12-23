package matrix

import (
	"encoding/json"
	"fmt"

	"github.com/pkg/errors"

	"berty.tech/berty/experiment/dht"
	"github.com/matrix-org/gomatrix"
)

var _ dht.DHT = (*DHT)(nil)

type DHT struct {
	username   string
	password   string
	serverName string

	bootstraps []*Bootstrap

	shutdown chan struct{}
}

type Options struct {
	User     string
	Password string
	URL      string
}

type Bootstrap struct {
	*gomatrix.Client
	rooms map[string]string
}

func New(opts *Options) (d *DHT, err error) {
	// validate options
	if opts.User == "" {
		return nil, errors.New("matrix: UserID not defined")
	}
	if opts.Password == "" {
		return nil, errors.New("matrix: Password not defined")
	}

	d = &DHT{
		username:   opts.User,
		password:   opts.Password,
		bootstraps: []*Bootstrap{},
	}

	return d, nil
}

func (d *DHT) Run() error {
	return nil
}

func (d *DHT) Shutdown() error {
	return nil
}

func (d *DHT) Bootstrap(url string) error {
	bootstrap := &Bootstrap{rooms: map[string]string{}}
	var err error

	bootstrap.Client, err = gomatrix.NewClient(
		url,
		d.username,
		"",
	)
	if err != nil {
		return err
	}
	if err := bootstrap.login(d.username, d.password); err != nil {
		if err := bootstrap.register(d.username, d.password); err != nil {
			return err
		}
	}
	d.bootstraps = append(d.bootstraps, bootstrap)
	return nil
}

func (d *DHT) Put(key string, value interface{}) error {
	var err error
	for _, b := range d.bootstraps {
		roomID := ""
		for _, b1 := range d.bootstraps {
			alias := "#" + key + ":" + b1.HomeserverURL.Hostname()
			roomID, err = b1.joinRoom(alias, b.HomeserverURL.Hostname())
			if err != nil {
				continue
			}
		}
		if roomID == "" {
			roomID, err = b.createRoom("#" + key)
			if err != nil {
				continue
			}
		}

		data, err := json.Marshal(value)
		if err != nil {
			continue
		}
		if err := b.sendMessage(roomID, string(data)); err != nil {
			continue
		}
		return nil
	}
	return errors.New("cannot put")
}

func (d *DHT) Get(key string) (value interface{}, err error) {
	for _, b := range d.bootstraps {
		roomID := ""
		for _, b1 := range d.bootstraps {
			alias := "#" + key + ":" + b1.HomeserverURL.Hostname()
			roomID, err = b1.joinRoom(alias, b.HomeserverURL.Hostname())
			if err != nil {
				continue
			}
		}
		if roomID == "" {
			continue
		}
		data, err := b.getMessage(roomID)
		if err != nil {
			continue
		}
		fmt.Printf("get:\n data: %+v\n", string(data))
		if err := json.Unmarshal([]byte(data), &value); err != nil {
			continue
		}
		return value, nil
	}
	return nil, errors.New("cannot get")
}

func (*DHT) Remove(key string) error {
	return errors.New("not implemented")
}
