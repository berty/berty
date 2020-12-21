import React, { useEffect, useMemo, useRef, useState } from 'react'
import { CommonActions, useNavigation as useNativeNavigation } from '@react-navigation/native'
import { Translation } from 'react-i18next'
import {
	ScrollView,
	SectionList,
	Text as TextNative,
	TextInput,
	TouchableHighlight,
	TouchableOpacity,
	View,
	ViewProps,
} from 'react-native'
import { EdgeInsets, SafeAreaConsumer } from 'react-native-safe-area-context'
import { Icon, Text } from '@ui-kitten/components'
import pickBy from 'lodash/pickBy'
import LottieView from 'lottie-react-native'
import BlurView from '../shared-components/BlurView'
import { HomeModal } from './HomeModal'

import { Routes, ScreenProps, useNavigation } from '@berty-tech/navigation'
import {
	useClient,
	useConversationsCount,
	useIncomingContactRequests,
	useLastConvInteraction,
	useMsgrContext,
	useNotificationsInhibitor,
	useSortedConversationList,
} from '@berty-tech/store/hooks'
import beapi from '@berty-tech/api'
import { useStyles } from '@berty-tech/styles'

import { useLayout } from '../hooks'
import { pbDateToNum, timeFormat } from '../helpers'
import FromNow from '../shared-components/FromNow'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'
import { createSections } from './Search'
import { HintBody } from '../shared-components/HintBody'
import { playSound } from '../sounds'
import { Footer } from './Footer'
import { AccountAvatar, BotAvatar, ContactAvatar, ConversationAvatar } from '../avatars'
import EmptyChat from './empty_chat.svg'
import { AddBot } from '@berty-tech/components/modals'

//
// Main List
//

type ConversationsProps = ViewProps & {
	items: Array<any>
	suggestions: Array<any>
	addBot: any
}

type ConversationsItemProps = any

//
// Styles
//

const useStylesContactRequest: any = () => {
	const [{ border, padding, margin, width, height, row, background, flex }] = useStyles()

	return {
		contactReqContainer: [
			background.white,
			border.radius.medium,
			border.shadow.medium,
			flex.align.center,
			flex.justify.flexEnd,
			height(180),
			margin.medium,
			margin.top.huge,
			margin.bottom.medium,
			padding.horizontal.small,
			padding.top.scale(33),
			padding.bottom.medium,
			width(121),
		],
		declineButton: [
			background.white,
			border.color.light.grey,
			border.medium,
			border.medium,
			border.radius.tiny,
			border.shadow.tiny,
			flex.align.center,
			height(25),
			padding.tiny,
			{ flexShrink: 2, flexGrow: 0 },
		],
		acceptButton: [
			background.light.blue,
			border.radius.tiny,
			border.shadow.tiny,
			flex.align.center,
			height(25),
			padding.horizontal.tiny,
			flex.justify.center,
			{
				flexWrap: 'wrap',
			},
		],
		buttonsWrapper: [
			flex.align.center,

			flex.direction.row,
			flex.justify.spaceAround,
			margin.top.scale(3),
			row.item.bottom,
			{
				flexGrow: 0,
				flexShrink: 2,
				width: '100%',
				minHeight: 0,
			},
		],
	}
}

// Functions

const ContactRequest: React.FC<beapi.messenger.IContact> = ({
	displayName,
	publicKey,
	conversationPublicKey,
	createdDate: createdDateStr,
}) => {
	const client = useClient()
	const decline: any = () => {} // Messenger.useDiscardContactRequest()
	const { dispatch } = useNavigation()
	const {
		contactReqContainer,
		declineButton,
		acceptButton,
		buttonsWrapper,
	} = useStylesContactRequest()

	const id = publicKey
	const [{ border, padding, row, absolute, text, color }, { scaleSize }] = useStyles()
	const createdDate = pbDateToNum(createdDateStr) || Date.now()
	const textColor = '#AFB1C0'
	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<TouchableOpacity
					style={contactReqContainer}
					onPress={() => {
						if (conversationPublicKey) {
							dispatch(
								CommonActions.navigate({
									name: Routes.Chat.OneToOne,
									params: {
										convId: conversationPublicKey,
									},
								}),
							)
						}
					}}
				>
					<View style={[absolute.center, border.shadow.medium, absolute.scale({ top: -27.5 })]}>
						<ContactAvatar publicKey={publicKey} size={54} />
					</View>
					<View
						style={{
							flexGrow: 2,
							justifyContent: 'center',
							flexShrink: 1,
							flexBasis: 45,
							minHeight: 0,
						}}
					>
						<Text
							style={[text.align.center, text.color.black, text.bold.small, text.size.scale(14)]}
							numberOfLines={2}
						>
							{displayName || ''}
						</Text>
					</View>
					<View
						style={{
							flexGrow: 1,
							flexShrink: 1,
							justifyContent: 'flex-end',
							alignSelf: 'center',
							minHeight: 0,
						}}
					>
						<Text
							style={[
								text.size.scale(11),
								text.align.center,
								{
									lineHeight: (text.size.scale(11) as any).fontSize * 1.6,
									color: textColor,
								},
							]}
						>
							{t('main.home.requests.card-title')}
						</Text>
						<Text
							style={[
								text.size.scale(10),
								text.align.center,
								{ lineHeight: (text.size.scale(11) as any).fontSize * 2, color: '#888' },
							]}
						>
							<FromNow date={createdDate} />
						</Text>
					</View>
					<View style={buttonsWrapper}>
						<TouchableOpacity
							style={declineButton}
							onPress={(): void => {
								decline({ id })
							}}
						>
							<Icon
								name='close-outline'
								fill={textColor}
								width={17 * scaleSize}
								height={17 * scaleSize}
								style={[padding.tiny, row.item.justify]}
							/>
						</TouchableOpacity>
						<TouchableOpacity
							style={acceptButton}
							onPress={() =>
								client
									?.contactAccept({ publicKey })
									.then(() => {
										playSound('contactRequestAccepted')
									})
									.catch((err: any) => console.warn('Failed to accept contact request:', err))
							}
						>
							<Icon
								name='checkmark-outline'
								fill={color.blue}
								width={17 * scaleSize}
								height={17 * scaleSize}
							/>
							<Text style={[text.size.scale(10), text.color.blue, padding.horizontal.tiny]}>
								{t('main.home.requests.accept')}
							</Text>
						</TouchableOpacity>
					</View>
				</TouchableOpacity>
			)}
		</Translation>
	)
}

const UnreadCount: React.FC<{ value: number; isConvBadge?: boolean }> = ({
	value,
	isConvBadge = false,
}) => {
	const dimension = isConvBadge ? 15 : 21
	const fontSize = isConvBadge ? 10 : 13
	const lineHeight = isConvBadge ? 14 : 17

	return value ? (
		<View
			style={{
				backgroundColor: 'red',
				justifyContent: 'center',
				borderRadius: 1000,
				height: dimension,
				minWidth: dimension,
				paddingHorizontal: 2,
			}}
		>
			<Text
				style={{
					color: 'white',
					fontWeight: '700',
					textAlign: 'center',
					fontSize,
					lineHeight,
				}}
			>
				{value.toString()}
			</Text>
		</View>
	) : null
}

const IncomingRequests: React.FC<any> = ({ items, onLayout }) => {
	const [{ padding, text, background, row }, { scaleSize }] = useStyles()
	return items?.length ? (
		<Translation>
			{(t: any): React.ReactNode => (
				<View onLayout={onLayout} style={[background.blue, padding.top.scale(50)]}>
					<View>
						<View style={[row.left]}>
							<Text
								style={[
									text.color.white,
									text.size.huge,
									text.bold.medium,
									padding.horizontal.medium,
									padding.bottom.small,
								]}
							>
								{t('main.home.requests.title')}
							</Text>
							<View style={{ position: 'relative', top: -2, left: -(23 * scaleSize) }}>
								<UnreadCount value={items.length} />
							</View>
						</View>
						<ScrollView horizontal showsHorizontalScrollIndicator={false}>
							{items.map((c: any) => {
								return <ContactRequest key={c.publicKey} {...c} />
							})}
						</ScrollView>
					</View>
				</View>
			)}
		</Translation>
	) : null
}

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

	const [{ color, row, border, flex, padding, text, opacity, margin }] = useStyles()
	const { dispatch } = useNavigation()
	const isSuggestion = Object.values(ctx.persistentOptions?.suggestions).find(
		(v: any) => v.pk === contact?.publicKey,
	)

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

	let messageType: 'picture' | 'audio' = ''

	const userDisplayName =
		type === beapi.messenger.Conversation.Type.MultiMemberType
			? displayName
			: contact?.displayName || ''

	if (lastInte?.medias?.length) {
		if (lastInte.medias[0].mimeType?.startsWith('image')) {
			messageType = 'audio'
			description = `${lastInte.isMe ? 'You' : userDisplayName} sent ${
				lastInte.isMe ? userDisplayName : 'you'
			} ${lastInte.medias.length > 1 ? lastInte.medias.length : 'a'} pic`
		} else if (lastInte.medias[0].mimeType?.startsWith('audio')) {
			messageType = 'audio'
			description = `${lastInte.isMe ? 'You' : userDisplayName} sent ${
				lastInte.isMe ? userDisplayName : 'you'
			} ${lastInte.medias.length > 1 ? lastInte.medias.length : 'an'} audio`
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
					{isSuggestion ? (
						<BotAvatar size={40} />
					) : (
						<ConversationAvatar size={40} publicKey={publicKey} />
					)}
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
								{(fake && 'FAKE - ') || ''} {userDisplayName}
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
								height={20}
								width={20}
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
							{lastInte && lastInte.isMe && (
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

const SuggestionsItem: React.FC<{ displayName: string; link: string; addBot: any }> = ({
	displayName,
	link,
	addBot,
}) => {
	const [{ color, row, border, flex, padding, text, margin }] = useStyles()
	return (
		<>
			<TouchableHighlight
				underlayColor={color.light.grey}
				style={[
					padding.horizontal.medium,
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
						<BotAvatar size={40} />
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
								{`Click here to add ${displayName}`}
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

const Conversations: React.FC<ConversationsProps> = ({
	items,
	suggestions,
	style,
	onLayout,
	addBot,
}) => {
	const [{ background }] = useStyles()
	return items.length || suggestions.length ? (
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
					{items.map((i) => (
						<ConversationsItem key={i.publicKey} {...i} />
					))}
					{suggestions.map((i: any, key: any) => (
						<SuggestionsItem key={key} {...i} addBot={addBot} />
					))}
				</View>
			)}
		</SafeAreaConsumer>
	) : null
}

const HomeHeader: React.FC<
	ViewProps & {
		hasRequests: boolean
		scrollRef: React.RefObject<ScrollView>
		isOnTop: boolean
		value: string
		onChange: any
		refresh: boolean
		setRefresh: any
	}
> = ({ hasRequests, scrollRef, onLayout, isOnTop, value, onChange, refresh, setRefresh }) => {
	const [
		{ border, width, height, padding, text, background, margin, row },
		{ scaleHeight },
	] = useStyles()
	const { navigate } = useNativeNavigation()
	const [focus, setFocus] = useState<any>(null)
	const animate = useRef<any>(null)

	let paddingTop: any
	if (!value?.length) {
		if (!hasRequests) {
			paddingTop = 40
		} else {
			if (isOnTop) {
				paddingTop = 40
			} else {
				paddingTop = 20
			}
		}
	} else {
		paddingTop = 40
	}

	useEffect(() => {
		if (refresh) {
			setRefresh(false)
			animate.current.play()
		}
	}, [refresh, setRefresh, animate])

	return (
		<View onLayout={onLayout}>
			<Translation>
				{(t: any): React.ReactNode => (
					<View>
						<View
							style={[
								background.white,
								border.radius.top.big,
								padding.horizontal.scale(27),
								{
									alignItems: 'center',
									paddingTop: paddingTop * scaleHeight,
								},
							]}
						>
							{hasRequests && !isOnTop && !value?.length && (
								<View style={[width(42), height(4), { backgroundColor: '#F1F4F6' }]} />
							)}
							<View
								style={{
									flexDirection: 'row',
									alignItems: 'center',
									paddingVertical: 15,
								}}
							>
								<View
									style={{
										flex: 1,
										alignItems: 'flex-end',
										marginLeft: 5,
									}}
								>
									<TouchableOpacity
										activeOpacity={1}
										onPress={() => {
											animate.current.play()
											scrollRef.current?.scrollTo({ y: 0, animated: true })
										}}
									>
										<LottieView
											ref={animate}
											style={{ width: 40 }}
											source={require('./berty_logo_animated.json')}
											loop={false}
										/>
									</TouchableOpacity>
								</View>
								<TouchableOpacity
									style={[
										{
											flex: 12,
											flexDirection: 'row',
											justifyContent: 'flex-start',
											alignItems: 'center',
											backgroundColor: value?.length ? '#FFF0D5' : '#F1F4F6',
										},
										padding.vertical.scale(12),
										padding.left.medium,
										margin.left.small,
										margin.right.scale(25),
										border.radius.medium,
									]}
									activeOpacity={1}
									onPress={() => focus?.focus()}
								>
									<View style={[row.center]}>
										<Icon
											name='search-outline'
											fill={value?.length ? '#FFAE3A' : '#8F9BB3'}
											width={20}
											height={20}
										/>
									</View>

									<View
										style={[
											!value?.length && margin.left.medium,
											{
												flex: 6,
												flexDirection: 'row',
												alignItems: 'flex-start',
											},
										]}
									>
										<TextInput
											ref={(ref) => setFocus(ref)}
											placeholder={t('main.home.input-placeholder')}
											placeholderTextColor='#D3D9E1'
											autoCorrect={false}
											autoCapitalize='none'
											value={value}
											onChangeText={(s: string) => onChange(s)}
											style={[
												{ fontFamily: 'Open Sans', color: '#FFAE3A' },
												value?.length ? padding.right.scale(25) : padding.right.medium,
												text.bold.small,
												text.align.center,
												text.size.medium,
											]}
										/>
									</View>
									{value?.length ? (
										<TouchableOpacity
											style={{
												justifyContent: 'center',
												flex: 1,
												flexDirection: 'row',
											}}
											onPress={() => onChange('')}
										>
											<Icon name='close-circle-outline' fill='#FFAE3A' width={20} height={20} />
										</TouchableOpacity>
									) : null}
								</TouchableOpacity>
								<TouchableOpacity
									style={{
										flex: 1,
										flexDirection: 'row',
										justifyContent: 'center',
										alignItems: 'center',
									}}
									onPress={() => navigate('Settings.Home')}
								>
									<AccountAvatar size={40} />
								</TouchableOpacity>
							</View>
						</View>
					</View>
				)}
			</Translation>
		</View>
	)
}

const SearchComponent: React.FC<{
	insets: EdgeInsets | null
	conversations: { [key: string]: beapi.messenger.IConversation | undefined }
	contacts: { [key: string]: beapi.messenger.IContact | undefined }
	interactions: { [key: string]: beapi.messenger.IInteraction | undefined }
	hasResults: boolean
	value: string
}> = ({ insets, conversations, contacts, interactions, hasResults, value }) => {
	const [
		{ height, width, background, padding, text, border, margin },
		{ scaleHeight },
	] = useStyles()
	const validInsets = useMemo(() => insets || { top: 0, bottom: 0, left: 0, right: 0 }, [insets])

	const sortedConversations = useMemo(() => {
		return Object.values(conversations).sort((a, b) => {
			return pbDateToNum(b?.lastUpdate) - pbDateToNum(a?.lastUpdate)
		})
	}, [conversations])

	const sortedInteractions = useMemo(() => {
		return Object.values(interactions).sort((a, b) => {
			return pbDateToNum(b?.sentDate) - pbDateToNum(a?.sentDate)
		})
	}, [interactions])

	const sections = useMemo(
		() => createSections(sortedConversations, Object.values(contacts), sortedInteractions, value),
		[contacts, sortedConversations, sortedInteractions, value],
	)

	useEffect(() => {
		console.log(value, hasResults)
	})

	return hasResults ? (
		<SectionList
			style={{
				marginLeft: validInsets.left,
				marginRight: validInsets.right,
			}}
			stickySectionHeadersEnabled={false}
			bounces={false}
			keyExtractor={(item: any) => item.cid || item.publicKey}
			sections={sections}
			renderSectionHeader={({ section }) => {
				const { title } = section
				let isFirst
				sections?.map((value: any, key: any) => {
					if (value.data?.length && value.title === section.title) {
						switch (key) {
							case 0:
								isFirst = true
								break
							case 1:
								isFirst = sections[0].data?.length ? false : true
								break
							case 2:
								isFirst = sections[0].data?.length || sections[1].data?.length ? false : true
								break
						}
					}
				})
				return title ? (
					<View
						style={[
							!isFirst && border.radius.top.big,
							background.white,
							!isFirst && {
								shadowOpacity: 0.1,
								shadowRadius: 8,
								shadowOffset: { width: 0, height: -12 },
							},
						]}
					>
						<View style={[padding.horizontal.medium]}>
							<View style={{ flexDirection: 'row', justifyContent: 'center' }}>
								<View
									style={[width(42), height(4), margin.top.medium, { backgroundColor: '#F1F4F6' }]}
								/>
							</View>
							<TextNative
								style={[
									text.size.scale(25),
									text.color.black,
									text.bold.medium,
									{ fontFamily: 'Open Sans' },
								]}
							>
								{title}
							</TextNative>
						</View>
					</View>
				) : null
			}}
			ListFooterComponent={() => (
				// empty div at bottom of list

				// Workaround to make sure nothing is hidden behind footer;
				// adding padding/margin to this or a wrapping parent doesn't work
				<View style={[height(_approxFooterHeight + 20)]} />
			)}
		/>
	) : (
		<View style={{ position: 'relative' }}>
			<Translation>
				{(t: any): React.ReactNode => (
					<TextNative
						style={[
							text.color.black,
							text.size.big,
							text.bold.small,
							text.align.center,
							{
								fontFamily: 'Open Sans',
								position: 'absolute',
								top: 230,
								left: 0,
								right: 0,
								color: '#FFAE3A',
							},
						]}
					>
						{t('main.home.search.no-results')}
					</TextNative>
				)}
			</Translation>
			<Icon
				name='search'
				width={500}
				height={500}
				fill='#FFFBF6'
				style={{ position: 'absolute', top: 0, right: -63 }}
			/>
			<View style={[margin.top.scale(370 * scaleHeight)]}>
				<HintBody />
			</View>
		</View>
	)
}

const _approxFooterHeight = 90

const T = beapi.messenger.StreamEvent.Notified.Type

export const Home: React.FC<ScreenProps.Main.Home> = () => {
	useNotificationsInhibitor((_ctx, notif) =>
		[T.TypeMessageReceived, T.TypeContactRequestReceived, T.TypeContactRequestSent].includes(
			notif.type as any,
		)
			? 'sound-only'
			: false,
	)
	// TODO: do something to animate the requests
	const requests: any[] = useIncomingContactRequests()
	const conversations: any[] = useSortedConversationList()
	const isConversation: number = useConversationsCount()
	const [layoutRequests, onLayoutRequests] = useLayout()
	const [, onLayoutHeader] = useLayout()
	const [, onLayoutConvs] = useLayout()
	const [isOnTop, setIsOnTop] = useState<boolean>(false)
	const [searchText, setSearchText] = useState<string>('')
	const [refresh, setRefresh] = useState<boolean>(false)
	const [isModalVisible, setModalVisibility] = useState<boolean>(false)
	const [isAddBot, setIsAddBot] = useState({
		link: '',
		displayName: '',
		isVisible: false,
	})

	const { navigate } = useNativeNavigation()

	const [
		{ text, opacity, flex, margin, background },
		{ windowHeight, scaleSize, scaleHeight },
	] = useStyles()
	const scrollRef = useRef<ScrollView>(null)

	const searching = !!searchText
	const lowSearchText = searchText.toLowerCase()
	const searchCheck = React.useCallback(
		(searchIn?: string | null | false | 0) =>
			(searchIn || '').toLowerCase().includes(lowSearchText),
		[lowSearchText],
	)

	const ctx = useMsgrContext()
	const suggestions = Object.values(ctx.persistentOptions?.suggestions).filter(
		(i: any) => i.state === 'unread',
	)
	const isSuggestion: number = suggestions.length

	const searchConversations = React.useMemo(
		() =>
			searching
				? pickBy(
						ctx.conversations,
						(val: any) =>
							val.type === beapi.messenger.Conversation.Type.MultiMemberType &&
							searchCheck(val.displayName),
				  )
				: {},
		[ctx.conversations, searchCheck, searching],
	)

	const searchContacts = React.useMemo(
		() => (searching ? pickBy(ctx.contacts, (val: any) => searchCheck(val.displayName)) : {}),
		[ctx.contacts, searchCheck, searching],
	)

	const searchInteractions = React.useMemo(() => {
		if (!searching) {
			return {}
		}
		const allInteractions: any = Object.values(ctx.interactions).reduce(
			(r: any, intes: any) => ({ ...r, ...intes }),
			{},
		)
		return pickBy(
			allInteractions,
			(inte) =>
				inte.type === beapi.messenger.AppMessage.Type.TypeUserMessage &&
				searchCheck(inte.payload?.body),
		)
	}, [ctx.interactions, searchCheck, searching])

	const hasResults = [searchConversations, searchContacts, searchInteractions].some(
		(c) => Object.keys(c).length > 0,
	)
	const styleBackground = useMemo(
		() => (requests.length > 0 && !searchText?.length ? background.blue : background.white),
		[background.blue, background.white, requests.length, searchText],
	)

	return (
		<>
			<Translation>
				{(t: any): React.ReactNode => (
					<View style={[flex.tiny, styleBackground]}>
						<SwipeNavRecognizer onSwipeLeft={() => !isModalVisible && navigate('Settings.Home')}>
							<SafeAreaConsumer>
								{(insets: EdgeInsets | null) => (
									<>
										<ScrollView
											ref={scrollRef}
											stickyHeaderIndices={!searchText?.length && !hasResults ? [1] : [0]}
											showsVerticalScrollIndicator={false}
											scrollEventThrottle={16}
											keyboardShouldPersistTaps={'handled'}
											onScrollEndDrag={(e) => {
												if (e.nativeEvent.contentOffset.y < 0) {
													setRefresh(true)
												}
											}}
											onScroll={(e) => {
												if (e.nativeEvent.contentOffset) {
													if (e.nativeEvent.contentOffset.y >= layoutRequests.height) {
														setIsOnTop(true)
													} else {
														setIsOnTop(false)
													}
												}
											}}
										>
											{!searchText?.length && (
												<IncomingRequests items={requests} onLayout={onLayoutRequests} />
											)}
											<HomeHeader
												isOnTop={isOnTop}
												hasRequests={requests.length > 0}
												scrollRef={scrollRef}
												onLayout={onLayoutHeader}
												value={searchText}
												onChange={setSearchText}
												refresh={refresh}
												setRefresh={setRefresh}
											/>
											{searchText?.length ? (
												<SearchComponent
													insets={insets}
													conversations={searchConversations}
													contacts={searchContacts}
													interactions={searchInteractions}
													value={searchText}
													hasResults={hasResults}
												/>
											) : (
												<>
													<Conversations
														items={conversations}
														suggestions={suggestions}
														onLayout={onLayoutConvs}
														addBot={setIsAddBot}
													/>
													{!isConversation && !isSuggestion && (
														<View style={[background.white]}>
															<View
																style={[
																	flex.justify.center,
																	flex.align.center,
																	margin.top.scale(60),
																]}
															>
																<View>
																	<EmptyChat width={350 * scaleSize} height={350 * scaleHeight} />
																	<TextNative
																		style={[
																			text.align.center,
																			text.color.grey,
																			text.bold.small,
																			opacity(0.3),
																			margin.top.big,
																		]}
																	>
																		{t('main.home.no-contacts')}
																	</TextNative>
																</View>
															</View>
														</View>
													)}
													{requests.length > 0 && (
														<View
															style={[
																{
																	backgroundColor: 'white',
																	position: 'absolute',
																	bottom: windowHeight * -1,
																	height: windowHeight,
																	width: '100%',
																},
															]}
														/>
													)}
												</>
											)}
										</ScrollView>
										{isModalVisible && (
											<>
												<BlurView
													blurType='light'
													style={{
														position: 'absolute',
														left: 0,
														right: 0,
														top: 0,
														bottom: 0,
														height: windowHeight,
														opacity: 0.94,
														backgroundColor: 'transparent',
													}}
												/>
												<HomeModal closeModal={() => setModalVisibility(false)} />
											</>
										)}

										{!searchText?.length && (
											<Footer
												openModal={() => setModalVisibility(true)}
												isModalVisible={isModalVisible}
											/>
										)}
										{isAddBot.isVisible && (
											<AddBot
												link={isAddBot.link}
												displayName={isAddBot.displayName}
												closeModal={() => setIsAddBot({ ...isAddBot, isVisible: false })}
											/>
										)}
									</>
								)}
							</SafeAreaConsumer>
						</SwipeNavRecognizer>
					</View>
				)}
			</Translation>
		</>
	)
}

export default Home
