package analyzer

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
		mr.processMessage(message)
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

func (mr *MessageReport) processMessage(message *Message) error {
	mr.Messages = append(mr.Messages, message)
	mr.Sent++
	if message.Succeeded {
		mr.Received++

		duration := message.Finished.Sub(message.Started).Milliseconds()
		if mr.MinTime == 0 || duration < mr.MinTime {
			mr.MinTime = duration
		}
		if mr.MaxTime == 0 || duration > mr.MaxTime {
			mr.MaxTime = duration
		}
	}
	mr.SuccessPercent = float32(mr.Received) / float32(mr.Sent) * 100
	return nil
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
