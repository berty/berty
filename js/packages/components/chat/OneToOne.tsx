import React, { useEffect, useRef, useState } from 'react'
import {
	ActivityIndicator,
	Platform,
	SectionList,
	SectionListData,
	SectionListRenderItem,
	StyleSheet,
	Text as TextNative,
	TouchableOpacity,
	View,
	ViewToken,
} from 'react-native'
import { Icon, Text } from '@ui-kitten/components'
import { CommonActions } from '@react-navigation/native'
import { Translation, useTranslation } from 'react-i18next'
import moment from 'moment'
import { groupBy } from 'lodash'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { KeyboardAvoidingView } from '@berty-tech/components/shared-components/KeyboardAvoidingView'
import { useStyles } from '@berty-tech/styles'
import { Routes, ScreenProps, useNavigation } from '@berty-tech/navigation'
import beapi from '@berty-tech/api'
import {
	useContact,
	useConversation,
	useMsgrContext,
	useReadEffect,
	useSortedConvInteractions,
	useClient,
	useNotificationsInhibitor,
} from '@berty-tech/store/hooks'

import { Message } from './message'
import { MessageInvitationButton } from './message/MessageInvitation'
import { MessageSystemWrapper } from './message/MessageSystemWrapper'
import BlurView from '../shared-components/BlurView'
import { ContactAvatar } from '../avatars'
import { pbDateToNum, timeFormat } from '../helpers'
import { useLayout } from '../hooks'
import { ChatDate, ChatFooter } from './common'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'

//
// Chat
//

const useStylesOneToOne = () => {
	const [{ text }] = useStyles()
	return {
		dateMessage: [text.size.scale(11), text.bold.small, text.color.grey],
	}
}

const CenteredActivityIndicator: React.FC = (props: ActivityIndicator['props']) => {
	const { ...propsToPass } = props
	return (
		<View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
			<ActivityIndicator {...propsToPass} />
		</View>
	)
}

export const ChatHeader: React.FC<{ convPk: any; stickyDate: any; showStickyDate: any }> = ({
	convPk,
	stickyDate,
	showStickyDate,
}) => {
	const insets = useSafeAreaInsets()
	const { navigate, goBack } = useNavigation()
	const conv = useConversation(convPk)
	const contact = useContact(conv?.contactPublicKey || null)

	const [{ padding, text, opacity, color }] = useStyles()

	const [layoutHeader, onLayoutHeader] = useLayout() // to position date under blur

	if (!conv || !contact) {
		goBack()
		console.warn('OneToOne: no conv', conv, contact)
		return <CenteredActivityIndicator />
	}
	const title = (conv as any).fake ? `FAKE - ${contact.displayName}` : contact?.displayName || ''
	const outerElemsSize = 45
	return (
		<View style={{ position: 'absolute', top: 0, left: 0, right: 0 }} onLayout={onLayoutHeader}>
			<BlurView
				blurType='light'
				blurAmount={30}
				style={{ position: 'absolute', bottom: 0, top: 0, left: 0, right: 0 }}
			/>
			<View
				style={[
					{
						alignItems: 'center',
						flexDirection: 'row',
						justifyContent: 'space-between',
						marginTop: insets.top,
					},
					padding.medium,
				]}
			>
				<TouchableOpacity onPress={goBack} style={{ width: outerElemsSize }}>
					<Icon name='arrow-back-outline' width={25} height={25} fill={color.black} />
				</TouchableOpacity>
				<Text numberOfLines={1} style={[text.bold.medium, text.size.scale(20)]}>
					{title}
				</Text>
				<TouchableOpacity
					activeOpacity={contact ? 0.2 : 0.5}
					style={[!contact ? opacity(0.5) : null]}
					onPress={() => navigate.chat.oneToOneSettings({ convId: convPk })}
				>
					<ContactAvatar size={outerElemsSize} publicKey={conv.contactPublicKey} />
				</TouchableOpacity>
			</View>
			{stickyDate && showStickyDate && layoutHeader?.height && (
				<View
					style={{
						position: 'absolute',
						top: layoutHeader.height + 10,
						left: 0,
						right: 0,
					}}
				>
					<ChatDate date={stickyDate} />
				</View>
			)}
		</View>
	)
}

const InfosContactState: React.FC<{ state: any }> = ({ state }) => {
	const [{ text, border, padding, margin }] = useStyles()
	const textColor = '#4E58BF'
	return (
		<View
			style={[
				border.radius.medium,
				padding.tiny,
				padding.horizontal.medium,
				margin.top.tiny,
				{
					flexDirection: 'row',
					justifyContent: 'space-evenly',
					alignItems: 'center',
					backgroundColor: '#EDEEF8',
				},
			]}
		>
			<Icon name='info-outline' fill={textColor} width={25} height={25} />
			<Text style={[text.italic, text.bold.small, padding.left.small, { color: textColor }]}>
				{state}
			</Text>
		</View>
	)
}

const ContactRequestBox: React.FC<{ contact: any; isAccepted: boolean }> = ({
	contact,
	isAccepted,
}) => {
	const { publicKey, displayName } = contact
	const [{ row, flex, text, margin, color }] = useStyles()
	const [acceptDisabled, setAcceptDisabled] = useState<boolean>(false)

	const ctx = useMsgrContext()
	const client = useClient()
	const decline: any = () => {}

	useEffect(() => {
		if (isAccepted) {
			setAcceptDisabled(true)
		}
	}, [isAccepted])

	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<View>
					<View style={[row.left, flex.align.center, flex.justify.center]}>
						<TextNative
							style={[
								text.color.black,
								text.size.scale(15),
								text.bold.medium,
								{ fontFamily: 'Open Sans' },
							]}
						>
							{t('chat.one-to-one.contact-request-box.title')}
						</TextNative>
					</View>
					<View style={[margin.top.small, flex.align.center, flex.justify.center]}>
						<ContactAvatar publicKey={publicKey} size={40} style={margin.bottom.small} />
						<TextNative
							style={[
								text.color.black,
								text.size.scale(13),
								text.bold.small,
								margin.bottom.small,
								{ fontFamily: 'Open Sans' },
							]}
						>
							{displayName}
						</TextNative>
					</View>
					<View
						style={[row.center, flex.justify.spaceEvenly, flex.align.center, margin.top.medium]}
					>
						<MessageInvitationButton
							onPress={() => decline()}
							activeOpacity={!acceptDisabled ? 0.2 : 1}
							icon='close-outline'
							color={color.grey}
							title={t('chat.one-to-one.contact-request-box.refuse-button')}
							backgroundColor={color.white}
							styleOpacity={0.6}
							disabled
						/>
						<MessageInvitationButton
							onPress={() =>
								client &&
								client
									.contactAccept({ publicKey })
									.then(() => {
										ctx.playSound('contactRequestAccepted')
									})
									.catch((err: any) => console.warn('Failed to accept contact request:', err))
							}
							activeOpacity={!acceptDisabled ? 0.2 : 1}
							icon='checkmark-outline'
							color={!acceptDisabled ? color.blue : color.green}
							title={
								!acceptDisabled
									? t('chat.one-to-one.contact-request-box.accept-button')
									: t('chat.one-to-one.contact-request-box.accepted-button')
							}
							backgroundColor={!acceptDisabled ? color.light.blue : color.light.green}
							styleOpacity={acceptDisabled ? 0.6 : undefined}
							disabled={acceptDisabled}
						/>
					</View>
				</View>
			)}
		</Translation>
	)
}

const InfosChat: React.FC<beapi.messenger.IConversation> = ({
	createdDate: createdDateStr,
	publicKey,
}) => {
	const [{ flex, text, padding, margin }] = useStyles()
	const { dateMessage } = useStylesOneToOne()
	const createdDate = pbDateToNum(createdDateStr) || Date.now()
	const ctx = useMsgrContext()
	const contact =
		Object.values(ctx.contacts).find((c: any) => c.conversationPublicKey === publicKey) || null

	const isAccepted = contact?.state === beapi.messenger.Contact.State.Accepted
	const isIncoming = contact?.state === beapi.messenger.Contact.State.IncomingRequest
	const textColor = '#4E58BF'

	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<View style={[padding.medium, flex.align.center]}>
					<ChatDate date={createdDate} />
					{!isIncoming ? (
						<MessageSystemWrapper styleContainer={[margin.bottom.small, margin.top.large]}>
							<Text style={[text.align.center, { color: textColor }]}>
								{isAccepted
									? t('chat.one-to-one.infos-chat.connection-confirmed')
									: t('chat.one-to-one.infos-chat.request-sent')}
							</Text>
						</MessageSystemWrapper>
					) : (
						<MessageSystemWrapper>
							<ContactRequestBox contact={contact} isAccepted={isAccepted} />
						</MessageSystemWrapper>
					)}
					{!isAccepted && contact?.state !== beapi.messenger.Contact.State.Undefined && (
						<>
							<View style={[flex.align.center]}>
								<Text style={[margin.top.tiny, dateMessage]}>
									{timeFormat.fmtTimestamp1(pbDateToNum(createdDate))}
								</Text>
							</View>
							<InfosContactState
								state={
									isIncoming
										? t('chat.one-to-one.infos-chat.incoming')
										: t('chat.one-to-one.infos-chat.outgoing')
								}
							/>
						</>
					)}
				</View>
			)}
		</Translation>
	)
}

const _createSections = (items: any[]) => {
	try {
		const grouped = groupBy(items, (m) =>
			moment(pbDateToNum(m?.sentDate || Date.now())).format('DD/MM/YYYY'),
		)
		const mapped = Object.entries(grouped).map(([k, v], i) => ({ title: k, data: v, index: i }))
		return mapped
	} catch (e) {
		console.warn('could not make sections from data:', e)
		return []
	}
}

const MessageList: React.FC<{
	convPk: string
	scrollToMessage?: string
	setStickyDate: any
	setShowStickyDate?: any
}> = ({ convPk, scrollToMessage, setStickyDate, setShowStickyDate }) => {
	const ctx: any = useMsgrContext()
	const conv = ctx.conversations[convPk]
	const messages = useSortedConvInteractions(convPk).filter(
		(msg) =>
			msg.type === beapi.messenger.AppMessage.Type.TypeUserMessage ||
			msg.type === beapi.messenger.AppMessage.Type.TypeGroupInvitation ||
			msg.type === beapi.messenger.AppMessage.Type.TypeMonitorMetadata,
	)

	if (conv.replyOptions !== null) {
		messages.push(conv.replyOptions)
	}
	const [{ overflow, row, flex, margin }, { scaleHeight }] = useStyles()
	const flatListRef: any = useRef(null)

	const onScrollToIndexFailed = () => {
		// Not sure why this happens (something to do with item/screen dimensions I think)
		// FIXME: next line is crashing the app
		// flatListRef.current?.scrollToIndex({ index: 0 })
	}
	const initialScrollIndex = React.useMemo(() => {
		if (scrollToMessage) {
			for (let i = 0; i < messages.length; i++) {
				if (messages[i] && messages[i].cid === scrollToMessage) {
					return i
				}
			}
		}
	}, [messages, scrollToMessage])

	const items: any = React.useMemo(() => {
		return messages?.reverse() || []
	}, [messages])

	const sections: any = React.useMemo(() => _createSections(items), [items])

	const renderDateFooter: (info: { section: SectionListData<any> }) => React.ReactElement<any> = ({
		section,
	}) => {
		return (
			<View style={[margin.bottom.tiny]}>
				{section?.index > 0 && (
					<ChatDate date={moment(section.title, 'DD/MM/YYYY').unix() * 1000} />
				)}
			</View>
		)
	}
	const renderItem: SectionListRenderItem<any> = ({ item, index }) => {
		return (
			<Message
				id={item?.cid || `${index}`}
				convKind={beapi.messenger.Conversation.Type.ContactType}
				convPK={conv.publicKey}
				previousMessageId={index < items.length - 1 ? items[index + 1]?.cid : ''}
				nextMessageId={index > 0 ? items[index - 1]?.cid : ''}
			/>
		)
	}

	const updateStickyDate: (info: { viewableItems: ViewToken[] }) => void = ({ viewableItems }) => {
		if (viewableItems && viewableItems.length) {
			const minDate = viewableItems[viewableItems.length - 1]?.section?.title
			if (minDate) {
				setStickyDate(moment(minDate, 'DD/MM/YYYY').unix() * 1000)
			}
		}
	}

	return (
		<SectionList
			initialScrollIndex={initialScrollIndex}
			onScrollToIndexFailed={onScrollToIndexFailed}
			style={[overflow, row.item.fill, flex.tiny, { marginTop: 105 * scaleHeight }]}
			ref={flatListRef}
			keyboardDismissMode='on-drag'
			sections={sections}
			inverted
			keyExtractor={(item: any, index: number) => item?.cid || `${index}`}
			ListFooterComponent={<InfosChat {...conv} />}
			renderSectionFooter={renderDateFooter}
			renderItem={renderItem}
			onViewableItemsChanged={updateStickyDate}
			initialNumToRender={20}
			onScrollBeginDrag={() => {
				setShowStickyDate(true) // TODO: tmp
			}}
			onScrollEndDrag={() => {
				setTimeout(() => setShowStickyDate(false), 2000)
			}}
		/>
	)
}

const NT = beapi.messenger.StreamEvent.Notified.Type

export const OneToOne: React.FC<ScreenProps.Chat.OneToOne> = ({ route: { params } }) => {
	useNotificationsInhibitor((_ctx, notif) => {
		if (
			(notif.type === NT.TypeContactRequestSent &&
				(notif.payload as any)?.payload?.contact?.conversationPublicKey === params?.convId) ||
			(notif.type === NT.TypeMessageReceived &&
				(notif.payload as any)?.payload?.interaction?.conversationPublicKey === params?.convId)
		) {
			return 'sound-only'
		}
		return false
	})

	const [inputIsFocused, setInputFocus] = useState(false)
	const [{ flex, background }] = useStyles()
	useReadEffect(params?.convId, 1000)
	const { dispatch } = useNavigation()
	const { t } = useTranslation()
	const conv = useConversation(params?.convId)
	const contact = useContact(conv?.contactPublicKey)

	const isIncoming = contact?.state === beapi.messenger.Contact.State.IncomingRequest
	const isFooterDisable = isIncoming
	const placeholder = isFooterDisable
		? t('chat.one-to-one.incoming-input-placeholder')
		: t('chat.one-to-one.input-placeholder')

	const [stickyDate, setStickyDate] = useState(conv?.lastUpdate || null)
	const [showStickyDate, setShowStickyDate] = useState(false)
	const [isSwipe, setSwipe] = useState(true)

	return (
		<View style={[StyleSheet.absoluteFill, background.white, { flex: 1 }]}>
			<SwipeNavRecognizer
				onSwipeLeft={() =>
					isSwipe &&
					dispatch(
						CommonActions.navigate({
							name: Routes.Chat.OneToOneSettings,
							params: { convId: params?.convId },
						}),
					)
				}
			>
				<KeyboardAvoidingView
					style={[flex.tiny, { justifyContent: 'flex-start' }]}
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				>
					<MessageList
						convPk={params?.convId}
						scrollToMessage={params?.scrollToMessage || '0'}
						{...{ setStickyDate, setShowStickyDate }}
					/>
					<ChatFooter
						convPk={params?.convId}
						isFocused={inputIsFocused}
						setFocus={setInputFocus}
						disabled={isFooterDisable}
						placeholder={placeholder}
						setSwipe={setSwipe}
					/>
					<ChatHeader convPk={params?.convId || ''} {...{ stickyDate, showStickyDate }} />
				</KeyboardAvoidingView>
			</SwipeNavRecognizer>
		</View>
	)
}
