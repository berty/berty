import React, { useState } from 'react'
import {
	TouchableOpacity,
	View,
	SafeAreaView,
	KeyboardAvoidingView,
	ScrollView,
	FlatList,
	StatusBar,
	ActivityIndicator,
} from 'react-native'
import { Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { ChatFooter, ChatDate } from './shared-components/Chat'
import { GroupCircleAvatar, CircleAvatar } from '../shared-components/CircleAvatar'
import { Message } from './shared-components/Message'
import { ScreenProps, useNavigation } from '@berty-tech/berty-navigation'
import { BertyChatChatService as Store } from '@berty-tech/berty-store'
import { berty } from '@berty-tech/api'

//
// ChatGroup
//

// Styles

const HeaderChatGroup: React.FC<berty.chatmodel.IConversation> = (props) => {
	const { avatarUri, title } = props
	const { navigate, goBack } = useNavigation()
	const [{ row, padding, flex, text, column }] = useStyles()
	return (
		<SafeAreaView>
			<View
				style={[row.center, padding.medium, { justifyContent: 'center', alignItems: 'center' }]}
			>
				<TouchableOpacity style={[flex.tiny, column.top]} onPress={goBack}>
					<Icon style={[column.item.center]} name='arrow-back-outline' width={30} height={30} />
				</TouchableOpacity>
				<View style={[flex.small, row.item.justify]}>
					<Text numberOfLines={1} category='h5' style={[text.align.center, text.bold]}>
						{title || ''}
					</Text>
				</View>
				<TouchableOpacity
					style={[flex.tiny, column.top]}
					onPress={() => navigate.chat.groupSettings(props)}
				>
					<GroupCircleAvatar
						style={[column.item.center]}
						firstAvatarUri={avatarUri || undefined}
						secondAvatarUri={avatarUri || undefined}
						size={40}
						diffSize={5}
					/>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	)
}

const ChatGroupMemberItem: React.FC<berty.chatmodel.IMember> = ({
	avatarUri,
	name,
	contactId,
	role,
}) => {
	const [layout, setLayout] = useState()
	const [contactGetReply] = Store.useContactGet({ id: contactId })
	const [state, icon, itemColor, bgColor] = {
		[berty.chatmodel.Member.Role.Owner]: ['Owner', 'checkmark-circle-2', 'white', 'blue'],
		[berty.chatmodel.Member.Role.Admin]: ['Admin', 'checkmark-circle-2', 'red', 'red'],
		[berty.chatmodel.Member.Role.Regular]: ['Regular', 'checkmark-circle-2', 'green', 'green'],
		[berty.chatmodel.Member.Role.Invited]: ['Invited', 'clock', 'yellow', 'yellow'],
		[berty.chatmodel.Member.Role.Unknown]: ['Unknown', 'question-mark-circle', 'grey', 'grey'],
	}[role ?? berty.chatmodel.Member.Role.Unknown]
	const [lightBgColor] = {
		[berty.chatmodel.Member.Role.Owner]: [false],
		[berty.chatmodel.Member.Role.Admin]: [true],
		[berty.chatmodel.Member.Role.Regular]: [true],
		[berty.chatmodel.Member.Role.Invited]: [true],
		[berty.chatmodel.Member.Role.Unknown]: [true],
	}[role ?? berty.chatmodel.Member.Role.Unknown]
	const [{ color, background, border, margin, padding, width, row, text }] = useStyles()

	return (
		<View
			onLayout={(e) => !layout && setLayout(e.nativeEvent.layout.height)}
			style={[
				border.radius.medium,
				border.shadow.small,
				background.white,
				padding.vertical.medium,
				margin.right.medium,
				width(90),
			]}
		>
			<View style={[{ alignItems: 'center' }]}>
				<View style={[padding.horizontal.small]}>
					<CircleAvatar
						avatarUri={avatarUri || contactGetReply?.contact?.avatarUri}
						diffSize={5}
						size={60}
						color={!lightBgColor ? color[bgColor] : color.light[bgColor]}
						state={{ icon, iconColor: color[bgColor] }}
					/>
					<Text numberOfLines={1} style={[text.align.center, text.size.small, margin.top.small]}>
						{name || contactGetReply?.contact?.name}
					</Text>
				</View>
				<View
					style={[
						margin.top.small,
						row.center,
						border.radius.medium,
						{ backgroundColor: !lightBgColor ? color[bgColor] : color.light[bgColor] },
					]}
				>
					<Text
						numberOfLines={1}
						style={[
							text.bold,
							text.size.tiny,
							padding.horizontal.small,
							{ color: color[itemColor] },
						]}
					>
						{state}
					</Text>
				</View>
			</View>
		</View>
	)
}

const ChatGroupMemberList: React.FC<berty.chatmodel.IConversation> = ({ id }) => {
	const [{ padding, margin }] = useStyles()
	return (
		<ScrollView
			style={[margin.top.big, padding.medium]}
			horizontal
			showsHorizontalScrollIndicator={false}
		>
			<Store.MemberList request={{ filter: { conversationId: id } }}>
				{(_) => _?.map(({ member }) => (member ? <ChatGroupMemberItem {...member} /> : null))}
			</Store.MemberList>
		</ScrollView>
	)
}

const InfosChatGroup: React.FC<berty.chatmodel.IConversation> = (props) => {
	const [{ margin, text }] = useStyles()
	return (
		<>
			<ChatDate date='Today' />
			<View style={[margin.top.medium]}>
				<Text style={[text.align.center, text.color.black, text.bold]}>Test created the group</Text>
			</View>
			<ChatGroupMemberList {...props} />
		</>
	)
}

const MessageListSpinner: React.FC<{ error?: Error }> = () => <ActivityIndicator size='large' />
const MessageList: React.FC<berty.chatmodel.IConversation> = (props) => {
	const [cursors] = useState([0])
	const [{ color, overflow, row, flex }] = useStyles()
	return (
		<FlatList
			style={[overflow, row.item.fill, flex.tiny]}
			data={cursors}
			inverted
			ListFooterComponent={<InfosChatGroup {...props} />}
			renderItem={() => (
				<Store.MessageList
					request={{ filter: { conversationId: props.id } }}
					fallback={MessageListSpinner}
				>
					{(_) =>
						_.map(({ message }) => <Message {...message} color={color.blue} bgColor='#CED2FF99' />)
					}
				</Store.MessageList>
			)}
		/>
	)
}

export const ChatGroup: React.FC<ScreenProps.Chat.Group> = ({ route: { params } }) => {
	const [inputIsFocused, setInputFocus] = useState(true)
	const [{ background, flex }] = useStyles()
	return (
		<View style={[flex.tiny, background.white]}>
			<KeyboardAvoidingView style={[flex.tiny]} behavior='padding'>
				<StatusBar backgroundColor='#00BCD4' barStyle='dark-content' />
				<HeaderChatGroup {...params} />
				<MessageList {...params} />
				<ChatFooter isFocused={inputIsFocused} setFocus={setInputFocus} />
			</KeyboardAvoidingView>
		</View>
	)
}
