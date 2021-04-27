import React, { useEffect, useState } from 'react'
import { Linking, View, TouchableOpacity } from 'react-native'
import Hyperlink from 'react-native-hyperlink'
import { useNavigation as useNativeNavigation } from '@react-navigation/core'
import { Icon, Text } from '@ui-kitten/components'
import linkify from 'linkify-it'
import tlds from 'tlds'
import Emoji from 'react-native-emoji'

import { Maybe, useClient } from '@berty-tech/store/hooks'
import { useStyles } from '@berty-tech/styles'
import { InteractionUserMessage, ParsedInteraction } from '@berty-tech/store/types.gen'
import { WelshMessengerServiceClient } from '@berty-tech/grpc-bridge/welsh-clients.gen'

import { pbDateToNum, timeFormat } from '../../helpers'
import Markdown from '@berty-tech/components/chat/message/Markdown'

const READ_MORE_MESSAGE_LENGTH = 325
const READ_MORE_SUBSTR_LENGTH = 300

const linkify_conf = linkify().tlds(tlds, true)

const useStylesMessage = () => {
	const [{ text, padding }] = useStyles()
	return {
		dateMessage: [text.size.scale(11), text.bold.small, text.color.grey],
		stateMessageValueMe: [padding.left.scale(1.5), text.size.scale(11), text.color.blue],
	}
}

export async function isBertyDeepLink(
	client: WelshMessengerServiceClient,
	url: string,
): Promise<boolean> {
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
	const [{ margin, padding, column, border }, { scaleSize }] = useStyles()
	const [isReadMore, setReadMore] = useState(false)

	useEffect(() => {
		message && setReadMore(message.length > READ_MORE_MESSAGE_LENGTH)
	}, [message])

	return (
		<View
			style={[
				border.radius.top.medium,
				inte.isMine ? border.radius.left.medium : border.radius.right.medium,
				msgBorderColor,
				inte.isMine && border.scale(2),
				padding.horizontal.scale(inte.isMine ? 11 : 13),
				padding.vertical.scale(inte.isMine ? 7 : 9),
				inte.isMine ? column.item.right : column.item.left,
				isFollowedMessage && { marginLeft: 35 * scaleSize },
				{
					backgroundColor: msgBackgroundColor,
				},
				inte?.reactions?.length && {
					marginBottom: 14,
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
				linkify={linkify_conf}
			>
				<Markdown
					msgBackgroundColor={msgBackgroundColor}
					msgTextColor={msgTextColor}
					message={isReadMore ? message?.substr(0, READ_MORE_SUBSTR_LENGTH).concat('...') : message}
				/>

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
			{!!inte?.reactions?.length && (
				<View
					style={[
						border.radius.large,
						{
							flexDirection: 'row',
							backgroundColor: '#F7F8FF',
							borderRadius: 20,
							borderWidth: 1,
							borderColor: '#E3E4EE',
							paddingVertical: 2,
							paddingHorizontal: 4,
							position: 'absolute',
							bottom: -14,
							right: 10,
						},
					]}
				>
					{inte.reactions.map(({ emoji }) => (
						<Emoji key={emoji} name={emoji} style={{ marginHorizontal: 2, fontSize: 10 }} />
					))}
				</View>
			)}
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
				inte.isMine && row.item.bottom,
			]}
		>
			<Text style={[_styles.dateMessage, isFollowedMessage && margin.left.scale(35)]}>
				{sentDate > 0 ? timeFormat.fmtTimestamp3(sentDate) : ''}
			</Text>
			{!cmd && lastInte?.cid?.toString() === inte.cid?.toString() && (
				<>
					{inte.isMine && (
						<Icon
							name={inte.acknowledged ? 'navigation-2' : 'navigation-2-outline'}
							width={12}
							height={12}
							fill={color.blue}
							style={[padding.left.tiny, { marginTop: 1 * scaleSize }]}
						/>
					)}
					{inte.isMine && (
						<Text style={[_styles.stateMessageValueMe]}>
							{inte.acknowledged ? 'sent' : 'sending...'}
						</Text>
					)}
				</>
			)}
		</View>
	)
}
