import linkify from 'linkify-it'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, View, TouchableOpacity, StyleSheet } from 'react-native'
import Hyperlink from 'react-native-hyperlink'
import tlds from 'tlds'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { WelshMessengerServiceClient } from '@berty/grpc-bridge/welsh-clients.gen'
import { useMessengerClient, useThemeColor } from '@berty/hooks'
import { useNavigation } from '@berty/navigation'
import { InteractionUserMessage } from '@berty/utils/api'

const READ_MORE_MESSAGE_LENGTH = 325
const READ_MORE_SUBSTR_LENGTH = 300

const additionalTlds = ['crypto']

const linkify_conf = linkify().tlds([...tlds, ...additionalTlds], true)

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
	msgBorderColor?: {
		borderColor: string
	}
	isFollowedMessage: boolean | undefined
	msgBackgroundColor: string
	msgTextColor: string
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
				isFollowedMessage && { marginLeft: 35 },
				{
					backgroundColor: msgBackgroundColor,
				},
				isHighlight && {
					...styles.hyperlinkHighlightWrapper,
					borderColor: colors['background-header'],
					shadowColor: colors.shadow,
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
					<UnifiedText style={{ fontSize: 17, color: msgTextColor }}>
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

const styles = StyleSheet.create({
	hyperlinkHighlightWrapper: {
		borderWidth: 1,
		shadowOffset: {
			width: 0,
			height: 8,
		},
		shadowOpacity: 0.44,
		shadowRadius: 10.32,
		elevation: 16,
	},
})
