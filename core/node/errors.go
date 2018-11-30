package node

import "errors"

var (
	ErrContactIsMyself                 = errors.New("contact is myself")
	ErrEntityAlreadyExists             = errors.New("entity already exists")
	ErrInvalidEventSender              = errors.New("invalid event sender")
	ErrInvalidInput                    = errors.New("invalid input")
	ErrNotImplemented                  = errors.New("not implemented")
	ErrAnotherClientIsAlreadyConnected = errors.New("another client is already connected")
)
