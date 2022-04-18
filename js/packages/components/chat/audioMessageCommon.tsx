import React from 'react'
import moment from 'moment'
import { View, ViewStyle } from 'react-native'

import { useThemeColor } from '@berty/store'
import { useStyles } from '@berty/contexts/styles'
import { UnifiedText } from '../shared-components/UnifiedText'

export const volumeValueLowest = -160
export const volumeValuePrecision = 100000
export const volumeValuesAttached = 100

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

export const WaveForm: React.FC<{
	intensities: any[]
	duration: number | null
	currentTime?: number
	color?: ViewStyle['backgroundColor']
}> = ({ intensities, duration, currentTime = 0, color }) => {
	const normalizedIntensities = React.useMemo(
		() => normalizeVolumeIntensities(intensities),
		[intensities],
	)
	const { margin, text } = useStyles()
	const colors = useThemeColor()
	if (color === undefined) {
		color = colors['reverted-main-text']
	}
	return (
		<View
			style={{
				flexDirection: 'row',
				alignItems: 'center',
				flex: 1,
				padding: 8,
				height: '100%',
			}}
		>
			<View style={{ flex: 1, flexDirection: 'row', height: '100%', alignItems: 'center' }}>
				{normalizedIntensities.map((intensity, index) => {
					return (
						<React.Fragment key={index}>
							<View
								style={{
									backgroundColor:
										currentTime === 0 ||
										(duration &&
											index < Math.floor((currentTime! / duration) * normalizedIntensities.length))
											? color
											: `${color as string}80`,
									minHeight: 5,
									height: 70 * intensity + '%',
									flex: 2,
									borderRadius: 5,
								}}
							/>
							<View style={{ flex: 1 }} />
						</React.Fragment>
					)
				})}
			</View>
			<UnifiedText style={[{ color }, margin.small, text.size.tiny]}>
				{moment.utc(duration).format('mm:ss')}
			</UnifiedText>
		</View>
	)
}
