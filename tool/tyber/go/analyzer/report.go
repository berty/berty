package analyzer

import "fmt"

type ContactRequestReport struct {
	ContactRequests []*ContactRequest `json:"contactRequests"`
	Sent            int               `json:"sent"`
	Received        int               `json:"received"`
	SuccessPercent  float32           `json:"successPercent"`
	AverageTime     float32           `json:"averageTime"`
	MinTime         int64             `json:"minTime"`
	MaxTime         int64             `json:"maxTime"`
}

func (a *Analyzer) Report() (*ContactRequestReport, error) {
	crr := &ContactRequestReport{}
	for _, receiverCRs := range a.ContactRequests {
		for _, contactRequest := range receiverCRs {
			crr.processContactRequest(contactRequest)
		}
	}
	crr.computeAverageTime()

	return crr, nil
}

func (crr *ContactRequestReport) processContactRequest(contactRequest *ContactRequest) error {
	fmt.Println("adding this CR", contactRequest)
	crr.ContactRequests = append(crr.ContactRequests, contactRequest)
	crr.Sent++
	if contactRequest.Successed {
		crr.Received++

		duration := contactRequest.Finished.Sub(contactRequest.Started).Milliseconds()
		if crr.MinTime == 0 || duration < crr.MinTime {
			crr.MinTime = duration
		}
		if crr.MaxTime == 0 || duration > crr.MaxTime {
			crr.MaxTime = duration
		}
	}
	crr.SuccessPercent = float32(crr.Received) / float32(crr.Sent)
	return nil
}

func (crr *ContactRequestReport) computeAverageTime() {
	var total int64

	if len(crr.ContactRequests) > 0 {
		for _, contactRequest := range crr.ContactRequests {
			crr.ContactRequests = append(crr.ContactRequests, contactRequest)
			if contactRequest.Successed {
				duration := contactRequest.Finished.Sub(contactRequest.Started).Milliseconds()
				total += duration
			}
		}

		crr.AverageTime = float32(total) / float32(crr.Received)
	}
}
