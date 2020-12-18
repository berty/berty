package protocoltypes

// Config represents the configuration file defined in /config/config.yml
type Config struct {
	Berty struct {
		Contacts map[string]struct {
			Link        string `json:"link"`
			Name        string `json:"name"`
			Description string `json:"description"`
			Kind        string `json:"kind"`
			Suggestion  bool   `json:"suggestion"`
		} `json:"contacts"`
		Conversations map[string]struct {
			Link        string `json:"link"`
			Name        string `json:"name"`
			Description string `json:"description"`
			Suggestion  bool   `json:"suggestion"`
		} `json:"conversations"`
	} `json:"berty"`
	P2P struct {
		RDVP []struct {
			Maddr string `json:"maddr"`
		} `json:"rdvp"`
		RelayHack []string `json:"relayHack" yaml:"relayHack"`
	} `json:"p2p"`
}
