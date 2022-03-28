import React from 'react'
import { TouchableOpacity, View } from 'react-native'

import { useStyles } from '@berty/styles'

import { useStylesNotification, NotificationTmpLogo } from './common'
import { BText } from '../shared-components/BText'

const Basic: React.FC<any> = ({ onPress, onClose, title, message }) => {
	const [{ text }] = useStyles()
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
					<BText numberOfLines={1} style={[text.bold.medium]}>
						{title}
					</BText>
					<BText numberOfLines={1} ellipsizeMode='tail'>
						{message}
					</BText>
				</View>
			</View>
		</TouchableOpacity>
	)
}

export default Basic
