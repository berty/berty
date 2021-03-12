import React from 'react'
import beapi from '@berty-tech/api'
import { useStyles } from '@berty-tech/styles'
import { View } from 'react-native'
import { ChatDate } from '@berty-tech/components/chat/common'
import { MessageSystemWrapper } from '@berty-tech/components/chat/message/MessageSystemWrapper'
import { Text } from '@ui-kitten/components'

export const InfosMultiMember: React.FC<beapi.messenger.IConversation> = ({
	createdDate: createdDateStr,
}) => {
	const [{ margin, text, flex }] = useStyles()
	// const members = useConvMembers(publicKey)
	const createdDate = parseInt((createdDateStr as unknown) as string, 10)
	const textColor = '#4E58BF'
	return (
		<View style={[flex.align.center, flex.justify.center]}>
			<ChatDate date={createdDate} />
			<MessageSystemWrapper styleContainer={[margin.top.large, margin.bottom.medium]}>
				<Text style={[text.align.center, { color: textColor }]}>Group joined! 👍</Text>
			</MessageSystemWrapper>
			{/*<MemberList members={Object.keys(members)} />*/}
		</View>
	)
}
