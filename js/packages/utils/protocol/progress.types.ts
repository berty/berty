import beapi from '@berty/api'

export type StreamInProgress = {
	msg: beapi.protocol.IProgress
	stream: string
}
