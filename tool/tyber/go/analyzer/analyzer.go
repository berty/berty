package analyzer

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"berty.tech/berty/tool/tyber/go/logger"
	"berty.tech/berty/tool/tyber/go/parser"
)

type Analyzer struct {
	ctx    context.Context
	logger *logger.Logger

	ContactRequests map[string][]*ContactRequest
	Messages        map[string]*Message
}

func New(ctx context.Context, logger *logger.Logger) *Analyzer {
	return &Analyzer{
		ctx:             ctx,
		logger:          logger,
		ContactRequests: make(map[string][]*ContactRequest),
		Messages:        make(map[string]*Message),
	}
}

func (a *Analyzer) Analyze(sessions []*parser.Session) error {
	if err := a.parseSessions(sessions); err != nil {
		return err
	}

	report, err := a.Report()
	if err != nil {
		return err
	}
	jsonReport, _ := json.Marshal(report)
	fmt.Println(string(jsonReport))

	return nil
}

func (a *Analyzer) parseSessions(sessions []*parser.Session) error {
	for _, session := range sessions {
		for _, trace := range session.Traces {
			if trace.Name == "Sending contact request" {
				a.logger.Debug("found Contact request sent")

				cr := NewContactRequest()
				if err := cr.parseSenderStep1(trace); err != nil {
					a.logger.Errorf("error while parsing contact request: %s", err.Error())
				}

				if err := a.saveContactRequest(cr); err != nil {
					a.logger.Errorf("error while updating contact request: %s", err.Error())
				}
			} else if strings.Contains(trace.Name, "Received AccountContactRequestOutgoingEnqueued from Account group") {
				a.logger.Debug("found outgoing queue contact request")

				cr := NewContactRequest()
				if err := cr.parseSenderStep2(trace); err != nil {
					a.logger.Errorf("error while parsing contact request: %s", err.Error())
				}

				if err := a.saveContactRequest(cr); err != nil {
					a.logger.Errorf("error while updating contact request: %s", err.Error())
				}
			} else if strings.Contains(trace.Name, "Received AccountContactRequestIncomingReceived from Account group") {
				a.logger.Debug("found incoming contact request")

				cr := NewContactRequest()
				if err := cr.parseReceiver(trace); err != nil {
					a.logger.Errorf("error while parsing contact request: %s", err.Error())
				}

				if err := a.saveContactRequest(cr); err != nil {
					a.logger.Errorf("error while saving contact request: %s", err.Error())
				}
			} else if strings.Contains(trace.Name, "Sending message to group") || strings.Contains(trace.Name, "Interacting with UserMessage on group") {
				a.logger.Debug("found sent message")

				m := NewMessage()
				if err := m.parseSenderTrace(trace); err != nil {
					a.logger.Errorf("error while parsing message: %s", err.Error())
				}

				if err := a.saveMessage(m); err != nil {
					a.logger.Errorf("error while saving message: %s", err.Error())
				}
			} else if trace.InitialName == "Received message store event" {
				a.logger.Debug("found received message")

				m := NewMessage()
				if err := m.parseReceiverTrace(trace); err != nil {
					a.logger.Errorf("error while parsing message: %s", err.Error())
				}

				if err := a.saveMessage(m); err != nil {
					a.logger.Errorf("error while saving message: %s", err.Error())
				}
			}
		}
	}
	return nil
}

// saveContactRequest tries to find a ContactRequest for the `cr` args to update it.
// Else saveContactRequest will create one.
func (a *Analyzer) saveContactRequest(cr *ContactRequest) error {
	if cr.ReceiverPK == "" || (cr.GroupPK == "" && cr.ReceiverPK == "") {
		return errors.New("unable to save the contact request, missing identification info")
	}

	receiverCRs, ok := a.ContactRequests[cr.ReceiverPK]
	if !ok {
		a.ContactRequests[cr.ReceiverPK] = []*ContactRequest{cr}
		return nil
	}

	var foundCR *ContactRequest
	for _, receiverCR := range receiverCRs {
		if (receiverCR.SenderPK == cr.SenderPK || receiverCR.GroupPK == cr.GroupPK) && receiverCR.ReceiverPK == cr.ReceiverPK {
			foundCR = receiverCR
			break
		}
	}

	// no previous corresponding ContactRequest found in the slice
	if foundCR == nil {
		receiverCRs = append(receiverCRs, cr)
		a.ContactRequests[cr.ReceiverPK] = receiverCRs
		return nil
	}

	// update the found ContactRequest
	if cr.GroupPK != "" {
		foundCR.GroupPK = cr.GroupPK
	}
	if cr.SenderPK != "" {
		foundCR.SenderPK = cr.SenderPK
	}
	if cr.SenderDevicePK != "" {
		foundCR.SenderDevicePK = cr.SenderDevicePK
	}
	if cr.ReceiverPK != "" {
		foundCR.ReceiverPK = cr.ReceiverPK
	}
	if cr.ReceiverDevicePK != "" {
		foundCR.ReceiverDevicePK = cr.ReceiverDevicePK
	}
	if cr.Started.After(foundCR.Started) {
		foundCR.Started = cr.Started
	}
	if cr.Finished.After(foundCR.Finished) {
		foundCR.Finished = cr.Finished
	}
	if cr.Successed {
		foundCR.Successed = true
	}

	return nil
}

func (a *Analyzer) saveMessage(m *Message) error {
	if m.CID == "" {
		return errors.New("unable to save the message, missing identification info")
	}

	savedMessage, ok := a.Messages[m.CID]
	if !ok {
		a.Messages[m.CID] = m
		return nil
	}

	// update the saved message
	if m.GroupPK != "" {
		savedMessage.GroupPK = m.GroupPK
	}
	if m.CID != "" {
		savedMessage.CID = m.CID
	}

	if m.SenderPK != "" {
		savedMessage.SenderPK = m.SenderPK
	}
	if m.ReceiverPK != "" {
		savedMessage.ReceiverPK = m.ReceiverPK
	}
	if m.Started.After(savedMessage.Started) {
		savedMessage.Started = m.Started
	}
	if m.Finished.After(savedMessage.Finished) {
		savedMessage.Finished = m.Finished
	}
	if m.Successed {
		savedMessage.Successed = true
	}

	return nil
}
