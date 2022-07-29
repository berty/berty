import moment from 'moment'
import React from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'
import { normalizeVolumeIntensities } from '@berty/utils/audio'

interface WaveFormProps {
	intensities: number[]
	duration: number | null
	currentTime?: number
	color?: ViewStyle['backgroundColor']
}

export const WaveForm: React.FC<WaveFormProps> = ({
	intensities,
	duration,
	currentTime = 0,
	color,
}) => {
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
		<View style={[styles.container]}>
			<View style={[styles.intensities]}>
				{normalizedIntensities.map((intensity, index) => {
					return (
						<React.Fragment key={index}>
							<View
								style={[
									styles.intensity,
									{
										backgroundColor:
											currentTime === 0 ||
											(duration &&
												index <
													Math.floor((currentTime! / duration) * normalizedIntensities.length))
												? color
												: `${color as string}80`,
										height: 70 * intensity + '%',
									},
								]}
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

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
		padding: 8,
		height: '100%',
	},
	intensities: {
		flex: 1,
		flexDirection: 'row',
		height: '100%',
		alignItems: 'center',
	},
	intensity: {
		minHeight: 5,
		flex: 2,
		borderRadius: 5,
	},
})
