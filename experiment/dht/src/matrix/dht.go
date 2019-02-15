package matrix

import (
	"encoding/json"
	"fmt"
	"os/exec"
	"time"

	"github.com/pkg/errors"

	"berty.tech/experiment/dht"
	"github.com/matrix-org/gomatrix"
)

var _ dht.DHT = (*DHT)(nil)

type DHT struct {
	server *gomatrix.Client

	password string

	bootstraps []*gomatrix.Client
}

func New(opts *dht.Options) (d *DHT, err error) {

	// validate options
	if opts.URL == "" {
		opts.URL = "https://matrix.org"
	}
	if opts.User == "" {
		return nil, errors.New("matrix: UserID not defined")
	}
	if opts.Password == "" {
		return nil, errors.New("matrix: Password not defined")
	}

	d = &DHT{
		password:   opts.Password,
		bootstraps: []*gomatrix.Client{},
	}
	d.server, err = gomatrix.NewClient(
		opts.URL,
		opts.User,
		"",
	)
	if err != nil {
		return
	}
	return
}

func (d *DHT) Run() error {
	_ = d.Shutdown()

	command := []string{
		"docker", "run", "-d",
		"--name", d.server.HomeserverURL.Scheme +
			"_" + d.server.HomeserverURL.Hostname() +
			"_" + d.server.HomeserverURL.Port(),
		"-e", "SYNAPSE_SERVER_NAME=" + d.server.HomeserverURL.Hostname(),
		"-e", "SYNAPSE_REPORT_STATS=yes",
		"-e", "SYNAPSE_ENABLE_REGISTRATION=yes",
	}
	if d.server.HomeserverURL.Scheme == "http" {
		command = append(command, []string{
			"-e", "SYNAPSE_NO_TLS=1",
			"-p", d.server.HomeserverURL.Port() + ":8008",
		}...)
	} else {
		command = append(command, []string{
			"-p", d.server.HomeserverURL.Port() + ":8009",
		}...)
	}
	command = append(command, "matrixdotorg/synapse:latest")

	fmt.Printf("matrix run: %+v\n", command)

	cmd := exec.Command(command[0], command[1:]...)

	out, err := cmd.CombinedOutput()
	fmt.Printf("matrix run output: %+v\n", string(out))
	if err != nil {
		return err
	}

	// waiting for http
	retry := 0
	for {
		var err error
		if retry > 10 {
			return err
		}
		_, err = d.server.Versions()
		if err != nil {
			time.Sleep(time.Second)
			fmt.Println(err.Error())
			retry++
			continue
		}
		break
	}
	return nil
}

func (d *DHT) Shutdown() error {
	name := d.server.HomeserverURL.Scheme +
		"_" + d.server.HomeserverURL.Hostname() +
		"_" + d.server.HomeserverURL.Port()
	cmd := exec.Command(
		"docker", "stop", name)
	if err := cmd.Run(); err != nil {
		return err
	}
	cmd = exec.Command("docker", "rm", name)
	if err := cmd.Run(); err != nil {
		return err
	}
	return nil
}

func (d *DHT) Bootstrap(url string) error {
	bootstrap, err := gomatrix.NewClient(
		url,
		"@"+d.server.UserID+":"+d.server.HomeserverURL.Hostname(),
		"",
	)
	if err != nil {
		return err
	}

	d.bootstraps = append(d.bootstraps, bootstrap)
	if err := d.login(bootstrap); err != nil {
		if err := d.register(); err != nil {
			return err
		}
	}
	return nil
}

func (d *DHT) Put(key string, value interface{}) error {
	roomID, err := d.joinRoom(key)
	if err != nil {
		roomID, err = d.createRoom(key)
		if err != nil {
			return err
		}
	}

	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	if err := d.sendMessage(roomID, string(data)); err != nil {
		return err
	}
	return nil
}

func (d *DHT) Get(key string) (value interface{}, err error) {
	roomID, err := d.joinRoom(key)
	if err != nil {
		return nil, err
	}
	data, err := d.getMessage(roomID)
	if err != nil {
		return nil, err
	}
	if err := json.Unmarshal([]byte(data), &value); err != nil {
		return nil, err
	}
	return value, nil
}

func (*DHT) Remove(key string) error {
	return errors.New("not implemented")
}
