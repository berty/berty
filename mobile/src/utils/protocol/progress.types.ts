import beapi from '@berty/api'

export type StreamProgressType = {
	msg: beapi.protocol.IProgress
	stream: string
}
