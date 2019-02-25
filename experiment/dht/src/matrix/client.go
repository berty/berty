package matrix

import (
	"errors"
	"fmt"

	"github.com/matrix-org/gomatrix"
)

func (b *Bootstrap) register(username, password string) error {
	var resp *gomatrix.RespRegister
	var err error

	fmt.Printf(
		"\nmatrix bootstrap %+v register:\n username: %+v\n password; %+v\n",
		b.HomeserverURL.Hostname(),
		username,
		password,
	)
	resp, err = b.RegisterDummy(&gomatrix.ReqRegister{
		Username: username,
		Password: password,
	})
	if err != nil {
		fmt.Printf(" err: %+v\n", err.Error())
		return err
	}
	b.SetCredentials(resp.UserID, resp.AccessToken)
	return nil
}

func (b *Bootstrap) login(username, password string) error {
	var resp *gomatrix.RespLogin
	var err error

	fmt.Printf(
		"\nmatrix bootstrap %+v login:\n username: %+v\n password: %+v\n",
		b.HomeserverURL.Hostname(),
		username,
		password,
	)
	resp, err = b.Login(&gomatrix.ReqLogin{
		Type:     "m.login.password",
		User:     username,
		Password: password,
	})
	if err != nil {
		fmt.Printf(" err: %+v\n", err.Error())
		return err
	}
	b.SetCredentials(resp.UserID, resp.AccessToken)
	return nil
}

func (b *Bootstrap) createRoom(alias string) (string, error) {
	var resp *gomatrix.RespCreateRoom
	var err error
	// use server as first bootstrap
	fmt.Printf(
		"\nmatrix create room:\n bootstrap: %+v\n room: %+v\n",
		b.HomeserverURL.Hostname(),
		alias,
	)
	resp, err = b.CreateRoom(&gomatrix.ReqCreateRoom{
		Preset:        "public_chat",
		Visibility:    "private",
		Name:          alias,
		RoomAliasName: alias,
	})
	if err != nil {
		fmt.Printf(" err: %+v\n", err.Error())
		return "", err
	}
	b.rooms[alias] = resp.RoomID
	return resp.RoomID, nil
}

func (b *Bootstrap) joinRoom(alias string, serverName string) (string, error) {
	var err error
	var resp *gomatrix.RespJoinRoom

	fmt.Printf(
		"\nmatrix join room:\n bootstrap: %+v\n room: %+v\n",
		b.HomeserverURL.Hostname(),
		alias,
	)

	roomID, ok := b.rooms[alias]
	if ok {
		return roomID, nil
	}

	resp, err = b.JoinRoom(
		alias,
		serverName,
		nil,
	)
	if err != nil {
		fmt.Printf(" err: %+v\n", err.Error())
		return "", err
	}

	b.rooms[alias] = resp.RoomID
	return resp.RoomID, nil
}

func (b *Bootstrap) sendMessage(roomID, message string) (err error) {
	fmt.Printf(
		"\nmatrix send message:\n bootstrap: %+v\n roomID: %+v\n",
		b.HomeserverURL.Hostname(),
		roomID,
	)
	_, err = b.SendText(roomID, message)
	if err != nil {
		fmt.Printf(" err: %+v\n", err)
		return err
	}
	return nil
}

func (b *Bootstrap) getMessage(roomID string) (message string, err error) {
	var resp *gomatrix.RespMessages

	fmt.Printf(
		"\nmatrix get message:\n bootstrap: %+v\n roomID: %+v\n",
		b.HomeserverURL.Hostname(),
		roomID,
	)

	resp, err = b.Messages(roomID, "", "", 'b', 1)
	if err != nil {
		fmt.Printf(" err: %+v\n", err.Error())
		return "", err
	}

	if len(resp.Chunk) == 0 {
		fmt.Printf(" err: %+v\n", err.Error())
		return "", err
	}

	// TODO: Improve finding message
	// - Check user identity of message
	// - ...

	event := resp.Chunk[0]
	ok := true
	message, ok = event.Content["body"].(string)
	if !ok {
		err = errors.New("err: message not a string")
		fmt.Printf(" err: %+v\n", err.Error())
		return "", err
	}
	return message, nil
}
