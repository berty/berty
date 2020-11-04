import React from 'react'
import { TouchableOpacity, View, Text } from 'react-native'

import { useStyles } from '@berty-tech/styles'

import { useStylesNotification, NotificationTmpLogo } from './common'

const Basic: React.FC<any> = ({ onClose, title, message }) => {
	const [{ text }] = useStyles()
	const _styles = useStylesNotification()

	return (
		<TouchableOpacity
			style={_styles.touchable}
			activeOpacity={0.3}
			//underlayColor='transparent'
			onPress={() => {
				if (typeof onClose === 'function') {
					onClose()
				}
			}}
		>
			<View style={_styles.innerTouchable}>
				<NotificationTmpLogo />
				<View style={_styles.titleAndTextWrapper}>
					<Text numberOfLines={1} style={[text.color.black, text.bold.medium]}>
						{title}
					</Text>
					<Text numberOfLines={1} ellipsizeMode='tail' style={[text.color.black]}>
						{message}
					</Text>
				</View>
			</View>
		</TouchableOpacity>
	)
}

export default Basic
