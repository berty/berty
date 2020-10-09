package bertybot

type CommandFn func(ctx Context)

type command struct {
	name        string
	description string
	handler     CommandFn
}
