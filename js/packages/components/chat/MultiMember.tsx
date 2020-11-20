import React, { useState } from 'react'
import {
	TouchableOpacity,
	View,
	KeyboardAvoidingView,
	StatusBar,
	Image,
	ActivityIndicator,
	SectionListRenderItem,
	SectionListData,
	SectionList,
	ViewToken,
} from 'react-native'
import { Text, Icon } from '@ui-kitten/components'
import { CommonActions } from '@react-navigation/native'
import { groupBy } from 'lodash'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

import { useStyles } from '@berty-tech/styles'
import { Routes, ScreenProps, useNavigation } from '@berty-tech/navigation'
import {
	useConversation,
	useLastConvInteraction,
	useMsgrContext,
	useReadEffect,
	useSortedConvInteractions,
	useNotificationsInhibitor,
} from '@berty-tech/store/hooks'
import { messenger as messengerpb } from '@berty-tech/api/index.js'
import * as api from '@berty-tech/api/index.pb'

import { ChatFooter, ChatDate } from './shared-components/Chat'
import { Message } from './message'
import { MessageSystemWrapper } from './message/MessageSystemWrapper'
import BlurView from '../shared-components/BlurView'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'
import AvatarGroup19 from '../main/Avatar_Group_Copy_19.png'
import { useLayout } from '../hooks'
import { pbDateToNum } from '../helpers'

//
// MultiMember
//

// Styles

const HeaderMultiMember: React.FC<{
	id: string
	stickyDate?: number
	showStickyDate?: boolean
}> = ({ id, stickyDate, showStickyDate }) => {
	const { navigate, goBack } = useNavigation()
	const [{ row, padding, flex, text, column, margin, color }] = useStyles()
	const conversation = useConversation(id)
	const [layoutHeader, onLayoutHeader] = useLayout() // to position date under blur

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
							{conversation?.displayName || ''}
						</Text>
					</View>
				</View>
				<View style={[flex.tiny, row.fill, { alignItems: 'center' }]}>
					<TouchableOpacity
						style={[flex.small, row.right]}
						onPress={() => navigate.chat.groupSettings({ convId: id })}
					>
						<Image source={AvatarGroup19} style={{ width: 40, height: 40 }} />
					</TouchableOpacity>
				</View>
			</View>
			{!!stickyDate && !!showStickyDate && layoutHeader?.height ? (
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
			) : null}
		</View>
	)
}

// const MultiMemberMemberItem: React.FC<berty.chatmodel.IMember> = ({
// 	avatarUri,
// 	name,
// 	contactId,
// 	role,
// }) => {
// 	const [layout, setLayout] = useState()
// 	const [contactGetReply] = Store.useContactGet({ id: contactId })
// 	const [state, icon, itemColor, bgColor, lightBgColor] = {
// 		[berty.chatmodel.Member.Role.Owner]: ['Owner', 'checkmark-circle-2', 'white', 'blue', false],
// 		[berty.chatmodel.Member.Role.Admin]: ['Admin', 'checkmark-circle-2', 'red', 'red', true],
// 		[berty.chatmodel.Member.Role.Regular]: [
// 			'Regular',
// 			'checkmark-circle-2',
// 			'green',
// 			'green',
// 			true,
// 		],
// 		[berty.chatmodel.Member.Role.Invited]: ['Invited', 'clock', 'yellow', 'yellow', true],
// 		[berty.chatmodel.Member.Role.Unknown]: [
// 			'Unknown',
// 			'question-mark-circle',
// 			'grey',
// 			'grey',
// 			true,
// 		],
// 	}[role ?? berty.chatmodel.Member.Role.Unknown]
// 	const [{ color, background, border, margin, padding, width, row, text }] = useStyles()

// 	return (
// 		<View
// 			onLayout={(e) => !layout && setLayout(e.nativeEvent.layout.height)}
// 			style={[
// 				border.radius.medium,
// 				border.shadow.small,
// 				background.white,
// 				padding.vertical.medium,
// 				margin.right.medium,
// 				width(90),
// 			]}
// 		>
// 			<View style={[{ alignItems: 'center' }]}>
// 				<View style={[padding.horizontal.small]}>
// 					<CircleAvatar
// 						avatarUri={avatarUri || contactGetReply?.contact?.avatarUri}
// 						diffSize={5}
// 						size={60}
// 						color={!lightBgColor ? color[bgColor] : color.light[bgColor]}
// 						state={{ icon, iconColor: color[bgColor] }}
// 					/>
// 					<Text numberOfLines={1} style={[text.align.center, text.size.small, margin.top.small]}>
// 						{name || contactGetReply?.contact?.name}
// 					</Text>
// 				</View>
// 				<View
// 					style={[
// 						margin.top.small,
// 						row.center,
// 						border.radius.medium,
// 						{ backgroundColor: !lightBgColor ? color[bgColor] : color.light[bgColor] },
// 					]}
// 				>
// 					<Text
// 						numberOfLines={1}
// 						style={[
// 							text.bold.medium,
// 							text.size.tiny,
// 							padding.horizontal.small,
// 							{ color: color[itemColor] },
// 						]}
// 					>
// 						{state}
// 					</Text>
// 				</View>
// 			</View>
// 		</View>
// 	)
// }

/*const MemberItem: React.FC<{ publicKey: any }> = ({ publicKey }) => {
	const [, { scaleHeight }] = useStyles()
	return (
		<View>
			<TextNative style={{ paddingLeft: 10 * scaleHeight }}>{publicKey}</TextNative>
		</View>
	)
}

const MemberList: React.FC<{ members: any }> = ({ members }) => {
	const [{ padding, margin }] = useStyles()
	return (
		<ScrollView
			style={[margin.top.big, padding.medium]}
			horizontal
			showsHorizontalScrollIndicator={false}
		>
			{members &&
				members?.map((member: any) =>
					member ? <MemberItem publicKey={member.publicKey} /> : null,
				)}
		</ScrollView>
	)
}*/

const InfosMultiMember: React.FC<api.berty.messenger.v1.IConversation> = ({
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

const CenteredActivityIndicator: React.FC = (props: ActivityIndicator['props']) => {
	const { ...propsToPass } = props
	return (
		<View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
			<ActivityIndicator {...propsToPass} />
		</View>
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
	id: string
	scrollToMessage?: string
	setStickyDate: any
	setShowStickyDate: any
}> = ({ id, scrollToMessage, setStickyDate, setShowStickyDate }) => {
	const [{ overflow, margin, row, flex }, { scaleHeight }] = useStyles()
	const conversation = useConversation(id)
	const ctx = useMsgrContext()
	const members = (ctx as any).members[id] || {}
	const interactions = useSortedConvInteractions(id).filter(
		(msg) =>
			msg.type === messengerpb.AppMessage.Type.TypeUserMessage ||
			msg.type === messengerpb.AppMessage.Type.TypeMonitorMetadata,
	)

	if (conversation.replyOptions !== null && conversation.replyOptions !== undefined) {
		interactions.push(conversation.replyOptions)
	}
	const initialScrollIndex = React.useMemo(() => {
		if (scrollToMessage) {
			for (let i = 0; i < interactions.length; i++) {
				if (interactions[i] && interactions[i].cid === scrollToMessage) {
					return i
				}
			}
		}
	}, [interactions, scrollToMessage])
	const flatListRef: any = React.useRef(null)

	const onScrollToIndexFailed = () => {
		// Not sure why this happens (something to do with item/screen dimensions I think)
		flatListRef?.current?.scrollToIndex({ index: 0 })
	}

	const items: any = React.useMemo(() => {
		return interactions?.reverse() || []
	}, [interactions])

	const sections = React.useMemo(() => _createSections(items), [items])

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
				convKind={messengerpb.Conversation.Type.MultiMemberType}
				convPK={conversation.publicKey}
				members={members}
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

	if (!conversation) {
		return <CenteredActivityIndicator />
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
			ListFooterComponent={<InfosMultiMember {...conversation} />}
			renderSectionFooter={renderDateFooter}
			renderItem={renderItem}
			onViewableItemsChanged={updateStickyDate}
			initialNumToRender={20}
			onScrollBeginDrag={() => {
				setShowStickyDate(false) // TODO: tmp until hide if start of conversation is visible
			}}
			onScrollEndDrag={() => {
				setTimeout(() => setShowStickyDate(false), 2000)
			}}
		/>
	)
}

const NT = messengerpb.StreamEvent.Notified.Type

export const MultiMember: React.FC<ScreenProps.Chat.Group> = ({ route: { params } }) => {
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
	const [{ background, flex }] = useStyles()
	const { dispatch } = useNavigation()
	useReadEffect(params.convId, 1000)
	const conv = useConversation(params?.convId)
	const { t } = useTranslation()

	const lastInte = useLastConvInteraction(params?.convId || '')
	const lastUpdate = conv?.lastUpdate || lastInte?.sentDate || conv?.createdDate || null
	const [stickyDate, setStickyDate] = useState(lastUpdate || null)
	const [showStickyDate, setShowStickyDate] = useState(false)

	return (
		<View style={[flex.tiny, background.white]}>
			<SwipeNavRecognizer
				onSwipeLeft={() =>
					dispatch(
						CommonActions.navigate({
							name: Routes.Chat.MultiMemberSettings,
							params: { convId: params?.convId },
						}),
					)
				}
			>
				<KeyboardAvoidingView style={[flex.tiny]} behavior='padding'>
					<StatusBar backgroundColor='#00BCD4' barStyle='dark-content' />
					<MessageList id={params?.convId} {...{ setStickyDate, setShowStickyDate }} />
					<ChatFooter
						convPk={params?.convId}
						isFocused={inputIsFocused}
						setFocus={setInputFocus}
						placeholder={t('chat.multi-member.input-placeholder')}
					/>
					<HeaderMultiMember id={params?.convId} {...{ stickyDate, showStickyDate }} />
				</KeyboardAvoidingView>
			</SwipeNavRecognizer>
		</View>
	)
}
