import React from 'react'
import { View } from 'react-native'
import { Text } from '@ui-kitten/components'

import { MessageSystemWrapper } from '@berty-tech/components/chat/message/MessageSystemWrapper'
import { ChatDate } from '@berty-tech/components/chat/common'
import { useStyles } from '@berty-tech/styles'
import beapi from '@berty-tech/api'
import { useThemeColor } from '@berty-tech/store/hooks'

export const InfosMultiMember: React.FC<beapi.messenger.IConversation> = ({
	createdDate: createdDateStr,
}) => {
	const [{ margin, text, flex }] = useStyles()
	const colors = useThemeColor()
	const createdDate = parseInt(createdDateStr as unknown as string, 10)
	const textColor = colors['background-header']
	return (
		<View style={[flex.align.center, flex.justify.center]}>
			<ChatDate date={createdDate} />
			<MessageSystemWrapper styleContainer={[margin.top.large, margin.bottom.medium]}>
				<Text style={[text.align.center, { color: textColor }]}>Group joined! 👍</Text>
			</MessageSystemWrapper>
		</View>
	)
}
