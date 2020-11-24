import React, { useEffect, useState } from 'react'
import { Linking, View, TouchableOpacity } from 'react-native'
import Hyperlink from 'react-native-hyperlink'
import { useNavigation as useNativeNavigation } from '@react-navigation/core'
import { Icon, Text } from '@ui-kitten/components'

import { Maybe, useClient } from '@berty-tech/store/hooks'
import { useStyles } from '@berty-tech/styles'

import { pbDateToNum, timeFormat } from '../../helpers'
import { InteractionUserMessage, ParsedInteraction } from '@berty-tech/store/types.gen'
import { WelshMessengerServiceClient } from '@berty-tech/grpc-bridge/welsh-clients.gen'

const READ_MORE_MESSAGE_LENGTH = 325
const READ_MORE_SUBSTR_LENGTH = 300

const useStylesMessage = () => {
	const [{ text, padding }] = useStyles()
	return {
		dateMessage: [text.size.scale(11), text.bold.small, text.color.grey],
		stateMessageValueMe: [padding.left.scale(1.5), text.size.scale(11), text.color.blue],
	}
}

async function isBertyDeepLink(client: WelshMessengerServiceClient, url: string): Promise<boolean> {
	return new Promise((resolve) => {
		client
			.parseDeepLink({
				link: url,
			})
			.then(() => {
				resolve(true)
			})
			.catch(() => {
				resolve(false)
			})
	})
}

export const HyperlinkUserMessage: React.FC<{
	inte: InteractionUserMessage
	msgBorderColor: any
	isFollowedMessage: boolean | undefined
	msgBackgroundColor: any
	msgTextColor: any
}> = ({ inte, msgBorderColor, isFollowedMessage, msgBackgroundColor, msgTextColor }) => {
	const {
		payload: { body: message },
	} = inte

	const client = useClient()
	const navigation = useNativeNavigation()
	const [{ margin, padding, column, border }] = useStyles()
	const [isReadMore, setReadMore] = useState(false)

	useEffect(() => {
		setReadMore(message.length > READ_MORE_MESSAGE_LENGTH)
	}, [message])

	return (
		<View
			style={[
				border.radius.top.medium,
				inte.isMe ? border.radius.left.medium : border.radius.right.medium,
				msgBorderColor,
				inte.isMe && border.scale(2),
				padding.horizontal.scale(inte.isMe ? 11 : 13),
				padding.vertical.scale(inte.isMe ? 7 : 9),
				inte.isMe ? column.item.right : column.item.left,
				isFollowedMessage && margin.left.scale(35),
				{
					backgroundColor: msgBackgroundColor,
				},
			]}
		>
			<Hyperlink
				onPress={async (url) => {
					if (client && (await isBertyDeepLink(client, url))) {
						navigation.navigate('Modals', {
							screen: 'ManageDeepLink',
							params: { type: 'link', value: url },
						})
						return
					}
					Linking.canOpenURL(url).then((supported) => supported && Linking.openURL(url))
				}}
				linkStyle={{ textDecorationLine: 'underline' }}
			>
				<Text
					style={[
						{
							color: msgTextColor,
							fontSize: 12,
							lineHeight: 17,
						},
					]}
				>
					{isReadMore ? message.substr(0, READ_MORE_SUBSTR_LENGTH).concat('...') : message}
				</Text>
				{isReadMore && (
					<TouchableOpacity onPress={() => setReadMore(false)}>
						<Text
							style={[{ color: '#9391A2', fontSize: 12, alignSelf: 'center' }, margin.top.tiny]}
						>
							Read more
						</Text>
					</TouchableOpacity>
				)}
			</Hyperlink>
		</View>
	)
}

export const TimestampStatusUserMessage: React.FC<{
	inte: ParsedInteraction
	lastInte: Maybe<ParsedInteraction>
	isFollowedMessage: boolean | undefined
	cmd: any
}> = ({ inte, lastInte, isFollowedMessage, cmd }) => {
	const sentDate = pbDateToNum(inte.sentDate)
	const [{ row, margin, padding, color, flex }, { scaleSize }] = useStyles()
	const _styles = useStylesMessage()

	return (
		<View
			style={[
				row.left,
				flex.align.center,
				margin.top.tiny,
				margin.bottom.tiny,
				inte.isMe && row.item.bottom,
			]}
		>
			<Text style={[_styles.dateMessage, isFollowedMessage && margin.left.scale(35)]}>
				{sentDate > 0 ? timeFormat.fmtTimestamp3(sentDate) : ''}
			</Text>
			{!cmd && lastInte?.cid?.toString() === inte.cid?.toString() && (
				<>
					{inte.isMe && (
						<Icon
							name={inte.acknowledged ? 'navigation-2' : 'navigation-2-outline'}
							width={12}
							height={12}
							fill={color.blue}
							style={[padding.left.tiny, { marginTop: 1 * scaleSize }]}
						/>
					)}
					{inte.isMe && (
						<Text style={[_styles.stateMessageValueMe]}>
							{inte.acknowledged ? 'sent' : 'sending...'}
						</Text>
					)}
				</>
			)}
		</View>
	)
}
