const volumeValueShown = 50

export const normalizeVolumeIntensities = (intensities: Array<number>) => {
	const min = Math.min(...intensities)
	const max = Math.max(...intensities)

	intensities = limitIntensities(
		intensities.map(i => (i - min) / (max - min)),
		volumeValueShown,
	)

	return intensities
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
