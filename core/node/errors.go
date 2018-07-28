package node

import "errors"

var (
	ErrInvalidInput        = errors.New("invalid input")
	ErrNotImplemented      = errors.New("not implemented")
	ErrEntityAlreadyExists = errors.New("entity already exists")
)
