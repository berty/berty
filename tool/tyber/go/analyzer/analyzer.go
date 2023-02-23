package analyzer

import (
	"context"
	"errors"
	"strings"

	"berty.tech/berty/v2/tool/tyber/go/logger"
	"berty.tech/berty/v2/tool/tyber/go/parser"
)

type Analyzer struct {
	ctx    context.Context
	logger *logger.Logger

	ContactRequests map[string][]*ContactRequest
	Messages        map[string]*Message
	Groups          map[string]*Group
}

func New(ctx context.Context, logger *logger.Logger) *Analyzer {
	return &Analyzer{
		ctx:             ctx,
		logger:          logger.Named("analyzer"),
		ContactRequests: make(map[string][]*ContactRequest),
		Messages:        make(map[string]*Message),
		Groups:          make(map[string]*Group),
	}
}

func (a *Analyzer) Analyze(sessions []*parser.Session) (*Report, error) {
	if err := a.parseSessions(sessions); err != nil {
		return nil, err
	}

	return a.Report()
}

func (a *Analyzer) parseSessions(sessions []*parser.Session) error {
	for _, session := range sessions {
		for _, trace := range session.Traces {
			if trace.Name == "Sending contact request" { // outgoing contact request
				cr := NewContactRequest()
				if err := cr.parseSenderStep1(trace); err != nil {
					a.logger.Errorf("error while parsing contact request: %s", err.Error())
				}

				if err := a.saveContactRequest(cr); err != nil {
					a.logger.Errorf("error while updating contact request: %s", err.Error())
				}
			} else if strings.Contains(trace.Name, "Received AccountContactRequestOutgoingEnqueued from Account group") { // outgoing contact request (continue)
				cr := NewContactRequest()
				if err := cr.parseSenderGroupPK(trace); err != nil {
					a.logger.Errorf("error while parsing contact request: %s", err.Error())
				}

				if err := a.saveContactRequest(cr); err != nil {
					a.logger.Errorf("error while updating contact request: %s", err.Error())
				}
			} else if strings.Contains(trace.Name, "Received AccountContactRequestIncomingReceived from Account group") { // incoming contact request
				cr := NewContactRequest()
				if err := cr.parseReceiver(trace); err != nil {
					a.logger.Errorf("error while parsing contact request: %s", err.Error())
				}

				if err := a.saveContactRequest(cr); err != nil {
					a.logger.Errorf("error while saving contact request: %s", err.Error())
				}
			} else if strings.Contains(trace.Name, "Sending message to group") || strings.Contains(trace.Name, "Interacting with UserMessage on group") { // outgoing message
				m := NewMessage()
				if err := m.parseSenderTrace(trace); err != nil {
					a.logger.Errorf("error while parsing message: %s", err.Error())
				}

				if err := a.saveMessage(m); err != nil {
					a.logger.Errorf("error while saving message: %s", err.Error())
				}
			} else if trace.InitialName == "Received message store event" { // incoming message
				m := NewMessage()
				if err := m.parseReceiverTrace(trace); err != nil {
					a.logger.Errorf("error while parsing message: %s", err.Error())
				}

				if err := a.saveMessage(m); err != nil {
					a.logger.Errorf("error while saving message: %s", err.Error())
				}
			} else if strings.Contains(trace.Name, "Received GroupMemberDeviceAdded from") { // joined AccountGroup or MultiMemberGroup
				g := &Group{}
				if err := g.parseTrace(trace); err != nil {
					a.logger.Errorf("error while parsing Group: %s", err.Error())
				}

				if err := a.saveGroup(g); err != nil {
					a.logger.Errorf("error while saving Group: %s", err.Error())
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
	if cr.Succeeded {
		foundCR.Succeeded = true
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

	if m.SenderPK != "" {
		savedMessage.SenderPK = m.SenderPK
	}
	if len(m.ReceiverPKs) > 0 {
		savedMessage.ReceiverPKs = append(savedMessage.ReceiverPKs, m.ReceiverPKs...)
	}
	if m.Started.After(savedMessage.Started) {
		savedMessage.Started = m.Started
	}
	if m.Finished.After(savedMessage.Finished) {
		savedMessage.Finished = m.Finished
	}
	if m.Succeeded {
		savedMessage.Succeeded = true
	}

	return nil
}

func (a *Analyzer) saveGroup(g *Group) error {
	if g.GroupPK == "" {
		return errors.New("unable to save the Group, missing GroupPK")
	}

	savedG, ok := a.Groups[g.GroupPK]
	if !ok {
		a.Groups[g.GroupPK] = g
		return nil
	}

	if len(g.Members) > 0 {
		for _, member := range g.Members {
			if !contains(savedG.Members, member) {
				savedG.Members = append(savedG.Members, member)
			}
		}
	}

	return nil
}
