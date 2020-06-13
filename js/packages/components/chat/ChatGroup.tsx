import React, { useState, useEffect } from 'react'
import {
	TouchableOpacity,
	View,
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
import { ScreenProps, useNavigation } from '@berty-tech/navigation'
// import { BertyChatChatService as Store } from '@berty-tech/berty-store'
import { berty } from '@berty-tech/api'
import { Messenger } from '@berty-tech/hooks'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation as useReactNavigation } from '@react-navigation/native'
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
					<Text numberOfLines={1} category='h5' style={[text.align.center, text.bold.medium]}>
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

// const ChatGroupMemberItem: React.FC<berty.chatmodel.IMember> = ({
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

// const ChatGroupMemberList: React.FC<berty.chatmodel.IConversation> = ({ id }) => {
// 	const [{ padding, margin }] = useStyles()
// 	return (
// 		<ScrollView
// 			style={[margin.top.big, padding.medium]}
// 			horizontal
// 			showsHorizontalScrollIndicator={false}
// 		>
// 			<Store.MemberList request={{ filter: { conversationId: id } }}>
// 				{(_) => _?.map(({ member }) => (member ? <ChatGroupMemberItem {...member} /> : null))}
// 			</Store.MemberList>
// 		</ScrollView>
// 	)
// }

const InfosChatGroup: React.FC<{ createdAt: number }> = ({ createdAt }) => {
	const [{ margin, text }] = useStyles()
	return (
		<View>
			<ChatDate date={createdAt} />
			<View style={[margin.top.medium]}>
				<Text style={[text.align.center, text.color.black, text.bold.medium]}>
					Test created the group
				</Text>
			</View>
			{/* <ChatGroupMemberList /> */}
		</View>
	)
}

const AppMessage: React.FC<{ message: string }> = ({ message }) => (
	<Message payload={Messenger.useGetMessage(message)} />
)

const MessageListSpinner: React.FC<{ error?: Error }> = () => <ActivityIndicator size='large' />

const MessageList: React.FC<{ id: string }> = ({ id }) => {
	const [{ overflow, row, flex }] = useStyles()
	const conversation = Messenger.useGetConversation(id)
	return (
		<FlatList
			style={[overflow, row.item.fill, flex.tiny]}
			data={conversation ? [...conversation.messages].reverse() : []}
			inverted
			ListFooterComponent={<InfosChatGroup createdAt={conversation.createdAt} />}
			renderItem={({ item }) => <AppMessage message={item} />}
		/>
	)
}

const useReadEffect = (convId: string, timeout: number) => {
	// timeout is the duration (in ms) that the user must stay on the page to set messages as read
	const navigation = useReactNavigation()
	const startRead = ChatHooks.useStartReadConversation(convId)
	const stopRead = ChatHooks.useStopReadConversation(convId)

	useEffect(() => {
		let timeoutID: number | null = null
		const handleStart = () => {
			if (timeoutID === null) {
				timeoutID = setTimeout(() => {
					timeoutID = null
					startRead()
				}, timeout)
			}
		}
		handleStart()
		const unsubscribeFocus = navigation.addListener('focus', handleStart)
		const handleStop = () => {
			if (timeoutID !== null) {
				clearTimeout(timeoutID)
				timeoutID = null
			}
			stopRead()
		}
		const unsubscribeBlur = navigation.addListener('blur', handleStop)
		return () => {
			unsubscribeFocus()
			unsubscribeBlur()
			handleStop()
		}
	}, [navigation, startRead, stopRead, timeout])
}

export const ChatGroup: React.FC<ScreenProps.Chat.Group> = ({ route: { params } }) => {
	const [inputIsFocused, setInputFocus] = useState(true)
	const [{ background, flex }] = useStyles()
	useReadEffect(params.convId, 1000)
	return (
		<View style={[flex.tiny, background.white]}>
			<KeyboardAvoidingView style={[flex.tiny]} behavior='padding'>
				<StatusBar backgroundColor='#00BCD4' barStyle='dark-content' />
				<HeaderChatGroup {...params} />
				<MessageList id={params.convId} />
				<ChatFooter convId={params.convId} isFocused={inputIsFocused} setFocus={setInputFocus} />
			</KeyboardAvoidingView>
		</View>
	)
}
