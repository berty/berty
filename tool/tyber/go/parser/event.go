package parser

type CreateSessionEvent struct {
	ID          string  `json:"id"`
	DisplayName string  `json:"displayName"`
	SrcName     string  `json:"srcName"`
	SrcType     SrcType `json:"srcType"`
	Header      Header  `json:"header"`
	Status
}

type CreateTraceEvent struct {
	Trace
}

type CreateStepEvent struct {
	ID string `json:"parentID"`
	Step
}

type UpdateSessionEvent struct {
	ID          string `json:"id"`
	DisplayName string `json:"displayName"`
	Status
}

type UpdateTraceEvent struct {
	ID string `json:"id"`
	Status
}

// TODO
// type UpdateStepEvent struct {
// 	ID     string `json:"id"`
// 	Detail string `json:"detail"`
// 	Status
// }

type DeleteSessionEvent struct {
	ID string `json:"id"`
}

func sessionToCreateEvent(s *Session) CreateSessionEvent {
	return CreateSessionEvent{
		ID:          s.ID,
		DisplayName: s.DisplayName,
		SrcName:     s.SrcName,
		SrcType:     s.SrcType,
		Header:      *s.Header,
		Status:      s.Status,
	}
}

func traceToCreateEvent(t *Trace) CreateTraceEvent {
	return CreateTraceEvent{*t}
}

func stepToCreateEvent(id string, s *Step) CreateStepEvent {
	return CreateStepEvent{
		ID:   id,
		Step: *s,
	}
}

func sessionToUpdateEvent(s *Session) UpdateSessionEvent {
	return UpdateSessionEvent{
		ID:          s.ID,
		DisplayName: s.DisplayName,
		Status:      s.Status,
	}
}

func traceToUpdateEvent(t *Trace) UpdateTraceEvent {
	return UpdateTraceEvent{
		ID:     t.ID,
		Status: t.Status,
	}
}

// TODO
// func stepToUpdateEvent(s *Step) UpdateStepEvent {
// 	return UpdateStepEvent{
// 		ID:     s.ID,
// 		Detail: s.Detail,
// 		Status: s.Status,
// 	}
// }

func sessionToDeleteEvent(s *Session) DeleteSessionEvent {
	return DeleteSessionEvent{s.ID}
}
