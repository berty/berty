import React from 'react'
import QRCode from 'react-native-qrcode-svg'
import { View } from 'react-native'
import { Button } from 'react-native-ui-kitten'
import { useDimensions } from '@react-native-community/hooks'
import { SafeAreaConsumer } from 'react-native-safe-area-context'

import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import { Messenger } from '@berty-tech/hooks'
import { useStyles } from '@berty-tech/styles'

const _contentScaleFactor = 0.66

export const MultiMemberQR: React.FC<ScreenProps.Chat.MultiMemberQR> = ({
	route: {
		params: { convId },
	},
}) => {
	const { height, width } = useDimensions().window
	const { flex, margin } = useStyles()
	const conv = Messenger.useGetConversation(convId)
	const { goBack } = useNavigation()
	if (!conv) {
		return null
	}
	return (
		<SafeAreaConsumer>
			{(insets) => (
				<View
					style={[
						flex.align.center,
						flex.justify.center,
						{
							paddingTop: insets?.top || 0,
							height: '100%',
						},
					]}
				>
					<QRCode
						size={_contentScaleFactor * Math.min(height, width)}
						value={conv.shareableGroup}
					/>
					<Button style={[margin.top.scale(40)]} onPress={goBack}>
						Go back
					</Button>
				</View>
			)}
		</SafeAreaConsumer>
	)
}
