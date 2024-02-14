package server

import (
	"context"
	"math/rand"
	"strings"
	"sync"
	"time"

	"github.com/mathisve/ec2ifupifdown"
	ps "github.com/mitchellh/go-ps"
	"go.uber.org/zap"
)

var (
	processLock      sync.Mutex
	once             sync.Once
	isProcessRunning bool

	processNames = []string{"berty", "rdvp"}
)

// StartProcessCheck checks if a berty daemon/rdvp is running
func startProcessCheck(logger *zap.Logger) {
	once.Do(func() {
		for {
			processList, err := ps.Processes()
			if err != nil {
				logger.Error("unable to list process", zap.Error(err))
			} else {
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
			}

			time.Sleep(time.Second * 3)
		}
	})
}

// ProcessRunning returns true if a berty daemon is running
func ProcessRunning() bool {
	processLock.Lock()
	defer processLock.Unlock()

	return isProcessRunning
}

func (s *Server) IsProcessRunning(ctx context.Context, request *IsProcessRunning_Request) (response *IsProcessRunning_Response, err error) {
	return &IsProcessRunning_Response{Running: ProcessRunning()}, nil
}

func (s *Server) ReliabilityProcess() {
	go func() {
		timeout := time.Duration(s.Reliability.Timeout) * time.Second
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
						s.logger.Error("unable to get interfaces", zap.Error(err))
					}

					s.logger.Debug("disabling networking", zap.Duration("timeout", timeout))

					for _, interf := range interfaces {
						if interf.DeviceNumber != 0 {
							err = interf.Ifdown()
							if err != nil {
								s.logger.Error("disabling networking ", zap.Error(err))
							}
						}
					}

					time.Sleep(timeout)

					for _, interf := range interfaces {
						if interf.DeviceNumber != 0 {
							err = interf.Ifup()
							if err != nil {
								s.logger.Error("enable networking back ", zap.Error(err))
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
