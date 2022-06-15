package analyzer

import (
	"encoding/json"
	"errors"
	"time"

	"berty.tech/berty/tool/tyber/go/parser"
	mt "berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/tyber"
)

type Message struct {
	GroupPK            string    `json:"groupPK"`
	CID                string    `json:"cid"`
	SenderPK           string    `json:"senderPK"`
	ReceiverPKs        []string  `json:"receiverPKs"`
	MissingReceiverPKs []string  `json:"missinReceiverPKs"`
	Started            time.Time `json:"started"`
	Finished           time.Time `json:"finished"`
	Succeeded          bool      `json:"succeeded"`
}

func NewMessage() *Message {
	return &Message{
		Succeeded: false,
	}
}

func (m *Message) parseSenderTrace(trace *parser.AppTrace) error {
	for _, step := range trace.Steps {
		switch step.Name {
		case "Got group context":
			m.Started = step.Started
			if err := m.parseGroupContext(step.Details); err != nil {
				return err
			}
		case "Operation parsed by orbit-DB successfully":
			if err := m.parseCID(step.Details); err != nil {
				return err
			}
		}
	}
	return nil
}

func (m *Message) parseGroupContext(details []tyber.Detail) error {
	found := 0
	for _, detail := range details {
		if detail.Name == "GroupPK" {
			m.GroupPK = detail.Description
			found++
		} else if detail.Name == "MemberPK" {
			m.SenderPK = detail.Description
			found++
		}
		if found == 2 {
			return nil
		}
	}

	return errors.New("member device public key not found")
}

func (m *Message) parseCID(details []tyber.Detail) error {
	for _, detail := range details {
		if detail.Name == "CID" {
			m.CID = detail.Description
			return nil
		}
	}

	return errors.New("member device public key not found")
}

func (m *Message) parseReceiverTrace(trace *parser.AppTrace) error {
	found := 0
	for _, step := range trace.Steps {
		if step.Name == "Unmarshaled AppMessage payload" {
			if err := m.parseReceiverPK(step.Details); err != nil {
				return err
			}

			found++
		} else if step.Name == "Generated interaction" {
			if err := m.parseInteraction(step.Details); err != nil {
				return err
			}

			if step.Started.After(m.Finished) {
				m.Finished = step.Started
			}

			found++
		}
		if found == 2 {
			return nil
		}
	}
	return errors.New("missing steps in logs")
}

func (m *Message) parseReceiverPK(details []tyber.Detail) error {
	for _, detail := range details {
		if detail.Name == "LocalMemberPK" {
			m.ReceiverPKs = append(m.ReceiverPKs, detail.Description)

			return nil
		}
	}

	return errors.New("no interaction block found")
}

func (m *Message) parseInteraction(details []tyber.Detail) error {
	for _, detail := range details {
		if detail.Name == "Interaction" {
			var i mt.Interaction
			if err := json.Unmarshal([]byte(detail.Description), &i); err != nil {
				return err
			}
			m.CID = i.CID
			m.GroupPK = i.ConversationPublicKey

			return nil
		}
	}

	return errors.New("no interaction block found")
}
