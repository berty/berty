import React, { useState } from 'react'
import {
	TouchableOpacity,
	View,
	KeyboardAvoidingView,
	FlatList,
	StatusBar,
	Image,
	ActivityIndicator,
	Text as TextNative,
} from 'react-native'
import { Text, Icon } from 'react-native-ui-kitten'
import { CommonActions } from '@react-navigation/native'

import { useStyles } from '@berty-tech/styles'
import { Routes, ScreenProps, useNavigation } from '@berty-tech/navigation'
import {
	useConversation,
	useMsgrContext,
	useReadEffect,
	useSortedConvInteractions,
} from '@berty-tech/store/hooks'
import { messenger as messengerpb } from '@berty-tech/api/index.js'
import * as api from '@berty-tech/api/index.pb'

import { ChatFooter, ChatDate } from './shared-components/Chat'
import { ConversationProceduralAvatar } from '../shared-components/ProceduralCircleAvatar'
import { Message } from './shared-components/Message'
import BlurView from '../shared-components/BlurView'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'
import AvatarGroup19 from '../main/Avatar_Group_Copy_19.png'

//
// MultiMember
//

// Styles

const HeaderMultiMember: React.FC<{ id: string }> = ({ id }) => {
	const { navigate, goBack } = useNavigation()
	const [{ row, padding, flex, text, column, absolute }, { scaleHeight }] = useStyles()
	const conversation = useConversation(id)
	return (
		<BlurView
			style={[
				padding.horizontal.medium,
				absolute.top,
				absolute.right,
				absolute.left,
				{ alignItems: 'center' },
			]}
			blurType='light'
			blurAmount={30}
		>
			<View
				style={[
					{
						alignItems: 'center',
						flexDirection: 'row',
						marginTop: 50 * scaleHeight,
						paddingBottom: 15 * scaleHeight,
					},
				]}
			>
				<TouchableOpacity style={[flex.small, row.left]} onPress={goBack}>
					<Icon style={[column.item.center]} name='arrow-back-outline' width={30} height={30} />
				</TouchableOpacity>
				<View style={[flex.small, row.item.justify]}>
					<TextNative
						numberOfLines={1}
						style={[text.align.center, text.bold.medium, text.size.scale(20), text.color.black]}
					>
						{conversation?.displayName || ''}
					</TextNative>
				</View>
				<TouchableOpacity
					style={[flex.small, row.right]}
					onPress={() => navigate.chat.groupSettings({ convId: id })}
				>
					<Image source={AvatarGroup19} style={{ width: 40, height: 40 }} />
				</TouchableOpacity>
			</View>
		</BlurView>
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
	const [{ margin, text }] = useStyles()
	// const members = useConvMembers(publicKey)
	const createdDate = parseInt((createdDateStr as unknown) as string, 10)
	return (
		<View>
			<ChatDate date={createdDate} />
			<View style={[margin.top.medium]}>
				<Text style={[text.align.center, text.color.black, text.bold.medium]}>Group joined</Text>
			</View>
			{/*<MemberList members={Object.keys(members)} />*/}
		</View>
	)
}

const CenteredActivityIndicator: React.FC = (props: ActivityIndicator['props']) => {
	const { children, ...propsToPass } = props
	return (
		<View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
			<ActivityIndicator {...propsToPass} />
		</View>
	)
}

const MessageList: React.FC<{ id: string; scrollToMessage?: string }> = ({
	id,
	scrollToMessage,
}) => {
	const [{ overflow, row, flex, margin }, { scaleHeight }] = useStyles()
	const conversation = useConversation(id)
	const ctx = useMsgrContext()
	const members = (ctx as any).members[id] || {}
	const interactions = useSortedConvInteractions(id).filter(
		(msg) => msg.type === messengerpb.AppMessage.Type.TypeUserMessage,
	)
	const initialScrollIndex = React.useMemo(() => {
		if (scrollToMessage) {
			for (let i = 0; i < interactions.length; i++) {
				if (interactions[i].cid === scrollToMessage) {
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

	if (!conversation) {
		return <CenteredActivityIndicator />
	}

	return (
		<FlatList
			initialScrollIndex={initialScrollIndex}
			onScrollToIndexFailed={onScrollToIndexFailed}
			ref={flatListRef}
			keyboardDismissMode='on-drag'
			style={[
				overflow,
				row.item.fill,
				flex.tiny,
				margin.bottom.medium,
				{ marginTop: 140 * scaleHeight },
			]}
			data={items}
			inverted
			ListFooterComponent={<InfosMultiMember {...conversation} />}
			keyExtractor={(item) => item.cid}
			renderItem={({ item, index }: { item: any; index: number }) => (
				<Message
					id={item.cid}
					convKind={messengerpb.Conversation.Type.MultiMemberType}
					convPK={conversation.publicKey}
					members={members}
					previousMessageId={items[index + 1]?.cid || ''}
					nextMessageId={items[index - 1]?.cid || ''}
				/>
			)}
		/>
	)
}

export const MultiMember: React.FC<ScreenProps.Chat.Group> = ({ route: { params } }) => {
	const [inputIsFocused, setInputFocus] = useState(false)
	const [{ background, flex }] = useStyles()
	const { dispatch } = useNavigation()
	// useReadEffect(params.convId, 1000)

	return (
		<View style={[flex.tiny, background.white]}>
			<SwipeNavRecognizer
				onSwipeLeft={() =>
					dispatch(
						CommonActions.navigate({
							name: Routes.Chat.MultiMemberSettings,
							params: { convId: params.convId },
						}),
					)
				}
			>
				<KeyboardAvoidingView style={[flex.tiny]} behavior='padding'>
					<StatusBar backgroundColor='#00BCD4' barStyle='dark-content' />
					<MessageList id={params.convId} />
					<ChatFooter convPk={params.convId} isFocused={inputIsFocused} setFocus={setInputFocus} />
					<HeaderMultiMember id={params.convId} />
				</KeyboardAvoidingView>
			</SwipeNavRecognizer>
		</View>
	)
}
