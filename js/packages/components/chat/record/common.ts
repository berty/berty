export const volumeValueLowest = -160
export const volumeValuePrecision = 100000
export const volumeValuesAttached = 100
export const voiceMemoFilename = 'audio_memo.aac'

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

export const limitIntensities = (intensities: Array<number>, max: number): Array<number> => {
	if (intensities.length === max) {
		return intensities
	}

	if (intensities.length === 0) {
		return []
	}

	const normalizedIntensities: Array<number> = []

	if (intensities.length > max) {
		const step = Math.ceil(intensities.length / max)

		for (let idx = 0; idx < intensities.length; idx++) {
			if (normalizedIntensities.length === 0 || idx / step > normalizedIntensities.length) {
				normalizedIntensities.push(intensities[idx])
			} else {
				normalizedIntensities[normalizedIntensities.length - 1] = Math.max(
					normalizedIntensities[normalizedIntensities.length - 1],
					intensities[idx],
				)
			}
		}
		return normalizedIntensities
	}

	for (let i = 0; i < max; i++) {
		normalizedIntensities.push(intensities[Math.floor(i / (max / intensities.length))])
	}

	return normalizedIntensities
}
