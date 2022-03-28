import React from 'react'
import { View } from 'react-native'

import { MessageSystemWrapper } from '@berty/components/chat/message/MessageSystemWrapper'
import { ChatDate } from '@berty/components/chat/common'
import { useStyles } from '@berty/styles'
import beapi from '@berty/api'
import { useThemeColor } from '@berty/store/hooks'
import { BText } from '../shared-components/BText'

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
				<BText style={[text.align.center, { color: textColor }]}>Group joined! 👍</BText>
			</MessageSystemWrapper>
		</View>
	)
}
