import React from 'react'
import { StyleProp, TouchableHighlight, View, ViewProps } from 'react-native'
import { SafeAreaConsumer } from 'react-native-safe-area-context'
import { CommonActions } from '@react-navigation/native'
import { Icon, Text } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'

import { useStyles } from '@berty-tech/styles'
import beapi from '@berty-tech/api'
import { useMsgrContext } from '@berty-tech/store/context'
import { useLastConvInteraction } from '@berty-tech/store/hooks'
import { Routes, useNavigation } from '@berty-tech/navigation'

import { ConversationAvatar, HardcodedAvatar } from '../../avatars'
import { pbDateToNum, timeFormat } from '../../helpers'
import { UnreadCount } from './UnreadCount'
import { checkPermissions } from '@berty-tech/components/utils'

type ConversationsProps = ViewProps & {
	items: Array<any>
	suggestions: Array<any>
	configurations: Array<any>
	addBot: any
}

type ConversationsItemProps = any

// Functions

const MessageStatus: React.FC<{ interaction: any; isAccepted: boolean }> = ({
	interaction,
	isAccepted,
}) => {
	const [{ color }] = useStyles()
	if (interaction?.type !== beapi.messenger.AppMessage.Type.TypeUserMessage && isAccepted) {
		return null
	}

	return (
		<Icon
			name={
				(interaction && !interaction.acknowledged) || !isAccepted
					? 'navigation-2-outline'
					: 'navigation-2'
			}
			width={14}
			height={14}
			fill={color.blue}
		/>
	)
}

const interactionsFilter = (inte: any) =>
	inte.type === beapi.messenger.AppMessage.Type.TypeUserMessage

const ConversationsItem: React.FC<ConversationsItemProps> = (props) => {
	const {
		publicKey = '',
		displayName = '',
		fake = false,
		type = beapi.messenger.Conversation.Type.ContactType,
		unreadCount,
		createdDate,
		lastUpdate,
	} = props

	const ctx = useMsgrContext()

	const lastInte = useLastConvInteraction(publicKey, interactionsFilter)

	const displayDate = lastUpdate || createdDate ? pbDateToNum(lastUpdate || createdDate) : null

	const contact =
		Object.values(ctx.contacts).find((c: any) => c.conversationPublicKey === publicKey) || null
	const isAccepted = contact && contact.state === beapi.messenger.Contact.State.Accepted
	const isIncoming = contact && contact.state === beapi.messenger.Contact.State.IncomingRequest

	const [{ color, row, border, flex, padding, text, opacity, margin }, { scaleSize }] = useStyles()
	const { dispatch } = useNavigation()

	let description
	if (lastInte?.type === beapi.messenger.AppMessage.Type.TypeUserMessage) {
		description = (lastInte.payload as any)?.body
	} else {
		if (contact?.state === beapi.messenger.Contact.State.OutgoingRequestSent) {
			description = 'Request is sent. Pending...'
		} else {
			description = ''
		}
	}

	let messageType: 'picture' | 'audio' | '' = ''

	const userDisplayName =
		type === beapi.messenger.Conversation.Type.MultiMemberType
			? displayName
			: contact?.displayName || ''

	if (lastInte?.medias?.length) {
		if (lastInte.medias[0].mimeType?.startsWith('image')) {
			messageType = 'picture'
			description = `${lastInte.isMine ? 'You' : userDisplayName} sent ${
				lastInte.isMine ? userDisplayName : 'you'
			} ${lastInte.medias.length > 1 ? `${lastInte.medias.length} pics` : 'a pic'}`
		} else if (lastInte.medias[0].mimeType?.startsWith('audio')) {
			messageType = 'audio'
			description = `${lastInte.isMine ? 'You' : userDisplayName} sent ${
				lastInte.isMine ? userDisplayName : 'you'
			} ${lastInte.medias.length > 1 ? `${lastInte.medias.length} audio files` : 'an audio file'}`
		}
	}

	return !isIncoming ? (
		<TouchableHighlight
			underlayColor={color.light.grey}
			style={[
				padding.horizontal.medium,
				!isAccepted && type !== beapi.messenger.Conversation.Type.MultiMemberType && opacity(0.6),
			]}
			onPress={
				type === beapi.messenger.Conversation.Type.MultiMemberType
					? () =>
							dispatch(
								CommonActions.navigate({
									name: Routes.Chat.Group,
									params: {
										convId: publicKey,
									},
								}),
							)
					: () =>
							dispatch(
								CommonActions.navigate({
									name: Routes.Chat.OneToOne,
									params: {
										convId: publicKey,
									},
								}),
							)
			}
		>
			<View
				style={[
					row.center,
					border.bottom.medium,
					border.color.light.grey,
					padding.vertical.scale(7),
				]}
			>
				<View
					style={[
						row.item.center,
						flex.align.center,
						flex.justify.center,
						margin.right.small,
						{
							flexBasis: 45,
							flexGrow: 0,
							flexShrink: 0,
						},
					]}
				>
					<ConversationAvatar size={40 * scaleSize} publicKey={publicKey} />
				</View>
				<View
					style={[
						flex.justify.spaceAround,
						{
							flexBasis: 2,
							flexGrow: 2,
							flexShrink: 0,
						},
					]}
				>
					{/* Conversation title, unread count, and time */}
					<View style={[flex.direction.row, flex.justify.flexStart]}>
						{/* Title */}
						<View
							style={{
								flexShrink: 1,
							}}
						>
							<Text numberOfLines={1} style={[text.size.medium, text.color.black]}>
								{fake ? `FAKE - ${userDisplayName}` : userDisplayName}
							</Text>
						</View>
						{/* Timestamp and unread count */}
						<View
							style={[
								flex.direction.row,
								flex.align.center,
								flex.justify.flexEnd,
								{ marginLeft: 'auto' },
							]}
						>
							<>
								<UnreadCount value={unreadCount} isConvBadge />
								{displayDate && (
									<Text
										style={[
											padding.left.small,
											text.size.small,
											unreadCount ? [text.bold.medium, text.color.black] : text.color.grey,
										]}
									>
										{timeFormat.fmtTimestamp1(displayDate)}
									</Text>
								)}
							</>
						</View>
					</View>
					<View
						style={[
							flex.direction.row,
							flex.align.center,
							{
								height: text.size.small.fontSize * 1.8, // Keep row height even if no description/message
							},
						]}
					>
						{!!messageType && (
							<Icon
								name={messageType === 'audio' ? 'headphones' : 'image'}
								fill={color.black}
								height={20 * scaleSize}
								width={20 * scaleSize}
								style={[margin.right.tiny]}
							/>
						)}
						<Text
							numberOfLines={1}
							style={[
								{ flexGrow: 2, flexShrink: 1 },
								text.size.small,
								unreadCount ? [text.bold.medium, text.color.black] : text.color.grey,
							]}
						>
							{description}
						</Text>

						{/* Message status */}
						<View
							style={[
								row.item.center,
								row.right,
								{
									flexBasis: 16,
									flexGrow: 0,
									flexShrink: 0,
								},
							]}
						>
							{lastInte && lastInte.isMine && (
								<MessageStatus
									interaction={lastInte}
									isAccepted={
										isAccepted || type === beapi.messenger.Conversation.Type.MultiMemberType
									}
								/>
							)}
						</View>
					</View>
				</View>
			</View>
		</TouchableHighlight>
	) : null
}

const SuggestionsItem: React.FC<{
	displayName: string
	desc: string
	link: string
	addBot: any
	icon: string
	style?: StyleProp<any>
}> = ({ displayName, desc, link, addBot, icon, style }) => {
	const [{ color, row, border, flex, padding, text, margin }, { scaleSize }] = useStyles()
	return (
		<>
			<TouchableHighlight
				underlayColor={color.light.grey}
				style={[
					padding.horizontal.medium,
					style,
					// !isAccepted && type !== beapi.messenger.Conversation.Type.MultiMemberType && opacity(0.6),
				]}
				onPress={() => addBot({ displayName, link, isVisible: true })}
			>
				<View
					style={[
						row.center,
						border.bottom.medium,
						border.color.light.grey,
						padding.vertical.scale(7),
					]}
				>
					<View
						style={[
							row.item.center,
							flex.align.center,
							flex.justify.center,
							margin.right.small,
							{
								flexBasis: 45,
								flexGrow: 0,
								flexShrink: 0,
							},
						]}
					>
						<HardcodedAvatar size={40 * scaleSize} name={icon} />
					</View>
					<View
						style={[
							flex.justify.spaceAround,
							{
								flexBasis: 2,
								flexGrow: 2,
								flexShrink: 0,
							},
						]}
					>
						{/* Conversation title, unread count, and time */}
						<View style={[flex.direction.row, flex.justify.flexStart]}>
							{/* Title */}
							<View
								style={{
									flexShrink: 1,
								}}
							>
								<Text numberOfLines={1} style={[text.size.medium, text.color.black]}>
									{displayName}
								</Text>
							</View>
						</View>
						<View
							style={[
								flex.direction.row,
								flex.align.center,
								{
									height: text.size.small.fontSize * 1.8, // Keep row height even if no description/message
								},
							]}
						>
							<Text
								numberOfLines={1}
								style={[{ flexGrow: 2, flexShrink: 1 }, text.size.small, text.color.grey]}
							>
								{desc}
							</Text>
							{/* Message status */}
							<View
								style={[
									row.item.center,
									row.right,
									{
										flexBasis: 16,
										flexGrow: 0,
										flexShrink: 0,
									},
								]}
							>
								<Icon name='info-outline' width={15} height={15} fill={color.dark.blue} />
							</View>
						</View>
					</View>
				</View>
			</TouchableHighlight>
		</>
	)
}

export const Conversations: React.FC<ConversationsProps> = ({
	items,
	suggestions,
	configurations,
	style,
	onLayout,
	addBot,
}) => {
	const [{ background }] = useStyles()
	const { t } = useTranslation()
	const { navigate } = useNavigation()
	const { persistentOptions } = useMsgrContext()

	return items.length || suggestions.length || configurations.length ? (
		<SafeAreaConsumer>
			{(insets) => (
				<View
					onLayout={onLayout}
					style={[
						style,
						background.white,
						{ paddingBottom: 100 - (insets?.bottom || 0) + (insets?.bottom || 0) },
					]}
				>
					{configurations.map((config) => (
						<SuggestionsItem
							key={config.key}
							displayName={t(config.displayName)}
							desc={t(config.desc)}
							link=''
							icon={config.icon}
							addBot={async () => {
								if (config.key === 'network') {
									if (persistentOptions.preset.value === 'full-anonymity') {
										navigate.main.networkOptions({ checkP2POnly: true })
									} else {
										navigate.onboarding.servicesAuth({ checkP2POnly: true })
									}
								} else {
									await checkPermissions(['notification'])
								}
							}}
							style={{ backgroundColor: config.color }}
						/>
					))}

					{items.map((i) => (
						<ConversationsItem key={i.publicKey} {...i} />
					))}
					{suggestions.map((i: any, key: any) => (
						<SuggestionsItem
							key={key}
							{...i}
							desc={`${t('main.suggestion-display-name-initial')} ${i.displayName}`}
							addBot={addBot}
						/>
					))}
				</View>
			)}
		</SafeAreaConsumer>
	) : null
}
