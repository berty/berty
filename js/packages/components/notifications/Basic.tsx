import React from 'react'
import { TouchableOpacity, View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'

import { useStylesNotification, NotificationTmpLogo } from './common'
import { UnifiedText } from '../shared-components/UnifiedText'

const Basic: React.FC<any> = ({ onPress, onClose, title, message }) => {
	const { text } = useStyles()
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
					<UnifiedText numberOfLines={1} style={[text.bold]}>
						{title}
					</UnifiedText>
					<UnifiedText numberOfLines={1} ellipsizeMode='tail'>
						{message}
					</UnifiedText>
				</View>
			</View>
		</TouchableOpacity>
	)
}

export default Basic
