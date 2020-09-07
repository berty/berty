package notification

import "time"

type Notification struct {
	Title string
	Body  string
}

type Manager interface {
	Notify(*Notification) error
	Schedule(*Notification, time.Duration) error
}
