import React, { useEffect, useState } from 'react'
import { Linking, View, TouchableOpacity } from 'react-native'
import Hyperlink from 'react-native-hyperlink'
import { useNavigation as useNativeNavigation } from '@react-navigation/core'
import { Icon, Text } from '@ui-kitten/components'
import linkify from 'linkify-it'
import tlds from 'tlds'

import { Maybe, useClient, useThemeColor } from '@berty-tech/store/hooks'
import { useStyles } from '@berty-tech/styles'
import { InteractionUserMessage, ParsedInteraction } from '@berty-tech/store/types.gen'
import { WelshMessengerServiceClient } from '@berty-tech/grpc-bridge/welsh-clients.gen'

import { pbDateToNum, timeFormat } from '../../helpers'

const READ_MORE_MESSAGE_LENGTH = 325
const READ_MORE_SUBSTR_LENGTH = 300

const additionalTlds = ['crypto']

const linkify_conf = linkify().tlds([...tlds, ...additionalTlds], true)

const useStylesMessage = () => {
	const [{ text, padding }] = useStyles()
	const colors = useThemeColor()
	return {
		dateMessage: [text.size.scale(11), text.bold.small, { color: colors['secondary-text'] }],
		stateMessageValueMe: [
			padding.left.scale(1.5),
			text.size.scale(11),
			{ color: colors['background-header'] },
		],
	}
}

export async function isBertyDeepLink(
	client: WelshMessengerServiceClient,
	url: string,
): Promise<boolean> {
	return new Promise(resolve => {
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
	isHighlight: boolean
}> = ({
	inte,
	msgBorderColor,
	isFollowedMessage,
	msgBackgroundColor,
	msgTextColor,
	isHighlight,
}) => {
	const {
		payload: { body: message },
	} = inte

	const client = useClient()
	const colors = useThemeColor()
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
				isHighlight && {
					borderColor: colors['background-header'],
					borderWidth: 1,
					shadowColor: colors['background-header'],
					shadowOffset: {
						width: 0,
						height: 8,
					},
					shadowOpacity: 0.44,
					shadowRadius: 10.32,
					elevation: 16,
				},
			]}
		>
			<Hyperlink
				onPress={async url => {
					if (client && (await isBertyDeepLink(client, url))) {
						navigation.navigate('ManageDeepLink', { type: 'link', value: url })
						return
					}
					Linking.canOpenURL(url).then(supported => supported && Linking.openURL(url))
				}}
				linkStyle={{ textDecorationLine: 'underline' }}
				linkify={linkify_conf}
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
							style={[
								{ color: colors['secondary-text'], fontSize: 12, alignSelf: 'center' },
								margin.top.tiny,
							]}
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
	const [{ row, margin, padding, flex }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
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
							fill={colors['background-header']}
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
