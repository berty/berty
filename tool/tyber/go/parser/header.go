package parser

import (
	"encoding/json"
	"time"

	"github.com/pkg/errors"
)

type Header struct {
	baseLog

	// Manager is a copy of go/internal/initutil/manager.go's Manager.
	// We can inherit the real struct as soon as initutil becomes public.
	Manager struct {
		Logging struct {
			Format      string `json:"Format,omitempty"`
			Logfile     string `json:"Logfile,omitempty"`
			Filters     string `json:"Filters,omitempty"`
			Tracer      string `json:"Tracer,omitempty"`
			Service     string `json:"Service,omitempty"`
			RingFilters string `json:"RingFilters,omitempty"`
			RingSize    uint   `json:"RingSize,omitempty"`
		} `json:"logging,omitempty"`
		Metrics struct {
			Listener string `json:"listener,omitempty"`
			Pedantic bool   `json:"pedantic,omitempty"`
		} `json:"metrics,omitempty"`
		Datastore struct {
			Dir      string `json:"dir,omitempty"`
			InMemory bool   `json:"inMemory,omitempty"`
		} `json:"datastore,omitempty"`
		Node struct {
			Preset   string `json:"preset"`
			Protocol struct {
				SwarmListeners    string `json:"swarmListeners,omitempty"`
				IPFSAPIListeners  string `json:"iPFSAPIListeners,omitempty"`
				IPFSWebUIListener string `json:"iPFSWebUIListener,omitempty"`
				Announce          string `json:"announce,omitempty"`
				NoAnnounce        string `json:"noAnnounce,omitempty"`
				LocalDiscovery    bool   `json:"localDiscovery,omitempty"`
				Ble               struct {
					Enable bool `json:"Enable,omitempty"`
				}
				Nearby struct {
					Enable bool `json:"Enable,omitempty"`
				}
				MultipeerConnectivity bool          `json:"MultipeerConnectivity,omitempty"`
				MinBackoff            time.Duration `json:"minBackoff,omitempty"`
				MaxBackoff            time.Duration `json:"maxBackoff,omitempty"`
				DisableIPFSNetwork    bool          `json:"disableIPFSNetwork,omitempty"`
				RdvpMaddrs            string        `json:"rdvpMaddrs,omitempty"`
				AuthSecret            string        `json:"authSecret,omitempty"`
				AuthPublicKey         string        `json:"authPublicKey,omitempty"`
				PollInterval          time.Duration `json:"pollInterval,omitempty"`
				Tor                   struct {
					Mode       string `json:"mode,omitempty"`
					BinaryPath string `json:"binaryPath,omitempty"`
				} `json:"tor,omitempty"`
			}
			Messenger struct {
				DisableGroupMonitor  bool   `json:"disableGroupMonitor,omitempty"`
				DisplayName          string `json:"displayName,omitempty"`
				DisableNotifications bool   `json:"disableNotifications,omitempty"`
				RebuildSqlite        bool   `json:"rebuildSqlite,omitempty"`
				MessengerSqliteOpts  string `json:"messengerSqliteOpts,omitempty"`
				ExportPathToRestore  string `json:"exportPathToRestore,omitempty"`
			}
			GRPC struct {
				RemoteAddr string `json:"remoteAddr,omitempty"`
				Listeners  string `json:"listeners,omitempty"`
			} `json:"gRPC,omitempty"`
		} `json:"node,omitempty"`
		InitTimeout time.Duration `json:"initTimeout,omitempty"`
		Session     struct {
			ID   string `json:"id,omitempty"`
			Kind string `json:"kind,omitempty"`
		} `json:"session,omitempty"`
	} `json:"manager"`
}

func (s *Session) parseHeader() error {
	h := &Header{}
	for s.srcScanner.Scan() {
		log := s.srcScanner.Text()
		if err := json.Unmarshal([]byte(log), h); err != nil {
			return err
		}

		if h.Manager.Session.ID != "" {
			break
		}
	}

	if h.Manager.Session.ID == "" {
		return errors.New("invalid log: header not found")
	}

	// TODO: add other checks

	h.epochToTime()
	s.Header = h
	s.ID = h.Manager.Session.ID
	s.DisplayName = h.Manager.Node.Messenger.DisplayName
	s.Started = h.Time

	return nil
}
