package matrix

import (
	"errors"
	"fmt"

	"github.com/matrix-org/gomatrix"
)

func (d *DHT) register() (err error) {
	var resp *gomatrix.RespRegister

	fmt.Printf("\nmatrix register:\n username: %+v\n", d.server.UserID)
	resp, err = d.server.RegisterDummy(&gomatrix.ReqRegister{
		Username: d.server.UserID,
		Password: d.password,
	})
	if err != nil {
		fmt.Printf(" err: %+v", err.Error())
		return err
	}
	fmt.Printf("\nmatrix set credential:\n userID: %+v\n accessToken: %+v\n", resp.UserID, resp.AccessToken)

	// TODO: use random bootstrap as server used to register
	// Will permit to use any host for any peer
	// We SHOULD provide matrix user host to contacts

	// use server as first bootstrap
	bootstraps := append([]*gomatrix.Client{d.server}, d.bootstraps...)
	for _, bootstrap := range bootstraps {
		bootstrap.SetCredentials(resp.UserID, resp.AccessToken)
	}
	return nil
}

func (d *DHT) login(client *gomatrix.Client) error {
	var resp *gomatrix.RespLogin
	var err error

	user := "@" + d.server.UserID + ":" + d.server.HomeserverURL.Hostname()
	fmt.Printf("\nmatrix login:\n user: %+v\n", user)
	resp, err = client.Login(&gomatrix.ReqLogin{
		User:     user,
		Password: d.password,
		Type:     "m.login.password",
	})
	if err != nil {
		fmt.Printf(" err: %+v", err.Error())
		return err
	}

	fmt.Printf("\nmatrix set credential:\n userID %+v\n accessToken %+v\n", resp.UserID, resp.AccessToken)

	// use server as first bootstrap
	bootstraps := append([]*gomatrix.Client{d.server}, d.bootstraps...)
	for _, bootstrap := range bootstraps {
		bootstrap.SetCredentials(resp.UserID, resp.AccessToken)
	}
	return nil
}

func (d *DHT) createRoom(alias string) (string, error) {
	// use server as first bootstrap
	fmt.Printf("\nmatrix create room:\n server: %+v\n room: %+v\n", d.server.HomeserverURL.Hostname(), alias)
	resp, err := d.server.CreateRoom(&gomatrix.ReqCreateRoom{
		Preset:        "public_chat",
		Visibility:    "private",
		Name:          alias,
		RoomAliasName: alias,
	})
	if err != nil {
		fmt.Printf(" err: %+v\n", err.Error())
		return "", err
	}
	return resp.RoomID, nil
}

func (d *DHT) joinRoom(alias string) (string, error) {
	var err error
	// use server as first bootstrap
	bootstraps := append([]*gomatrix.Client{d.server}, d.bootstraps...)
	for _, bootstrap := range bootstraps {
		var resp *gomatrix.RespJoinRoom
		room := "#" + alias
		room = room + ":" + d.server.HomeserverURL.Hostname()
		fmt.Printf("\nmatrix join room:\n bootstrap: %+v\n room: %+v\n", bootstrap.HomeserverURL, room)
		resp, err = bootstrap.JoinRoom(
			room,
			"",
			nil,
		)
		if err != nil {
			fmt.Printf(" err: %+v\n", err.Error())
			continue
		}
		return resp.RoomID, err
	}
	return "", err
}

func (d *DHT) sendMessage(roomID, message string) (err error) {
	// use server as first bootstrap
	bootstraps := append([]*gomatrix.Client{d.server}, d.bootstraps...)
	for _, bootstrap := range bootstraps {
		fmt.Printf("\nmatrix send message:\n bootstrap: %+v\n roomID: %+v\n", bootstrap.HomeserverURL, roomID)

		_, err = bootstrap.SendText(roomID, message)
		if err != nil {
			continue
		}
		return nil
	}
	return err
}

func (d *DHT) getMessage(roomID string) (message string, err error) {
	var resp *gomatrix.RespMessages

	// use server as first bootstrap
	bootstraps := append([]*gomatrix.Client{d.server}, d.bootstraps...)
	for _, bootstrap := range bootstraps {
		fmt.Printf("\nmatrix get message:\n bootstrap: %+v\n roomID: %+v\n", bootstrap.HomeserverURL, roomID)

		resp, err = bootstrap.Messages(roomID, "", "", 'b', 1)
		if err != nil {
			continue
		}

		if len(resp.Chunk) == 0 {
			return "", errors.New("err: no messages")
		}

		// TODO: Improve finding message
		// - Check user identity of message
		// - ...

		event := resp.Chunk[0]
		ok := true
		message, ok = event.Content["body"].(string)
		if !ok {
			return "", errors.New("err: message not a string")
		}
		return message, err
	}
	return "", err
}
