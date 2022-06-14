package analyzer

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"time"

	"berty.tech/berty/tool/tyber/go/parser"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/tyber"
)

type ContactRequest struct {
	GroupPK          string    `json:"groupPK"`
	SenderPK         string    `json:"senderPK"`
	SenderDevicePK   string    `json:"senderDevicePK"`
	ReceiverPK       string    `json:"receiverPK"`
	ReceiverDevicePK string    `json:"receiverDevicePK"`
	Started          time.Time `json:"started"`
	Finished         time.Time `json:"finished"`
	Succeeded        bool      `json:"succeeded"`
}

func NewContactRequest() *ContactRequest {
	return &ContactRequest{
		Succeeded: false,
	}
}

func (cr *ContactRequest) parseSenderStep1(trace *parser.AppTrace) error {
	for _, step := range trace.Steps {
		switch step.Name {
		case "Contact request info":
			cr.Started = step.Started
			if err := cr.parseReceiverPK(step.Details); err != nil {
				return err
			}
		case "Enqueuing contact request":
			if err := cr.parseSenderPK(step.Details); err != nil {
				return err
			}
		case "Got member device public key":
			if err := cr.parseSenderDevicePK(step.Details); err != nil {
				return err
			}
		}
	}
	return nil
}

func (cr *ContactRequest) parseReceiverPK(details []tyber.Detail) error {
	for _, detail := range details {
		if detail.Name == "Request" {
			var req protocoltypes.ContactRequestSend_Request
			if err := json.Unmarshal([]byte(detail.Description), &req); err != nil {
				return err
			}
			cr.ReceiverPK = base64.RawURLEncoding.EncodeToString(req.Contact.PK)
			return nil
		}
	}

	return errors.New("member device public key not found")
}

func (cr *ContactRequest) parseSenderPK(details []tyber.Detail) error {
	for _, detail := range details {
		if detail.Name == "GroupPK" {
			cr.SenderPK = detail.Description
			return nil
		}
	}

	return errors.New("member device public key not found")
}

func (cr *ContactRequest) parseSenderDevicePK(details []tyber.Detail) error {
	for _, detail := range details {
		if detail.Name == "MemberDevicePublicKey" {
			cr.SenderDevicePK = detail.Description
			return nil
		}
	}

	return errors.New("member device public key not found")
}

func (cr *ContactRequest) parseSenderStep2(trace *parser.AppTrace) error {
	for _, step := range trace.Steps {
		if step.Name == "Added contact to db" {
			for _, detail := range step.Details {
				if detail.Name == "FinalContact" {
					var contact messengertypes.Contact
					if err := json.Unmarshal([]byte(detail.Description), &contact); err != nil {
						return err
					}

					cr.ReceiverPK = contact.PublicKey
					cr.GroupPK = contact.ConversationPublicKey

					return nil
				}
			}
		}
	}
	return nil
}

func (cr *ContactRequest) parseReceiver(trace *parser.AppTrace) error {
	for _, step := range trace.Steps {
		if step.Name == "Maybe added conversation to db" {
			for _, detail := range step.Details {
				if detail.Name == "ConversationToSave" {
					var conversation messengertypes.Conversation
					if err := json.Unmarshal([]byte(detail.Description), &conversation); err != nil {
						return err
					}

					cr.SenderPK = conversation.ContactPublicKey
					cr.GroupPK = conversation.PublicKey
					cr.ReceiverPK = conversation.LocalMemberPublicKey
					cr.ReceiverDevicePK = conversation.LocalDevicePublicKey
					cr.Finished = step.Started
					cr.Succeeded = true

					return nil
				}
			}
		}
	}
	return nil
}
