package bertyconfig

type Config struct {
	Berty struct {
		Contacts map[string]struct {
			Link string `json:"link"`
		} `json:"contacts"`
	} `json:"berty"`
	P2P struct {
		RDVP []struct {
			Maddr string `json:"maddr"`
		} `json:"rdvp"`
	} `json:"p2p"`
}
