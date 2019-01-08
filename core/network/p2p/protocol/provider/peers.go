package provider

import pstore "github.com/libp2p/go-libp2p-peerstore"

type Peers []*pstore.PeerInfo

func (ps Peers) add(pi *pstore.PeerInfo) Peers {
	for _, p := range ps {
		if pi.ID == p.ID {
			return ps
		}
	}

	return append(ps, pi)
}

func (ps Peers) remove(pi *pstore.PeerInfo) Peers {
	for i, p := range ps {
		if pi.ID == p.ID {
			return append(ps[:i], ps[i+1:]...)
		}
	}

	return ps
}

func (ps Peers) exist(pi *pstore.PeerInfo) bool {
	for _, p := range ps {
		if pi.ID == p.ID {
			return true
		}
	}

	return false
}
