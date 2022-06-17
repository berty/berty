package analyzer

import (
	"errors"
	"fmt"
)

type ContactRequestReport struct {
	ContactRequests []*ContactRequest `json:"contactRequests"`
	Sent            int               `json:"sent"`
	Received        int               `json:"received"`
	SuccessPercent  float32           `json:"successPercent"`
	AverageTime     float32           `json:"averageTime"`
	MinTime         int64             `json:"minTime"`
	MaxTime         int64             `json:"maxTime"`
}

type MessageReport struct {
	Messages       []*Message `json:"messages"`
	Sent           int        `json:"sent"`
	Received       int        `json:"received"`
	Missing        int        `json:"missing"`
	SuccessPercent float32    `json:"successPercent"`
	AverageTime    float32    `json:"averageTime"`
	MinTime        int64      `json:"minTime"`
	MaxTime        int64      `json:"maxTime"`
}

type Report struct {
	ContactRequestReport *ContactRequestReport `json:"contactRequestReport"`
	MessageReport        *MessageReport        `json:"messageReport"`
}

func (a *Analyzer) Report() (*Report, error) {
	crr := &ContactRequestReport{}
	for _, receiverCRs := range a.ContactRequests {
		for _, contactRequest := range receiverCRs {
			crr.processContactRequest(contactRequest)
		}
	}
	crr.computeAverageTime()

	mr := &MessageReport{}
	for _, message := range a.Messages {
		group, ok := a.Groups[message.GroupPK]
		if !ok {
			return nil, errors.New(fmt.Sprintf("no group=%s found for message=%s", message.GroupPK, message.CID))
		}
		mr.processMessage(message, group)
	}
	mr.computeAverageTime()
	return &Report{
		ContactRequestReport: crr,
		MessageReport:        mr,
	}, nil
}

func (crr *ContactRequestReport) processContactRequest(contactRequest *ContactRequest) error {
	crr.ContactRequests = append(crr.ContactRequests, contactRequest)
	crr.Sent++
	if contactRequest.Succeeded {
		crr.Received++

		duration := contactRequest.Finished.Sub(contactRequest.Started).Milliseconds()
		if crr.MinTime == 0 || duration < crr.MinTime {
			crr.MinTime = duration
		}
		if crr.MaxTime == 0 || duration > crr.MaxTime {
			crr.MaxTime = duration
		}
	}
	crr.SuccessPercent = float32(crr.Received) / float32(crr.Sent) * 100
	return nil
}

func (crr *ContactRequestReport) computeAverageTime() {
	var total int64

	if len(crr.ContactRequests) > 0 {
		for _, contactRequest := range crr.ContactRequests {
			if contactRequest.Succeeded {
				duration := contactRequest.Finished.Sub(contactRequest.Started).Milliseconds()
				total += duration
			}
		}

		crr.AverageTime = float32(total) / float32(crr.Received)
	}
}

func (mr *MessageReport) processMessage(message *Message, group *Group) error {
	mr.Messages = append(mr.Messages, message)

	mr.Sent++
	mr.Received += len(message.ReceiverPKs)

	if len(message.ReceiverPKs) > 0 {
		message.MissingReceiverPKs = computeMissingMembers(message, group.Members)
		mr.Missing += len(message.MissingReceiverPKs)
		if len(message.MissingReceiverPKs) == 0 {
			message.Succeeded = true
		}

		mr.SuccessPercent = float32(len(message.ReceiverPKs)) / float32(len(group.Members)) * 100
	}

	duration := message.Finished.Sub(message.Started).Milliseconds()
	if mr.MinTime == 0 || duration < mr.MinTime {
		mr.MinTime = duration
	}
	if mr.MaxTime == 0 || duration > mr.MaxTime {
		mr.MaxTime = duration
	}
	return nil
}

func computeMissingMembers(message *Message, members []string) []string {
	result := []string{}

	for _, member := range members {
		if !contains(message.ReceiverPKs, member) {
			result = append(result, member)
		}
	}

	return result
}

func (a *Analyzer) groupMembers(groupPK string) []string {
	result := []string{}
	group, ok := a.Groups[groupPK]
	if ok {
		return group.Members
	}

	return result
}

func (mr *MessageReport) computeAverageTime() {
	var total int64

	if len(mr.Messages) > 0 {
		for _, message := range mr.Messages {
			if message.Succeeded {
				duration := message.Finished.Sub(message.Started).Milliseconds()
				total += duration
			}
		}

		mr.AverageTime = float32(total) / float32(mr.Received)
	}
}
