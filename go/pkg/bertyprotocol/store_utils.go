package bertyprotocol

import (
	"bytes"
	"errors"
	"fmt"
	mrand "math/rand"
	"strings"
	"time"

	"berty.tech/berty/v2/go/pkg/errcode"
	ipfslog "berty.tech/go-ipfs-log"
	ipliface "berty.tech/go-ipfs-log/iface"
	"berty.tech/go-orbit-db/events"
	"berty.tech/go-orbit-db/stores"
	"go.uber.org/zap"
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

func entryFromEvent(e events.Event, addr string, l *zap.Logger) ipfslog.Entry {
	var kind string

	topic, ok := MatchOrbitdbTopic(addr)
	if !ok {
		topic = addr
		kind = "UNKNOWN"
	} else {
		kind = strings.Split(topic, ":")[1]
	}

	logEvent := func(eFields ...zap.Field) {
		logger := l.Named("gmon")
		cFields := []zap.Field{
			zap.String("topic", topic),
			zap.String("category", "orbitDBEvent"),
		}

		logger.Debug(
			fmt.Sprintf("Event %s store", kind),
			append(cFields, eFields...)...,
		)
	}

	entry := ipfslog.Entry(nil)

	switch evt := e.(type) {
	case *stores.EventWrite:
		entry = evt.Entry
		logEvent(zap.String("type", "EventWrite"))

	case *stores.EventReplicateProgress:
		entry = evt.Entry
		logEvent(zap.String("type", "EventReplicateProgress"))

	case *stores.EventReplicate:
		logEvent(zap.String("type", "EventReplicate"))

	case *stores.EventReplicated:
		logEvent(zap.String("type", "EventReplicated"))

	case *stores.EventLoad:
		logEvent(zap.String("type", "EventLoad"))

	case *stores.EventReady:
		logEvent(zap.String("type", "EventReady"))

	case *stores.EventNewPeer:
		logEvent(zap.String("type", "EventNewPeer"))
	}

	return entry
}

func debugGroupContext(gc *GroupContext, caller string) {
	logger := gc.logger.Named("gmon")
	fields := []zap.Field{
		zap.String("category", "storeEntries"),
		zap.Int("runID", mrand.New(mrand.NewSource(time.Now().UnixNano())).Intn(1000000)),
	}

	getFields := func(addr string) []zap.Field {
		topic, ok := MatchOrbitdbTopic(addr)
		if ok {
			return append(fields, zap.String("topic", topic))
		}

		return append(fields, zap.String("topic", addr))
	}

	getFieldsWithParents := func(addr string, entry ipliface.IPFSLogEntry) []zap.Field {
		var parents []string

		for _, parent := range entry.GetNext() {
			parents = append(parents, parent.String())
		}

		return append(getFields(addr), zap.Strings("parents", parents))
	}

	logger.Debug(fmt.Sprintf("%s prints metadata store heads", caller), getFields(gc.MetadataStore().Address().String())...)
	for _, head := range gc.MetadataStore().BaseStore.OpLog().Heads().Slice() {
		logger.Debug(head.GetHash().String(), getFieldsWithParents(gc.MetadataStore().Address().String(), head)...)
	}
	logger.Debug(fmt.Sprintf("%s prints metadata store entries", caller), getFields(gc.MetadataStore().Address().String())...)
	for _, entry := range gc.MetadataStore().BaseStore.OpLog().GetEntries().Slice() {
		logger.Debug(entry.GetHash().String(), getFieldsWithParents(gc.MetadataStore().Address().String(), entry)...)
	}

	logger.Debug(fmt.Sprintf("%s prints message store heads", caller), getFields(gc.MessageStore().Address().String())...)
	for _, head := range gc.MessageStore().BaseStore.OpLog().Heads().Slice() {
		logger.Debug(head.GetHash().String(), getFieldsWithParents(gc.MessageStore().Address().String(), head)...)
	}
	logger.Debug(fmt.Sprintf("%s prints message store entries", caller), getFields(gc.MessageStore().Address().String())...)
	for _, entry := range gc.MessageStore().BaseStore.OpLog().GetEntries().Slice() {
		logger.Debug(entry.GetHash().String(), getFieldsWithParents(gc.MessageStore().Address().String(), entry)...)
	}
}
