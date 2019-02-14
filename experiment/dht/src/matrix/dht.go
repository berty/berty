package matrix

import (
	"encoding/json"
	"errors"
	"fmt"
	"os/exec"
	"strconv"
	"time"

	"berty.tech/experiment/dht"
	"github.com/matrix-org/gomatrix"
)

var _ dht.DHT = (*DHT)(nil)

type DHT struct {
	name      string
	data_path string
	host      string
	port      int

	client *gomatrix.Client

	username string
	password string

	roomID string
}

type Options struct {
	Name     string
	Username string
	Password string
}

func New(opts *Options) *DHT {
	if opts.Name == "" {
		opts.Name = "localhost"
	}
	if opts.Username == "" {
		opts.Username = "berty"
	}
	return &DHT{
		name:      opts.Name,
		data_path: "/tmp/data",
		host:      "localhost",
		username:  opts.Username,
		password:  opts.Password,
	}
}

func (d *DHT) Run(port int) error {
	if port == 0 {
		port = 8008
	}
	_ = d.Shutdown()

	command := []string{"docker", "run",
		"-d",
		"--name", d.name,
		"-v", d.data_path + ":/data",
		"-e", "SYNAPSE_SERVER_NAME=" + d.name,
		"-e", "SYNAPSE_REPORT_STATS=yes",
		"-e", "SYNAPSE_NO_TLS=1",
		"-e", "SYNAPSE_ENABLE_REGISTRATION=yes",
		"-e", "SYNAPSE_ALLOW_GUEST=yes",
		"-p", fmt.Sprintf("%+v", port) + ":8008",
		"matrixdotorg/synapse:latest",
	}
	fmt.Printf("\nrun matrix synapse: %+v\n", command)

	cmd := exec.Command(command[0], command[1:]...)

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return err
	}

	go func() {
		logs := make([]byte, 1024)
		for {
			if _, err = stdout.Read(logs); err == nil {
				fmt.Print(string(logs))
				continue
			}
		}
	}()

	if err := cmd.Start(); err != nil {
		return err
	}

	if err := cmd.Wait(); err != nil {
		return err
	}

	d.port = port
	// waiting for http
	client, err := gomatrix.NewClient(
		fmt.Sprintf("http://%+v:%+v", d.host, d.port),
		"",
		"",
	)
	retry := 0
	for {
		var err error
		if retry > 10 {
			return err
		}
		_, err = client.Versions()
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
	cmd := exec.Command("docker", "stop", d.name)
	if err := cmd.Run(); err != nil {
		return err
	}
	cmd = exec.Command("docker", "rm", d.name)
	if err := cmd.Run(); err != nil {
		return err
	}
	return nil
}

func (d *DHT) register() error {
	register, err := d.client.RegisterDummy(&gomatrix.ReqRegister{
		Username: d.username,
		Password: d.password,
	})
	if err != nil {
		fmt.Println(err.Error())
		return err
	}
	d.client.SetCredentials(register.UserID, register.AccessToken)
	return nil
}

func (d *DHT) login() error {
	login, err := d.client.Login(&gomatrix.ReqLogin{
		User:     d.username,
		Password: d.password,
		Type:     "m.login.password",
	})
	if err != nil {
		return err
	}
	d.client.SetCredentials(login.UserID, login.AccessToken)
	return nil
}

func (d *DHT) Bootstrap(host string, port string) (err error) {
	if host == "" {
		host = "localhost"
	}
	if port == "" {
		port = "8008"
	}

	d.host = host
	d.port, err = strconv.Atoi(port)
	if err != nil {
		return err
	}

	d.client, err = gomatrix.NewClient(
		fmt.Sprintf("http://%+v:%+v", d.host, d.port),
		"@"+d.username+":"+d.host,
		"",
	)
	if err != nil {
		return err
	}

	if err := d.login(); err != nil {
		return d.register()
	}

	return nil
}

func (d *DHT) createRoom(alias string) error {
	resp, err := d.client.CreateRoom(&gomatrix.ReqCreateRoom{
		Visibility:    "public", // see if it can be private
		RoomAliasName: "#" + alias + ":" + d.host,
		Name:          alias,
	})
	if err != nil {
		fmt.Printf("err: matrix create room: %+v\n", err.Error())
		return err
	}
	d.roomID = resp.RoomID
	return nil
}

func (d *DHT) joinRoom(alias string) error {
	resp, err := d.client.JoinRoom("#"+alias+":"+d.host, d.host, nil)
	if err != nil {
		fmt.Printf("err: matrix join room: %+v\n", err.Error())
		return err
	}
	d.roomID = resp.RoomID
	return nil
}

func (d *DHT) sendMessage(message string) error {
	_, err := d.client.SendText(d.roomID, message)
	if err != nil {
		fmt.Printf("err: matrix send text: %+v\n", err.Error())
		return err
	}
	return nil
}

func (d *DHT) Put(key string, value interface{}) error {
	if err := d.joinRoom(key); err != nil {
		if d.createRoom(key); err != nil {
			return err
		}
	}
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	if err := d.sendMessage(string(data)); err != nil {
		return err
	}
	return nil
}

func (d *DHT) getMessage() (string, error) {
	resp, err := d.client.Messages(d.roomID, "", "", 'b', 1)
	if err != nil {
		return "", err
	}
	if len(resp.Chunk) == 0 {
		return "", errors.New("err: no messages")
	}
	// TODO: Improve finding message
	// - Check user identity of message
	// - ...
	event := resp.Chunk[0]
	message, ok := event.Content["body"].(string)
	if !ok {
		return "", errors.New("err: message not a string")
	}
	return message, nil
}

func (d *DHT) Get(key string) (value interface{}, err error) {
	if err := d.joinRoom(key); err != nil {
		return nil, err
	}
	data, err := d.getMessage()
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
