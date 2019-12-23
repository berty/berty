package storemember

import (
	"sync"

	ipfslog "berty.tech/go-ipfs-log"
	"berty.tech/go-orbit-db/iface"
	"berty.tech/go/internal/group"
	"berty.tech/go/internal/orbitutil/orbitutilapi"
	"berty.tech/go/internal/orbitutil/storegroup"
	"github.com/libp2p/go-libp2p-core/crypto"
)

type memberTree struct {
	membersByMember  map[string]*orbitutilapi.MemberEntry
	membersByDevice  map[string]*orbitutilapi.MemberEntry
	membersByInviter map[string][]*orbitutilapi.MemberEntry
	muMemberTree     sync.RWMutex
}

type memberStoreIndex struct {
	groupContext orbitutilapi.GroupContext

	members   *memberTree
	pending   []*orbitutilapi.MemberEntry
	muPending sync.RWMutex

	processed   map[string]struct{}
	muProcessed sync.RWMutex
}

func (m *memberStoreIndex) Get(key string) interface{} {
	return m.members
}

func (m *memberStoreIndex) processPending() {
	for {
		processed := 0

		// Copy the pending list so we can safely remove entries once processed
		m.muPending.RLock()
		toProcess := make([]*orbitutilapi.MemberEntry, len(m.pending))
		copy(toProcess, m.pending)
		m.muPending.RUnlock()

		for i, pending := range toProcess {
			// Check if inviter is already listed as a member
			inviterPubKeyBytes, _ := pending.Inviters[0].Raw()
			m.members.muMemberTree.RLock()
			_, inviterExists := m.members.membersByMember[string(inviterPubKeyBytes)]
			m.members.muMemberTree.RUnlock()

			if inviterExists || pending.Inviters[0].Equals(m.groupContext.GetGroup().PubKey) {
				// The inviter is already listed or this pending entry corresponds
				// to a device of the group creator (invited by group key pair)
				// so the pending member is ready to be processed
				memberPubKeyBytes, _ := pending.Member.Raw()
				devicePubKeyBytes, _ := pending.Devices[0].Raw()

				m.members.muMemberTree.Lock()
				member, memberExists := m.members.membersByMember[string(memberPubKeyBytes)]
				_, deviceExists := m.members.membersByDevice[string(devicePubKeyBytes)]

				if !memberExists {
					// Member doesn't exist, add it to the member tree
					m.members.membersByMember[string(memberPubKeyBytes)] = pending
					m.members.membersByDevice[string(devicePubKeyBytes)] = pending
					member = pending
				} else if !deviceExists {
					// Member already exists but device doesn't, add device to the tree
					member.Devices = append(member.Devices, pending.Devices[0])

					// Check if pending device was added by a different inviter
					found := false
					for _, inviter := range member.Inviters {
						if inviter.Equals(pending.Inviters[0]) {
							found = true
						}
					}
					if !found {
						// Inviter is not listed in member's inviters so list it
						member.Inviters = append(member.Inviters, pending.Inviters[0])
					}

					m.members.membersByDevice[string(devicePubKeyBytes)] = member
				}

				if !memberExists || !deviceExists {
					// Check if inviter is already indexed as inviter
					invitees, inviterExists := m.members.membersByInviter[string(inviterPubKeyBytes)]
					if !inviterExists {
						// Inviter doesn't indexed as inviter yet, add it to the member tree
						m.members.membersByInviter[string(inviterPubKeyBytes)] = []*orbitutilapi.MemberEntry{member}
					} else {
						// Inviter already indexed as inviter, check if pending member
						// is already listed as one of its invitee
						found := false
						for _, invitee := range invitees {
							if invitee.Member.Equals(member.Member) {
								found = true
							}
						}

						if !found {
							// Pending member is not listed as inviter's invitee so list it
							m.members.membersByInviter[string(inviterPubKeyBytes)] = append(invitees, member)
						}
					}

					// Send event containing new memberDevice
					memberDevice := &group.MemberDevice{
						Member: pending.Member,
						Device: pending.Devices[0],
					}
					eventNewMemberDevice := NewEventNewMemberDevice(memberDevice)
					m.groupContext.GetMemberStore().Emit(eventNewMemberDevice)
				}
				m.members.muMemberTree.Unlock()

				// Remove processed entry from pending list
				m.muPending.Lock()
				m.pending = append(m.pending[:i-processed], m.pending[i-processed+1:]...)
				m.muPending.Unlock()
				processed++
			}
		}

		if processed == 0 {
			// No entry processed during the last full list iteration, we can exit
			break
		}
	}
}

func (m *memberStoreIndex) UpdateIndex(log ipfslog.Log, entries []ipfslog.Entry) error {
	for _, e := range log.Values().Slice() {
		var err error
		entryHash := e.GetHash().String()

		m.muProcessed.RLock()
		_, ok := m.processed[entryHash]
		m.muProcessed.RUnlock()

		if !ok {
			m.muProcessed.Lock()
			m.processed[entryHash] = struct{}{}
			m.muProcessed.Unlock()

			var entryBytes []byte
			payload := &group.MemberEntryPayload{}

			if entryBytes, err = storegroup.UnwrapOperation(e); err != nil {
				continue
			}

			if err = group.OpenStorePayload(payload, entryBytes, m.groupContext.GetGroup()); err != nil {
				continue
			}

			if err = payload.CheckStructure(); err != nil {
				continue
			}

			memberDevice, err := payload.ToMemberDevice()
			if err != nil {
				continue
			}
			if _, err = memberDevice.Member.Raw(); err != nil {
				continue
			}
			if _, err = memberDevice.Device.Raw(); err != nil {
				continue
			}

			inviterPubKey, err := crypto.UnmarshalEd25519PublicKey(payload.InviterMemberPubKey)
			if err != nil {
				continue
			}
			if _, err = inviterPubKey.Raw(); err != nil {
				continue
			}

			newPendingMember := &orbitutilapi.MemberEntry{
				Member:   memberDevice.Member,
				Devices:  []crypto.PubKey{memberDevice.Device},
				Inviters: []crypto.PubKey{inviterPubKey},
			}

			m.muPending.Lock()
			m.pending = append(m.pending, newPendingMember)
			m.muPending.Unlock()
		}
	}

	m.processPending()

	return nil
}

// NewMemberStoreIndex returns a new index to manage the list of the group members
func NewMemberStoreIndex(g orbitutilapi.GroupContext) iface.IndexConstructor {
	return func(publicKey []byte) iface.StoreIndex {
		return &memberStoreIndex{
			groupContext: g,
			members: &memberTree{
				membersByMember:  map[string]*orbitutilapi.MemberEntry{},
				membersByDevice:  map[string]*orbitutilapi.MemberEntry{},
				membersByInviter: map[string][]*orbitutilapi.MemberEntry{},
			},
			processed: map[string]struct{}{},
		}
	}
}

var _ iface.StoreIndex = &memberStoreIndex{}
