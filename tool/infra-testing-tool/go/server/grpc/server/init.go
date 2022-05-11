package server

import (
	"context"
	"fmt"
	"infratesting/logging"
	"math/rand"
	"strings"
	"sync"
	"time"

	"github.com/mathisve/ec2ifupifdown"
	ps "github.com/mitchellh/go-ps"
)

var (
	processLock      sync.Mutex
	isProcessRunning bool

	processNames = []string{"berty", "rdvp"}
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
				process := processList[x]

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

func (s *Server) ReliabilityProcess() {
	go func() {
		for {
			// no reliability configured, sleep for 1 second
			if s.Reliability.Timeout == 0 && s.Reliability.Odds == 0 {
				time.Sleep(1 * time.Second)
			} else if !s.ReliabilityRunning {
				time.Sleep(1 * time.Second)
			} else {
				if rand.Intn(int(s.Reliability.Odds)) == 0 {
					interfaces, err := ec2ifupifdown.GetInterfaces()
					if err != nil {
						logging.LogErr(err)
					}

					logging.Log(fmt.Sprintf("disabling networking for %d seconds", s.Reliability.Timeout))

					for _, interf := range interfaces {
						if interf.DeviceNumber != 0 {
							err = interf.Ifdown()
							if err != nil {
								logging.LogErr(err)
							}
						}
					}

					time.Sleep(time.Duration(s.Reliability.Timeout) * time.Second)

					for _, interf := range interfaces {
						if interf.DeviceNumber != 0 {
							err = interf.Ifup()
							if err != nil {
								logging.LogErr(err)
							}
						}
					}

				} else {
					time.Sleep(time.Duration(s.Reliability.Timeout) * time.Second)
				}
			}
		}
	}()
}
