package parser

import (
	"berty.tech/berty/v2/go/pkg/tyber"
)

// Trace

type AppTrace struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	InitialName string     `json:"initialName"`
	Steps       []*AppStep `json:"steps"`
	Subs        []SubTarget
	Status
}

type SubTarget struct {
	TargetName    string
	TargetDetails []tyber.Detail
	StepToAdd     tyber.Step
}

func (t *AppTrace) ToCreateTraceEvent() CreateTraceEvent {
	return CreateTraceEvent{*t}
}

func (t *AppTrace) ToUpdateTraceEvent() UpdateTraceEvent {
	return UpdateTraceEvent{
		ID:     t.ID,
		Status: t.Status,
		Name:   t.Name,
	}
}

// TODO
// func (s *AppStep) ToUpdateStepEvent() UpdateStepEvent {
// 	return UpdateStepEvent{
// 		ID:     s.ID,
// 		Detail: s.Detail,
// 		Status: s.Status,
// 	}
// }

// Step

type AppStep struct {
	Name    string         `json:"name"`
	Details []tyber.Detail `json:"details"`
	Status
	ForceReopen     bool   `json:"forceReopen"`
	UpdateTraceName string `json:"updateTraceName"`
}

func (s *AppStep) ToCreateStepEvent(id string) CreateStepEvent {
	return CreateStepEvent{
		ID:      id,
		AppStep: *s,
	}
}

// Subscribe

type AppSubscribe struct {
	TargetDetails []tyber.Detail `json:"details"`
	TargetName    string         `json:"targetName"`
	ParentTraceID string
	SubscribeStep *AppStep
}

func (sub *AppSubscribe) ToInitialCreateStepEvent(id string) CreateStepEvent {
	return CreateStepEvent{
		ID:      id,
		AppStep: *sub.SubscribeStep,
	}
}
