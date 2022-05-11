import beapi from '@berty/api'

export type StreamWithProgressType = {
	msg: beapi.protocol.IProgress
	stream: string
}
