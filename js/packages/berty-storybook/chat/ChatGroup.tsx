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
	StyleSheet,
} from 'react-native'
import { Text, Icon } from 'react-native-ui-kitten'
import { styles, colors } from '@berty-tech/styles'
import { ChatFooter, ChatDate } from './shared-components/Chat'
import { GroupCircleAvatar, CircleAvatar } from '../shared-components/CircleAvatar'
import { Message } from './shared-components/Message'
import { ScreenProps, useNavigation } from '@berty-tech/berty-navigation'
import { BertyChatChatService as Store } from '@berty-tech/berty-store'
import { berty } from '@berty-tech/berty-api'
import { BlurView } from '@react-native-community/blur'

//
// ChatGroup
//

// Styles

const HeaderChatGroup: React.FC<berty.chatmodel.IConversation> = (props) => {
	const { avatarUri, title } = props
	const { navigate, goBack } = useNavigation()
	return (
		<SafeAreaView>
			<View style={[styles.row, styles.centerItems, styles.spaceCenter, styles.padding]}>
				<TouchableOpacity style={[styles.flex, styles.col]} onPress={goBack}>
					<Icon style={[styles.start]} name='arrow-back-outline' width={30} height={30} />
				</TouchableOpacity>
				<View style={[styles.smallFlex, styles.center]}>
					<Text numberOfLines={1} category='h5' style={[styles.textCenter, styles.textBold]}>
						{title || ''}
					</Text>
				</View>
				<TouchableOpacity
					style={[styles.flex, styles.col]}
					onPress={() => navigate.chat.groupSettings(props)}
				>
					<GroupCircleAvatar
						style={[styles.end]}
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
	const [state, icon, color, bgColor] = {
		[berty.chatmodel.Member.Role.Owner]: ['Owner', 'checkmark-circle-2', 'white', 'blue'],
		[berty.chatmodel.Member.Role.Admin]: ['Admin', 'checkmark-circle-2', 'red', 'lightRed'],
		[berty.chatmodel.Member.Role.Regular]: ['Regular', 'checkmark-circle-2', 'green', 'lightGreen'],
		[berty.chatmodel.Member.Role.Invited]: ['Invited', 'clock', 'yellow', 'lightYellow'],
		[berty.chatmodel.Member.Role.Unknown]: ['Unknown', 'question-mark-circle', 'grey', 'lightGrey'],
	}[role ?? berty.chatmodel.Member.Role.Unknown]

	return (
		<View
			onLayout={(e) => !layout && setLayout(e.nativeEvent.layout.height)}
			style={[
				styles.borderRadius,
				styles.shadow,
				styles.bgWhite,
				styles.marginRight,
				styles.littlePaddingVertical,
				{ width: 90 },
			]}
		>
			<View style={[styles.centerItems]}>
				<View style={[styles.littlePaddingHorizontal]}>
					<CircleAvatar
						avatarUri={avatarUri || contactGetReply?.contact?.avatarUri}
						diffSize={5}
						size={60}
						color={color}
						state={{ icon }}
					/>
					<Text
						numberOfLines={1}
						style={[styles.textCenter, styles.textSmall, styles.littleMarginTop]}
					>
						{name || contactGetReply?.contact?.name}
					</Text>
				</View>
				<View
					style={[
						styles.littleMarginTop,
						styles.center,
						styles.borderRadius,
						{ backgroundColor: colors[bgColor] },
					]}
				>
					<Text
						numberOfLines={1}
						style={[
							styles.textBold,
							styles.textTiny,
							styles.littlePaddingLeft,
							styles.littlePaddingRight,
							{ color: colors[color] },
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
	return (
		<ScrollView
			style={[styles.bigMarginTop, styles.padding, styles.paddingBottom, styles.paddingRight]}
			horizontal
			showsHorizontalScrollIndicator={false}
		>
			<Store.MemberList request={{ filter: { conversationId: id } }}>
				{(_) => _?.map(({ member }) => (member ? <ChatGroupMemberItem {...member} /> : null))}
			</Store.MemberList>
		</ScrollView>
	)
}

const InfosChatGroup: React.FC<berty.chatmodel.IConversation> = (props) => (
	<>
		<ChatDate date='Today' />
		<View style={[styles.center, styles.marginTop]}>
			<Text style={[styles.center, styles.textBlack, styles.textBold]}>Test created the group</Text>
		</View>
		<ChatGroupMemberList {...props} />
	</>
)

const MessageListSpinner: React.FC<{ error?: Error }> = () => <ActivityIndicator size='large' />
const MessageList: React.FC<berty.chatmodel.IConversation> = (props) => {
	const [cursors] = useState([0])
	return (
		<FlatList
			style={[styles.overflow, styles.stretch, styles.flex]}
			data={cursors}
			inverted
			ListFooterComponent={<InfosChatGroup {...props} />}
			renderItem={() => (
				<Store.MessageList
					request={{ filter: { conversationId: props.id } }}
					fallback={MessageListSpinner}
				>
					{(_) =>
						_.map(({ message }) => (
							<Message
								{...message}
								date='9:42'
								message='Bonkur fjhfjhefefbe hjfgvddd g hjheg jgjhgjehgjhg jhge jhghdjkwlfuy wtyrygv gg hrhg rjygr'
								color={colors.blue}
								bgColor={colors.lightMsgBlue}
							/>
						))
					}
				</Store.MessageList>
			)}
		/>
	)
}

export const ChatGroup: React.FC<ScreenProps.Chat.Group> = ({ route: { params } }) => {
	const [inputIsFocused, setInputFocus] = useState(true)
	return (
		<View style={[styles.flex, styles.bgWhite]}>
			<KeyboardAvoidingView style={[styles.flex]} behavior='padding'>
				<StatusBar backgroundColor='#00BCD4' barStyle='dark-content' />
				<HeaderChatGroup {...params} />
				<MessageList {...params} />
				<ChatFooter isFocused={inputIsFocused} setFocus={setInputFocus} />
			</KeyboardAvoidingView>
		</View>
	)
}
