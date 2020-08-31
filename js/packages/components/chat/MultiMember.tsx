import React, { useState } from 'react'
import {
	TouchableOpacity,
	View,
	KeyboardAvoidingView,
	FlatList,
	StatusBar,
	ActivityIndicator,
	Text as TextNative,
	ScrollView,
} from 'react-native'
import BlurView from '../shared-components/BlurView'
import { Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { ChatFooter, ChatDate } from './shared-components/Chat'
import { ConversationProceduralAvatar } from '../shared-components/ProceduralCircleAvatar'
import { Message } from './shared-components/Message'
import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import {
	useConversation,
	useConvInteractions,
	useMsgrContext,
	useConvMembers,
} from '@berty-tech/store/hooks'
import { messenger as messengerpb } from '@berty-tech/api/index.js'

//import { useReadEffect } from '../hooks'
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
					<ConversationProceduralAvatar conversationId={id} size={50} diffSize={9} />
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

const MemberItem: React.FC<{ publicKey: any }> = ({ publicKey }) => {
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
}

const InfosMultiMember: React.FC<{ publicKey: string; createdAt: number }> = ({
	publicKey,
	createdAt,
}) => {
	const [{ margin, text }] = useStyles()
	const members = useConvMembers(publicKey)
	return (
		<View>
			<ChatDate date={createdAt} />
			<View style={[margin.top.medium]}>
				<Text style={[text.align.center, text.color.black, text.bold.medium]}>
					Test created the group
				</Text>
			</View>
			<MemberList members={Object.keys(members)} />
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

const MessageList: React.FC<{ id: string }> = ({ id }) => {
	const [{ overflow, row, flex, margin }, { scaleHeight }] = useStyles()
	const conversation = useConversation(id)
	const ctx = useMsgrContext()
	const members = ctx.members[id] || {}
	const interactions = Object.values(useConvInteractions(id))
		.filter((msg) => msg.type === messengerpb.AppMessage.Type.TypeUserMessage)
		.sort(
			(a, b) =>
				(a.payload.sentDate ? parseInt(a.payload.sentDate, 10) : Date.now()) -
				(b.payload.sentDate ? parseInt(b.payload.sentDate, 10) : Date.now()),
		)
	console.log('will render', interactions.length, 'interactions')
	if (!conversation) {
		return <CenteredActivityIndicator />
	}
	const getPreviousMessageId = (item = '', messageList: string[] = []): string => {
		const messagePosition: number = !item ? -1 : messageList.indexOf(item)
		return messagePosition < 1 ? '' : messageList[messagePosition - 1]
	}
	return (
		<FlatList
			keyboardDismissMode='on-drag'
			style={[
				overflow,
				row.item.fill,
				flex.tiny,
				margin.bottom.medium,
				{ marginTop: 140 * scaleHeight },
			]}
			data={interactions.reverse()}
			inverted
			ListFooterComponent={<InfosMultiMember {...conversation} />}
			keyExtractor={(item) => item.cid}
			renderItem={({ item }) => (
				<Message
					id={item.cid}
					convKind={messengerpb.Conversation.Type.MultiMemberType}
					convPK={conversation.publicKey}
					members={members}
					previousMessageId={getPreviousMessageId(item, conversation.messages)}
				/>
			)}
		/>
	)
}

export const MultiMember: React.FC<ScreenProps.Chat.Group> = ({ route: { params } }) => {
	const [inputIsFocused, setInputFocus] = useState(true)
	const [{ background, flex }] = useStyles()
	//useReadEffect(params.convId, 1000)
	return (
		<View style={[flex.tiny, background.white]}>
			<KeyboardAvoidingView style={[flex.tiny]} behavior='padding'>
				<StatusBar backgroundColor='#00BCD4' barStyle='dark-content' />
				<MessageList id={params.convId} />
				<ChatFooter convPk={params.convId} isFocused={inputIsFocused} setFocus={setInputFocus} />
				<HeaderMultiMember id={params.convId} />
			</KeyboardAvoidingView>
		</View>
	)
}
