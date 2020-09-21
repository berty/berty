import React, { useState, useRef } from 'react'
import {
	TouchableOpacity,
	View,
	StyleSheet,
	FlatList,
	ActivityIndicator,
	KeyboardAvoidingView,
} from 'react-native'
import { Text, Icon } from 'react-native-ui-kitten'

import { useStyles } from '@berty-tech/styles'
import { useNavigation, ScreenProps } from '@berty-tech/navigation'
import * as api from '@berty-tech/api/index.pb'
import { messenger as messengerpb } from '@berty-tech/api/index.js'
import {
	useMsgrContext,
	useConversation,
	useContact,
	useReadEffect,
	useSortedConvInteractions,
} from '@berty-tech/store/hooks'

import { ProceduralCircleAvatar } from '../shared-components/ProceduralCircleAvatar'
import { Message } from './shared-components/Message'
import BlurView from '../shared-components/BlurView'

// import { useReadEffect } from '../hooks'
import { ChatFooter, ChatDate } from './shared-components/Chat'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'
import Logo from '../main/1_berty_picto.svg'

//
// Chat
//

// Styles
const useStylesChat = () => {
	const [{ flex, text }] = useStyles()
	return {
		headerName: flex.large,
		headerNameText: text.size.scale(20),
	}
}

const CenteredActivityIndicator: React.FC = (props: ActivityIndicator['props']) => {
	const { children, ...propsToPass } = props
	return (
		<View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
			<ActivityIndicator {...propsToPass} />
		</View>
	)
}

export const ChatHeader: React.FC<{ convPk: any }> = ({ convPk }) => {
	const { navigate, goBack } = useNavigation()
	const conv = useConversation(convPk)
	const contact = useContact(conv.contactPublicKey)

	const _styles = useStylesChat()
	const [
		{ absolute, row, padding, column, margin, text, flex, opacity, color, border, width, height },
		{ scaleHeight },
	] = useStyles()

	// const lastDate = Messenger.useGetDateLastContactMessage(convPk)
	// const lastDate = new Date()
	// const debugGroup = Settings.useDebugGroup({ pk: conv?.pk || '' })
	// const main = Settings?.useSettings()
	// const state = main?.debugGroup?.state

	// useEffect(() => {
	// 	if (!state) {
	// 		debugGroup()
	// 	}
	// })

	// useEffect(() => {
	// 	const interval = setInterval(() => {
	// 		debugGroup()
	// 	}, 10000)
	// 	return () => clearInterval(interval)
	// }, [debugGroup])

	if (!conv) {
		goBack()
		return <CenteredActivityIndicator />
	}
	const title = conv.fake ? `FAKE - ${contact.displayName}` : contact?.displayName || ''
	return (
		<View style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
			<BlurView
				blurType='light'
				blurAmount={30}
				style={{ position: 'absolute', bottom: 0, top: 0, left: 0, right: 0 }}
			/>
			<View
				style={[
					padding.horizontal.medium,
					{
						alignItems: 'center',
						flexDirection: 'row',
						marginTop: 50 * scaleHeight,
						paddingBottom: 20 * scaleHeight,
					},
				]}
			>
				<TouchableOpacity style={[flex.tiny, row.item.justify]} onPress={goBack}>
					<Icon name='arrow-back-outline' width={25} height={25} fill={color.black} />
				</TouchableOpacity>
				<View
					style={[
						flex.huge,
						column.justify,
						row.item.justify,
						margin.top.small,
						_styles.headerName,
					]}
				>
					<View style={[{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}>
						<TouchableOpacity
						// onPress={() => debugGroup()}
						>
							<Text
								numberOfLines={1}
								style={[text.align.center, text.bold.medium, _styles.headerNameText]}
							>
								{title}
							</Text>
						</TouchableOpacity>
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
						<ProceduralCircleAvatar size={45} diffSize={9} seed={conv.contactPublicKey} />
					</TouchableOpacity>
				</View>
			</View>
		</View>
	)
}

const ContactInitiatedWrapper: React.FC<{ children: any }> = ({ children }) => {
	const [
		{ padding, border, flex, margin, width, background, height, minWidth },
		{ scaleSize },
	] = useStyles()
	const logoDiameter = 28
	const diffSize = 6
	return (
		<View
			style={[
				{ backgroundColor: '#EDEEF8' },
				padding.tiny,
				margin.top.scale(logoDiameter + 10), // make room for logo and date
				border.radius.scale(10),
				flex.justify.center,
				minWidth(0),
				{ shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2.5 } },
			]}
		>
			<View
				style={{
					transform: [{ translateY: -logoDiameter * 1.15 * scaleSize }],
					alignSelf: 'center',
					marginBottom: -logoDiameter * scaleSize, // compensate for transformed logo
				}}
			>
				<View
					style={[
						flex.align.center,
						flex.justify.center,
						width(logoDiameter + diffSize * scaleSize),
						height(logoDiameter + diffSize * scaleSize),
						background.white,
						border.radius.scale((logoDiameter + diffSize) / 2),
						{
							borderWidth: 2,
							borderColor: 'rgba(215, 217, 239, 1)',
						},
					]}
				>
					<Logo
						width={scaleSize * logoDiameter - diffSize}
						height={scaleSize * logoDiameter - diffSize}
						style={[margin.left.tiny]} // nudge logo to appear centered
					/>
				</View>
			</View>
			{children}
		</View>
	)
}

const InfosChat: React.FC<api.berty.messenger.v1.IConversation> = ({
	createdDate: createdDateStr,
}) => {
	const [{ flex, text, padding }] = useStyles()
	const createdDate =
		(createdDateStr && parseInt((createdDateStr as unknown) as string, 10)) || Date.now()
	return (
		<View style={[padding.medium, flex.align.center]}>
			<ChatDate date={createdDate} />
			<ContactInitiatedWrapper>
				<Text style={[text.color.blue, text.align.center, text.italic]}>
					👋 Berty Connection: confirmed 🎉
				</Text>
			</ContactInitiatedWrapper>
		</View>
	)
}

const MessageList: React.FC<{ convPk: string; scrollToMessage?: string }> = ({
	convPk,
	scrollToMessage,
}) => {
	const ctx: any = useMsgrContext()
	const conv = ctx.conversations[convPk]
	const messages = useSortedConvInteractions(convPk).filter(
		(msg) =>
			msg.type === messengerpb.AppMessage.Type.TypeUserMessage ||
			msg.type === messengerpb.AppMessage.Type.TypeGroupInvitation,
	)

	const flatListRef: any = useRef(null)

	const onScrollToIndexFailed = () => {
		// Not sure why this happens (something to do with item/screen dimensions I think)
		flatListRef.current?.scrollToIndex({ index: 0 })
	}

	const initialScrollIndex = React.useMemo(() => {
		if (scrollToMessage) {
			for (let i = 0; i < messages.length; i++) {
				if (messages[i].cid === scrollToMessage) {
					return i
				}
			}
		}
	}, [messages, scrollToMessage])

	const items: any = React.useMemo(() => {
		return messages?.reverse() || []
	}, [messages])

	return (
		<FlatList
			initialScrollIndex={initialScrollIndex}
			onScrollToIndexFailed={onScrollToIndexFailed}
			ref={flatListRef}
			keyboardDismissMode='on-drag'
			data={items}
			inverted
			keyExtractor={(item: any) => item.cid}
			ListFooterComponent={<InfosChat {...conv} />}
			renderItem={({ item, index }: { item: any; index: number }) => (
				<Message
					id={item.cid}
					convKind={messengerpb.Conversation.Type.ContactType}
					convPK={conv.publicKey}
					previousMessageId={index > 0 ? items[index + 1]?.cid : ''}
					nextMessageId={items[index - 1]?.cid || ''}
				/>
			)}
		/>
	)
}

export const OneToOne: React.FC<ScreenProps.Chat.OneToOne> = ({ route }) => {
	const [inputIsFocused, setInputFocus] = useState(false)
	const [{ flex, background }] = useStyles()
	useReadEffect(route.params.convId, 1000)

	return (
		<View style={[StyleSheet.absoluteFill, background.white, { flex: 1 }]}>
			{/* <SwipeNavRecognizer> */}
			<KeyboardAvoidingView style={[flex.tiny]} behavior='padding'>
				<MessageList convPk={route.params.convId} scrollToMessage={route.params.scrollToMessage} />
				<ChatFooter
					convPk={route.params.convId}
					isFocused={inputIsFocused}
					setFocus={setInputFocus}
				/>
				<ChatHeader convPk={route.params.convId} />
			</KeyboardAvoidingView>
			{/* </SwipeNavRecognizer> */}
		</View>
	)
}
