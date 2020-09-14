package bertyprotocol

import (
	"bytes"
	"errors"

	"berty.tech/berty/v2/go/pkg/errcode"
	ipliface "berty.tech/go-ipfs-log/iface"
)

func getEntriesInRange(entries []ipliface.IPFSLogEntry, since, until []byte) ([]ipliface.IPFSLogEntry, error) {
	var (
		startIndex, stopIndex int
		startFound, stopFound bool
	)

	if since == nil {
		startFound = true
		startIndex = 0
	}
	if until == nil {
		stopFound = true
		stopIndex = len(entries) - 1
	}

	for i, entry := range entries {
		if startFound && stopFound {
			break
		}
		if !startFound && bytes.Equal(entry.GetHash().Bytes(), since) {
			startFound = true
			startIndex = i
		}
		if !stopFound && bytes.Equal(entry.GetHash().Bytes(), until) {
			stopFound = true
			stopIndex = i
		}
	}

	if !startFound {
		return nil, errcode.ErrInvalidRange.Wrap(errors.New("since ID not found"))
	}
	if !stopFound {
		return nil, errcode.ErrInvalidRange.Wrap(errors.New("until ID not found"))
	}
	if startIndex > stopIndex && len(entries) > 0 {
		return nil, errcode.ErrInvalidRange.Wrap(errors.New("since ID is after until ID"))
	}

	return entries[startIndex : stopIndex+1], nil
}

func iterateOverEntries(entries []ipliface.IPFSLogEntry, reverse bool, f func(ipliface.IPFSLogEntry)) {
	if reverse {
		for i := len(entries) - 1; i > -1; i-- {
			f(entries[i])
		}
	} else {
		for _, entry := range entries {
			f(entry)
		}
	}
}
