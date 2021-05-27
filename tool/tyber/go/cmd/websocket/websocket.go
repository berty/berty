package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"

	"berty.tech/berty/tool/tyber/go/bridge"
	"github.com/gorilla/websocket"
	"go.uber.org/multierr"
)

type wsrcv = func(string, []byte) error

type wsb struct {
	receivers      map[*wsrcv]struct{}
	receiversMutex *sync.RWMutex
	conns          map[*websocket.Conn]struct{}
	connsMutex     *sync.RWMutex
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(_ *http.Request) bool { return true },
}

func newWebsocketBridge() *wsb {
	wb := wsb{
		conns:          make(map[*websocket.Conn]struct{}),
		connsMutex:     &sync.RWMutex{},
		receivers:      make(map[*wsrcv]struct{}),
		receiversMutex: &sync.RWMutex{},
	}
	return &wb
}

func (wb *wsb) runServer(serverAddress string) error {
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			fmt.Printf("failed to upgrade conn to websocket: %s\n", err.Error())
			return
		}

		wb.addConn(conn)
		defer wb.removeConn(conn)

		fmt.Println("new conn")

		for {
			// Read message from browser
			msgType, msgBytes, err := conn.ReadMessage()
			if err != nil {
				return
			}
			fmt.Println("received", msgType, string(msgBytes), "from browser")

			var msg struct {
				Name    string `json:"name"`
				Payload string `json:"payload"`
			}
			if err := json.Unmarshal(msgBytes, &msg); err != nil {
				fmt.Println("failed to unmarshal message", err)
				continue
			}
			fmt.Println("received event", msg.Name, msg.Payload, "from browser")
			if err := wb.receive(msg.Name, []byte(msg.Payload)); err != nil {
				fmt.Printf("failed to propagate websocket msg: %s\n", err.Error())
			}
		}
	})
	return http.ListenAndServe(serverAddress, nil)
}

func (w *wsb) receive(name string, msg []byte) error {
	w.receiversMutex.RLock()
	defer w.receiversMutex.RUnlock()
	err := error(nil)
	for r := range w.receivers {
		err = multierr.Append(err, (*r)(name, msg))
	}
	return err
}

func (w *wsb) addConn(conn *websocket.Conn) {
	if conn == nil {
		return
	}
	w.connsMutex.Lock()
	defer w.connsMutex.Unlock()
	w.conns[conn] = struct{}{}
}

func (w *wsb) removeConn(conn *websocket.Conn) {
	if conn == nil {
		return
	}
	w.connsMutex.Lock()
	defer w.connsMutex.Unlock()
	delete(w.conns, conn)
}

func (w *wsb) AddReceiver(cb *wsrcv) {
	if cb == nil {
		return
	}
	w.receiversMutex.Lock()
	defer w.receiversMutex.Unlock()
	w.receivers[cb] = struct{}{}
}

func (w *wsb) RemoveReceiver(cb *wsrcv) {
	if cb == nil {
		return
	}
	w.receiversMutex.Lock()
	defer w.receiversMutex.Unlock()
	delete(w.receivers, cb)
}

func (w *wsb) Send(name string, msg []byte) error {
	w.connsMutex.RLock()
	defer w.connsMutex.RUnlock()
	err := error(nil)
	for c := range w.conns {
		m, oerr := json.Marshal(struct {
			Name    string `json:"name"`
			Payload string `json:"payload"`
		}{Name: name, Payload: string(msg)})
		if oerr != nil {
			err = multierr.Append(err, oerr)
			continue
		}
		err = multierr.Append(err, c.WriteMessage(1, m))
	}
	return err
}

var _ bridge.WebsocketBridge = (*wsb)(nil)
