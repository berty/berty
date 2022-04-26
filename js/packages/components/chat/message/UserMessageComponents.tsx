import React, { useState } from 'react'
import { Linking, View, TouchableOpacity } from 'react-native'
import Hyperlink from 'react-native-hyperlink'
import { Icon } from '@ui-kitten/components'
import linkify from 'linkify-it'
import tlds from 'tlds'

import {
	Maybe,
	useMessengerClient,
	useThemeColor,
	pbDateToNum,
	InteractionUserMessage,
	ParsedInteraction,
} from '@berty/store'
import { useStyles } from '@berty/contexts/styles'
import { WelshMessengerServiceClient } from '@berty/grpc-bridge/welsh-clients.gen'
import { useNavigation } from '@berty/navigation'

import { timeFormat } from '../../helpers'
import { useTranslation } from 'react-i18next'
import { UnifiedText } from '../../shared-components/UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

const READ_MORE_MESSAGE_LENGTH = 325
const READ_MORE_SUBSTR_LENGTH = 300

const additionalTlds = ['crypto']

const linkify_conf = linkify().tlds([...tlds, ...additionalTlds], true)

const useStylesMessage = () => {
	const { text, padding } = useStyles()
	const colors = useThemeColor()
	return {
		dateMessage: [text.size.tiny, text.light, { color: colors['secondary-text'] }],
		stateMessageValueMe: [
			padding.left.scale(1.5),
			text.size.tiny,
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
	const message = inte.payload?.body

	const client = useMessengerClient()
	const colors = useThemeColor()
	const navigation = useNavigation()
	const { margin, padding, column, border, text } = useStyles()
	const { scaleSize } = useAppDimensions()
	const [isReadMore, setReadMore] = useState<boolean>(true)
	const { t } = useTranslation()

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
					shadowColor: colors.shadow,
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
			{message ? (
				<Hyperlink
					onPress={async url => {
						if (client && (await isBertyDeepLink(client, url))) {
							navigation.navigate('Chat.ManageDeepLink', { type: 'link', value: url })
							return
						}
						Linking.canOpenURL(url).then(supported => supported && Linking.openURL(url))
					}}
					linkStyle={{ textDecorationLine: 'underline' }}
					linkify={linkify_conf}
				>
					<UnifiedText style={{ fontSize: 17, color: msgTextColor, lineHeight: 17 }}>
						{message && message.length > READ_MORE_MESSAGE_LENGTH
							? isReadMore
								? message?.substring(0, READ_MORE_SUBSTR_LENGTH).concat('...')
								: message
							: message || ''}
					</UnifiedText>

					{message && message.length > READ_MORE_MESSAGE_LENGTH ? (
						<TouchableOpacity onPress={() => setReadMore(!isReadMore)}>
							<UnifiedText
								style={[
									margin.top.tiny,
									text.size.small,
									{ color: colors['secondary-text'], alignSelf: 'center' },
								]}
							>
								<>
									{isReadMore ? t('chat.user-message.read-more') : t('chat.user-message.show-less')}
								</>
							</UnifiedText>
						</TouchableOpacity>
					) : null}
				</Hyperlink>
			) : (
				// using the previous jsx with an empty body crashes the render
				<UnifiedText />
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
	const { row, margin, padding, flex } = useStyles()
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	const styles = useStylesMessage()
	const { t } = useTranslation()

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
			<UnifiedText style={[styles.dateMessage, isFollowedMessage && margin.left.scale(35)]}>
				{sentDate > 0 ? timeFormat.fmtTimestamp3(sentDate) : ''}
			</UnifiedText>
			{!cmd && lastInte?.cid === inte.cid && (
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
						<UnifiedText style={styles.stateMessageValueMe}>
							{t(inte.acknowledged ? 'chat.sent' : 'chat.sending').toLowerCase()}
						</UnifiedText>
					)}
				</>
			)}
		</View>
	)
}
