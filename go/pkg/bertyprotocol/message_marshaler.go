package bertyprotocol

import (
	"encoding/json"
	"fmt"
	"sync"

	"github.com/gogo/protobuf/proto"

	"berty.tech/berty/v2/go/internal/rendezvous"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/go-ipfs-log/enc"
	"berty.tech/go-ipfs-log/entry"
	"berty.tech/go-orbit-db/iface"
)

type RotationMessageMarshaler struct {
	rp    *rendezvous.RotationInterval
	sks   map[string]enc.SharedKey
	musks sync.RWMutex
}

func NewRotationMessageMarshaler(rp *rendezvous.RotationInterval) *RotationMessageMarshaler {
	return &RotationMessageMarshaler{
		sks: make(map[string]enc.SharedKey),
		rp:  rp,
	}
}

func (m *RotationMessageMarshaler) RegisterSharedKeyForTopic(topic string, sk enc.SharedKey) {
	m.musks.Lock()
	m.sks[topic] = sk
	m.musks.Unlock()
}

func (m *RotationMessageMarshaler) getSharedKeyFor(topic string) (sk enc.SharedKey, ok bool) {
	m.musks.RLock()
	sk, ok = m.sks[topic]
	m.musks.RUnlock()
	return
}

func (m *RotationMessageMarshaler) Marshal(msg *iface.MessageExchangeHeads) ([]byte, error) {
	topic := msg.Address

	point, err := m.rp.PointForTopic(topic)
	if err != nil {
		return nil, fmt.Errorf("unable to get rendezvous for period: %w", err)
	}

	// @TODO(gfanton): use protobuf for this ?
	heads, err := json.Marshal(msg.Heads)
	if err != nil {
		return nil, fmt.Errorf("unable to marshal heads: %w", err)
	}

	box := &protocoltypes.OrbitDBMessageHeads_Box{
		Address: msg.Address,
		Heads:   heads,
	}

	sealedBox, err := m.sealBox(msg.Address, box)
	if err != nil {
		return nil, fmt.Errorf("unable to seal box: %w", err)
	}

	msghead := protocoltypes.OrbitDBMessageHeads{
		RawRotation: point.RawRotationTopic(),
		SealedBox:   sealedBox,
	}

	payload, err := proto.Marshal(&msghead)
	if err != nil {
		return nil, fmt.Errorf("unable to marshal payload: %w", err)
	}

	return payload, nil
}

func (m *RotationMessageMarshaler) Unmarshal(payload []byte, msg *iface.MessageExchangeHeads) error {
	if msg == nil {
		msg = &iface.MessageExchangeHeads{}
	}

	msghead := protocoltypes.OrbitDBMessageHeads{}

	if err := proto.Unmarshal(payload, &msghead); err != nil {
		return fmt.Errorf("unable to unmarshal payload `%x`: %w", payload, err)
	}

	rotation := msghead.GetRawRotation()
	point, err := m.rp.PointForRawRotation(rotation)
	if err != nil {
		return fmt.Errorf("unable to get topic for rendezvous: %w", err)
	}

	box, err := m.openBox(point.Topic(), msghead.GetSealedBox())
	if err != nil {
		return fmt.Errorf("unable to open sealed box: %w", err)
	}

	var entries []*entry.Entry
	if err := json.Unmarshal(box.Heads, &entries); err != nil {
		return fmt.Errorf("unable to unmarshal entries: %w", err)
	}

	msg.Address = box.Address
	msg.Heads = entries
	return nil
}

func (m *RotationMessageMarshaler) sealBox(topic string, box *protocoltypes.OrbitDBMessageHeads_Box) ([]byte, error) {
	sk, ok := m.getSharedKeyFor(topic)
	if !ok {
		return nil, fmt.Errorf("unable to get shared key for topic")
	}

	rawBox, err := proto.Marshal(box)
	if err != nil {
		return nil, fmt.Errorf("unable to marshal box %w", err)
	}

	sealedBox, err := sk.Seal(rawBox)
	if err != nil {
		return nil, fmt.Errorf("unable to seal box: %w", err)
	}

	return sealedBox, nil
}

func (m *RotationMessageMarshaler) openBox(topic string, payload []byte) (*protocoltypes.OrbitDBMessageHeads_Box, error) {
	sk, ok := m.getSharedKeyFor(topic)
	if !ok {
		return nil, fmt.Errorf("unable to get shared key for topic")
	}

	rawBox, err := sk.Open(payload)
	if err != nil {
		return nil, fmt.Errorf("unable to open sealed box: %w", err)
	}

	box := &protocoltypes.OrbitDBMessageHeads_Box{}
	if err := proto.Unmarshal(rawBox, box); err != nil {
		return nil, fmt.Errorf("unable to unmarshal box: %w", err)
	}

	return box, nil
}
