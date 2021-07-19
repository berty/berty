package config

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
