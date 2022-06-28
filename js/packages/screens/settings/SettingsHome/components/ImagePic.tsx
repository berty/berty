import { Icon } from '@ui-kitten/components'
import React from 'react'
import { Image, View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'

interface ImagePicProps {
	avatarURI?: string
}

export const ImagePic: React.FC<ImagePicProps> = props => {
	const colors = useThemeColor()
	const { background, border, color } = useStyles()

	const size = 90
	const paddingValue = Math.round(size / 14)
	let innerSize = Math.round(size - 2 * paddingValue)
	if (innerSize % 2) {
		innerSize--
	}

	return (
		<>
			<View
				style={[
					border.shadow.medium,
					{
						backgroundColor: colors['main-background'],
						padding: paddingValue,
						borderRadius: 120,
						shadowColor: colors.shadow,
					},
				]}
			>
				<View>
					<Image
						source={{ uri: props.avatarURI }}
						style={[
							background.light.blue,
							border.shadow.medium,
							{
								width: innerSize,
								height: innerSize,
								borderRadius: innerSize / 2,
								shadowColor: colors.shadow,
							},
						]}
					/>
					<View
						style={[
							{
								width: innerSize,
								height: innerSize,
								position: 'absolute',
								backgroundColor: color.light.blue,
								opacity: 0.6,
							},
							border.radius.scale(innerSize / 2),
						]}
					/>
				</View>
			</View>
			<Icon
				style={{ top: -61, right: -30 }}
				name='camera-outline'
				pack='custom'
				width={30}
				height={30}
				fill={colors['background-header']}
			/>
		</>
	)
}
