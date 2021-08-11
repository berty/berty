import React from 'react'
import { TouchableOpacity, View, Text } from 'react-native'

import { useStyles } from '@berty-tech/styles'
import { useThemeColor } from '@berty-tech/store/hooks'

import { useStylesNotification, NotificationTmpLogo } from './common'

const Basic: React.FC<any> = ({ onPress, onClose, title, message }) => {
	const [{ text }] = useStyles()
	const colors = useThemeColor()
	const _styles = useStylesNotification()

	return (
		<TouchableOpacity
			style={_styles.touchable}
			activeOpacity={0.3}
			onPress={() => {
				onClose()
				onPress()
			}}
		>
			<View style={_styles.innerTouchable}>
				<NotificationTmpLogo />
				<View style={_styles.titleAndTextWrapper}>
					<Text numberOfLines={1} style={[text.bold.medium, { color: colors['main-text'] }]}>
						{title}
					</Text>
					<Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors['main-text'] }}>
						{message}
					</Text>
				</View>
			</View>
		</TouchableOpacity>
	)
}

export default Basic
