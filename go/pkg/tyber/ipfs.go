package tyber

import (
	ipfscid "github.com/ipfs/go-cid"
)

func WithCIDDetail(name string, cidBytes []byte) StepMutator {
	cid, err := ipfscid.Cast(cidBytes)
	if err != nil {
		return func(s Step) Step { return s }
	}
	return func(s Step) Step {
		s.Details = append(s.Details, Detail{Name: name, Description: cid.String()})
		return s
	}
}
