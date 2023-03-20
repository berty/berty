package config

// BertyConfig represents the configuration file defined in /config/config.yml
type BertyConfig struct {
	Berty struct {
		Contacts map[string]struct {
			Link        string `json:"link"`
			Name        string `json:"name"`
			Description string `json:"description"`
			Kind        string `json:"kind"`
			Suggestion  bool   `json:"suggestion"`
			Icon        string `json:"icon"`
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
		StaticRelays []string `json:"static-relays" yaml:"static-relays"`
	} `json:"p2p"`
}

func GetDefaultRDVPMaddr() []string {
	var defaultMaddrs []string
	{
		i := len(Config.P2P.RDVP)
		defaultMaddrs = make([]string, i)
		for i > 0 {
			i--
			defaultMaddrs[i] = Config.P2P.RDVP[i].Maddr
		}
	}

	return defaultMaddrs
}
