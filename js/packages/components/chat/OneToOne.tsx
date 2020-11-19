import React, { useEffect, useRef, useState } from 'react'
import {
	ActivityIndicator,
	KeyboardAvoidingView,
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

import { messenger as messengerpb } from '@berty-tech/api/index.js'
import * as api from '@berty-tech/api/index.pb'
import { PersistentOptionsKeys } from '@berty-tech/store/context'
import {
	useContact,
	useConversation,
	useMsgrContext,
	useReadEffect,
	useSortedConvInteractions,
	usePersistentOptions,
	useClient,
	useNotificationsInhibitor,
} from '@berty-tech/store/hooks'
import { Routes, ScreenProps, useNavigation } from '@berty-tech/navigation'
import { useStyles } from '@berty-tech/styles'

import { pbDateToNum, timeFormat } from '../helpers'
import { useLayout } from '../hooks'
import { playSound } from '../sounds'

import { Message } from './message'
import { MessageInvitationButton } from './message/MessageInvitation'
import { MessageSystemWrapper } from './message/MessageSystemWrapper'
import { ProceduralCircleAvatar } from '../shared-components/ProceduralCircleAvatar'

import BlurView from '../shared-components/BlurView'
import { ChatDate, ChatFooter } from './shared-components/Chat'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'

import Logo from '../main/1_berty_picto.svg'
import Avatar from '../modals/Buck_Berty_Icon_Card.svg'

//
// Chat
//

const useStylesAddBetabot = () => {
	const [{ width, border, padding, margin }] = useStyles()
	return {
		skipButton: [
			border.color.light.grey,
			border.scale(2),
			border.radius.small,
			margin.top.scale(15),
			padding.left.small,
			padding.right.medium,
			padding.top.small,
			padding.bottom.small,
			width(120),
		],
		addButton: [
			border.color.light.blue,
			border.scale(2),
			border.radius.small,
			margin.top.scale(15),
			padding.left.small,
			padding.right.medium,
			padding.top.small,
			padding.bottom.small,
			width(120),
		],
	}
}

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

export const ChatHeader: React.FC<any> = ({ convPk, stickyDate, showStickyDate }) => {
	const { navigate, goBack } = useNavigation()
	const conv = useConversation(convPk)
	const contact = useContact(conv?.contactPublicKey || null)

	const [
		{ row, padding, column, margin, text, flex, opacity, color, border, background },
	] = useStyles()

	const [layoutHeader, onLayoutHeader] = useLayout() // to position date under blur

	const persistOpts = usePersistentOptions()
	const isBetabot =
		persistOpts && conv?.contactPublicKey?.toString() === persistOpts?.betabot?.convPk?.toString()

	if (!conv || !contact) {
		goBack()
		console.warn('OneToOne: no conv', conv, contact)
		return <CenteredActivityIndicator />
	}
	const title = conv.fake ? `FAKE - ${contact.displayName}` : contact?.displayName || ''
	return (
		<View style={{ position: 'absolute', top: 0, left: 0, right: 0 }} onLayout={onLayoutHeader}>
			<BlurView
				blurType='light'
				blurAmount={30}
				style={{ position: 'absolute', bottom: 0, top: 0, left: 0, right: 0 }}
			/>
			<View
				style={[
					flex.align.center,
					flex.direction.row,
					padding.right.medium,
					padding.left.tiny,
					margin.top.scale(50),
					padding.bottom.scale(20),
				]}
			>
				<TouchableOpacity
					style={[flex.tiny, flex.justify.center, flex.align.center]}
					onPress={goBack}
				>
					<Icon name='arrow-back-outline' width={25} height={25} fill={color.black} />
				</TouchableOpacity>
				<View style={[flex.large, column.justify, row.item.justify, margin.top.small]}>
					<View style={[flex.direction.row, flex.justify.center, flex.align.center]}>
						<Text
							numberOfLines={1}
							style={[text.align.center, text.bold.medium, text.size.scale(20)]}
						>
							{title}
						</Text>
						{/* {state === 'error' && (
							<Icon name='close-outline' width={14} height={14} fill={color.red} />
						)} */}
						{/* {state === 'done' ? (
							<View
								style={[
									width(14),
									height(14),
									border.radius.scale(7),
									margin.left.large,
									{
										backgroundColor: main?.debugGroup?.peerIds?.length ? color.green : color.red,
									},
								]}
							/>
						) : (
							<ActivityIndicator size='small' style={[margin.left.large]} />
						)} */}
					</View>
					{/* {lastDate && (
						<Text numberOfLines={1} style={[text.size.small, text.color.grey, text.align.center]}>
							Last seen <FromNow date={lastDate} />
						</Text>
					)} */}
				</View>
				<View style={[flex.tiny, row.fill, { alignItems: 'center' }]}>
					<TouchableOpacity
						activeOpacity={contact ? 0.2 : 0.5}
						style={[flex.tiny, row.item.justify, !contact ? opacity(0.5) : null]}
						onPress={() => navigate.chat.oneToOneSettings({ convId: convPk })}
					>
						{!isBetabot ? (
							<ProceduralCircleAvatar size={45} diffSize={9} seed={conv.contactPublicKey} />
						) : (
							<View
								style={[
									border.radius.scale(25),
									border.shadow.medium,
									background.white,
									margin.right.small,
									{
										justifyContent: 'center',
										alignItems: 'center',
										display: 'flex',
										width: 40,
										height: 40,
										alignSelf: 'center',
									},
								]}
							>
								<Logo width={25} height={25} style={{ right: -1, top: -1 }} />
							</View>
						)}
					</TouchableOpacity>
				</View>
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
						<ProceduralCircleAvatar
							seed={publicKey || '42'}
							size={40}
							style={[margin.bottom.small]}
						/>
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
										playSound('contactRequestAccepted')
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

export const AddBetabotBox = () => {
	const [
		{ row, text, margin, color, padding, background, border, opacity },
		{ scaleHeight },
	] = useStyles()
	const _styles = useStylesAddBetabot()
	const { setPersistentOption, persistentOptions } = useMsgrContext()

	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<View
					style={[
						{
							justifyContent: 'center',
							alignItems: 'center',
						},
						padding.medium,
					]}
				>
					<View
						style={[
							{
								width: 80 * scaleHeight,
								height: 80 * scaleHeight,
								backgroundColor: 'white',
								justifyContent: 'center',
								alignItems: 'center',
								position: 'relative',
								top: 10,
								zIndex: 1,
								shadowOpacity: 0.1,
								shadowRadius: 5,
								shadowOffset: { width: 0, height: 3 },
							},
							background.white,
							border.radius.scale(60),
						]}
					>
						<Avatar width={80 * scaleHeight} height={80 * scaleHeight} />
					</View>
					<View
						style={[
							background.white,
							padding.horizontal.medium,
							padding.bottom.medium,
							border.radius.large,
							border.shadow.huge,
							{ width: '100%' },
						]}
					>
						<View style={[padding.top.scale(35)]}>
							<Icon
								name='info-outline'
								fill={color.blue}
								width={60 * scaleHeight}
								height={60 * scaleHeight}
								style={[row.item.justify, padding.top.large]}
							/>
							<TextNative
								style={[
									text.align.center,
									padding.top.small,
									text.size.large,
									text.bold.medium,
									text.color.black,
									{ fontFamily: 'Open Sans' },
								]}
							>
								{t('chat.one-to-one.betabot-box.title')}
							</TextNative>
							<Text style={[text.align.center, padding.top.scale(20), padding.horizontal.medium]}>
								<TextNative
									style={[
										text.bold.small,
										text.size.medium,
										text.color.black,
										{ fontFamily: 'Open Sans' },
									]}
								>
									{t('chat.one-to-one.betabot-box.desc')}
								</TextNative>
							</Text>
						</View>
						<View style={[row.center, padding.top.medium]}>
							<TouchableOpacity
								style={[row.fill, margin.bottom.medium, opacity(0.5), _styles.skipButton]}
							>
								<Icon
									name='close'
									width={30}
									height={30}
									fill={color.grey}
									style={row.item.justify}
								/>
								<TextNative
									style={[
										text.color.grey,
										padding.left.small,
										row.item.justify,
										text.size.scale(16),
										text.bold.medium,
										{ fontFamily: 'Open Sans' },
									]}
								>
									{t('chat.one-to-one.betabot-box.skip-button')}
								</TextNative>
							</TouchableOpacity>
							<TouchableOpacity
								style={[row.fill, margin.bottom.medium, background.light.blue, _styles.addButton]}
								onPress={async () => {
									await setPersistentOption({
										type: PersistentOptionsKeys.BetaBot,
										payload: {
											added: true,
											convPk: persistentOptions.betabot.convPk,
										},
									})
								}}
							>
								<Icon
									name='checkmark-outline'
									width={30}
									height={30}
									fill={color.blue}
									style={row.item.justify}
								/>
								<TextNative
									style={[
										text.color.blue,
										padding.left.small,
										row.item.justify,
										text.size.scale(16),
										text.bold.medium,
									]}
								>
									{t('chat.one-to-one.betabot-box.add-button')}
								</TextNative>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			)}
		</Translation>
	)
}

const InfosChat: React.FC<api.berty.messenger.v1.IConversation & any> = ({
	createdDate: createdDateStr,
	publicKey,
	isBetabot,
	isBetabotAdded,
}) => {
	const [{ flex, text, padding, margin }] = useStyles()
	const { dateMessage } = useStylesOneToOne()
	const createdDate = pbDateToNum(createdDateStr) || Date.now()
	const ctx = useMsgrContext()
	const contact =
		Object.values(ctx.contacts).find((c: any) => c.conversationPublicKey === publicKey) || null

	const isAccepted = contact.state === messengerpb.Contact.State.Accepted
	const isIncoming = contact.state === messengerpb.Contact.State.IncomingRequest
	const textColor = '#4E58BF'

	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<View style={[padding.medium, flex.align.center]}>
					<ChatDate date={createdDate} />
					{!isIncoming ? (
						<>
							{isBetabot && !isBetabotAdded ? (
								<AddBetabotBox />
							) : (
								<MessageSystemWrapper styleContainer={[margin.bottom.small, margin.top.large]}>
									<Text style={[text.align.center, { color: textColor }]}>
										{isAccepted
											? t('chat.one-to-one.infos-chat.connection-confirmed')
											: t('chat.one-to-one.infos-chat.request-sent')}
									</Text>
								</MessageSystemWrapper>
							)}
						</>
					) : (
						<MessageSystemWrapper>
							<ContactRequestBox contact={contact} isAccepted={isAccepted} />
						</MessageSystemWrapper>
					)}
					{!isAccepted && contact.state !== messengerpb.Contact.State.Undefined && (
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
			msg.type === messengerpb.AppMessage.Type.TypeUserMessage ||
			msg.type === messengerpb.AppMessage.Type.TypeGroupInvitation ||
			msg.type === messengerpb.AppMessage.Type.TypeMonitorMetadata,
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

	const persistOpts = usePersistentOptions()
	const isBetabot =
		persistOpts && conv?.contactPublicKey?.toString() === persistOpts?.betabot?.convPk?.toString()
	const isBetabotAdded = persistOpts.betabot.added

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
		return isBetabot && !isBetabotAdded ? null : (
			<Message
				id={item?.cid || `${index}`}
				convKind={messengerpb.Conversation.Type.ContactType}
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
			ListFooterComponent={
				<InfosChat {...conv} isBetabot={isBetabot} isBetabotAdded={isBetabotAdded} />
			}
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

const NT = messengerpb.StreamEvent.Notified.Type

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

	const ctx: any = useMsgrContext()
	const conv = ctx.conversations[params?.convId]
	const contact: any =
		Object.values(ctx.contacts).find((c: any) => c.conversationPublicKey === conv?.publicKey) ||
		null
	const isIncoming = contact?.state === messengerpb.Contact.State.IncomingRequest
	const persistOpts = usePersistentOptions()
	const isBetabot =
		persistOpts && conv?.contactPublicKey?.toString() === persistOpts?.betabot?.convPk?.toString()
	const isBetabotAdded = persistOpts && persistOpts?.betabot?.added
	const isFooterDisable = isIncoming || (isBetabot && !isBetabotAdded)
	const placeholder = isFooterDisable
		? isBetabot
			? t('chat.one-to-one.betabot-input-placeholder')
			: t('chat.one-to-one.incoming-input-placeholder')
		: t('chat.one-to-one.input-placeholder')

	const [stickyDate, setStickyDate] = useState(conv?.lastUpdate || null)
	const [showStickyDate, setShowStickyDate] = useState(false)

	return (
		<View style={[StyleSheet.absoluteFill, background.white, { flex: 1 }]}>
			<SwipeNavRecognizer
				onSwipeLeft={() =>
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
					behavior='padding'
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
					/>
					<ChatHeader convPk={params?.convId || ''} {...{ stickyDate, showStickyDate }} />
				</KeyboardAvoidingView>
			</SwipeNavRecognizer>
		</View>
	)
}
