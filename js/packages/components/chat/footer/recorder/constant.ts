export const volumeValueLowest = -160
export const volumeValuePrecision = 100000
export const volumeValuesAttached = 100

export const voiceMemoBitrate = 32000
export const voiceMemoSampleRate = 22050
export const voiceMemoFormat = 'aac'

export enum RecordingState {
	UNDEFINED = 0,
	NOT_RECORDING = 1,
	RECORDING = 2,
	RECORDING_LOCKED = 3,
	PENDING_CANCEL = 4,
	CANCELLING = 5,
	PENDING_PREVIEW = 6,
	PREVIEW = 7,
	COMPLETE = 8,
}
