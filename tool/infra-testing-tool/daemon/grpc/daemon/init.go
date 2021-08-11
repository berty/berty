package daemon

import (
	"context"
	"fmt"
	ps "github.com/mitchellh/go-ps"
	"infratesting/logging"
	"strings"
	"sync"
	"time"
)

var (
	processLock sync.Mutex
	isProcessRunning bool

	processNames = []string {"berty", "rdvp"}
)

func init() {
	StartProcessCheck()
}

// StartProcessCheck checks if a berty daemon/rdvp is running
func StartProcessCheck() {
	go func() {
		for {
			processList, err := ps.Processes()
			if err != nil {
				logging.Log(err.Error())
			}

			processLock.Lock()
			isProcessRunning = false
			for x := range processList {
				var process ps.Process
				process = processList[x]


				for p := range processNames {
					if strings.Contains(process.Executable(), processNames[p]) {
						isProcessRunning = true
					}
				}
			}
			processLock.Unlock()

			time.Sleep(time.Second * 3)
		}
	}()
}

// ProcessRunning returns true if a berty daemon is running
func ProcessRunning() bool {
	processLock.Lock()
	defer processLock.Unlock()

	return isProcessRunning
}

func (s *Server) IsProcessRunning(ctx context.Context, request *IsProcessRunning_Request) (response *IsProcessRunning_Response, err error) {
	logging.Log(fmt.Sprintf("IsProcessRunning - incoming request: %+v", request))

	return &IsProcessRunning_Response{Running: ProcessRunning()}, nil
}
