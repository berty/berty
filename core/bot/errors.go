package bot

import "errors"

var (
	ErrNoClient = errors.New("bot has no client configured")
)
