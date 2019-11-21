import React, { useState } from 'react'
import {
	TouchableOpacity,
	View,
	SafeAreaView,
	StyleSheet,
	ScrollView,
	StyleProp,
	StatusBar,
} from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { styles, colors } from '../styles'
import { UserProps, RequestProps } from '../shared-props/User'
import { ChatFooter, ChatDate } from './shared-components/Chat'
import { GroupCircleAvatar, CircleAvatar } from '../shared-components/CircleAvatar'
import { Message } from './shared-components/Message'

//
// ChatGroup
//

// Types
type ChatGroupMemberItemProps = {
	avatarUri: string
	name: string
	color: string
	icon: string
	state: {
		value: string
		color: string
		bgColor: string
	}
	style?: StyleProp<any>
}

// Styles
const _chatGroupStyles = StyleSheet.create({
	headerGroupName: {
		flex: 5,
	},
	headerGroupNameText: {
		fontSize: 20,
	},
	memberItem: {
		width: 100,
	},
	memberItemPos: {
		bottom: 45,
	},
	memberItemText: {
		fontSize: 10,
	},
	memberItemStateText: {
		paddingTop: 2,
		paddingBottom: 2,
		paddingRight: 8,
		paddingLeft: 8,
	},
	memberList: {
		paddingTop: 40,
	},
	infosGroupCreated: {
		fontSize: 14,
	},
})

const HeaderChatGroup: React.FC<UserProps> = ({ avatarUri, name }) => (
	<View style={[styles.padding]}>
		<View style={[styles.row, styles.centerItems, styles.spaceCenter]}>
			<TouchableOpacity style={[styles.flex]}>
				<Icon name='arrow-back-outline' width={30} height={30} />
			</TouchableOpacity>
			<View style={[_chatGroupStyles.headerGroupName]}>
				<Text
					numberOfLines={1}
					style={[styles.textCenter, styles.textBold, _chatGroupStyles.headerGroupNameText]}
				>
					Surprise Party
				</Text>
			</View>
			<GroupCircleAvatar
				firstAvatarUri={avatarUri}
				secondAvatarUri={avatarUri}
				size={40}
				diffSize={5}
			/>
		</View>
	</View>
)

const ChatGroupMemberItem: React.FC<ChatGroupMemberItemProps> = ({
	avatarUri,
	name,
	color,
	icon,
	state,
	style = null,
}) => {
	const [layout, setLayout] = useState()

	return (
		<View
			onLayout={(e) => !layout && setLayout(e.nativeEvent.layout.height)}
			style={[
				styles.borderRadius,
				styles.shadow,
				styles.bgWhite,
				styles.padding,
				styles.marginRight,
				style,
				_chatGroupStyles.memberItem,
				layout && { height: layout - 45 },
			]}
		>
			<View style={[styles.centerItems, _chatGroupStyles.memberItemPos]}>
				<CircleAvatar
					avatarUri={avatarUri}
					diffSize={5}
					size={60}
					color={color}
					state={{ icon: icon }}
				/>
				<Text numberOfLines={1} style={[styles.textCenter, _chatGroupStyles.memberItemText]}>
					{name}
				</Text>
				<View
					style={[
						styles.littleMarginTop,
						styles.center,
						styles.borderRadius,
						_chatGroupStyles.memberItemStateText,
						{ backgroundColor: state.bgColor },
					]}
				>
					<Text
						numberOfLines={1}
						style={[styles.textBold, _chatGroupStyles.memberItemText, { color: state.color }]}
					>
						{state.value}
					</Text>
				</View>
			</View>
		</View>
	)
}

const ChatGroupMemberList: React.FC<RequestProps> = ({ user }) => (
	<ScrollView
		style={[
			styles.bigMarginTop,
			styles.paddingBottom,
			styles.paddingRight,
			_chatGroupStyles.memberList,
		]}
		horizontal
		showsHorizontalScrollIndicator={false}
	>
		<ChatGroupMemberItem
			{...user}
			color={colors.blue}
			icon='checkmark-circle-2'
			state={{ value: 'Creator', color: colors.white, bgColor: colors.blue }}
			style={styles.marginLeft}
		/>
		<ChatGroupMemberItem
			{...user}
			color={colors.green}
			icon='checkmark-circle-2'
			state={{ value: 'Accepted', color: colors.green, bgColor: colors.lightGreen }}
		/>
		<ChatGroupMemberItem
			{...user}
			color={colors.green}
			icon='checkmark-circle-2'
			state={{ value: 'Accepted', color: colors.green, bgColor: colors.lightGreen }}
		/>
		<ChatGroupMemberItem
			{...user}
			color={colors.yellow}
			icon='clock'
			state={{ value: 'Pending', color: colors.yellow, bgColor: colors.lightYellow }}
		/>
	</ScrollView>
)

const InfosChatGroup: React.FC<RequestProps> = ({ user }) => (
	<View style={[styles.padding]}>
		<ChatDate date='Today' />
		<View style={[styles.center, styles.marginTop]}>
			<Text
				style={[
					styles.center,
					styles.textBlack,
					styles.textBold,
					_chatGroupStyles.infosGroupCreated,
				]}
			>
				Test created the group
			</Text>
		</View>
		<ChatGroupMemberList user={user} />
	</View>
)

const ChatGroupMessageList: React.FC<RequestProps> = ({ user }) => (
	<View style={[styles.padding]}>
		<Message
			{...user}
			date='9:42'
			message='Je test un message pour voir et assez long pour gerer la width du component'
			isGroup
			color={colors.blue}
			bgColor={colors.lightMsgBlue}
		/>
		<Message
			{...user}
			date='9:42'
			message='Je test un message pour voir et assez long pour gerer la width du component'
			color={colors.white}
			isGroup
			bgColor={colors.blue}
			isMe={true}
			state={[{ icon: 'navigation-2', color: colors.blue, value: 'sent' }]}
		/>
		<Message
			{...user}
			date='9:42'
			message='Je test un message pour voir et assez long pour gerer la width du component hfhgfgfgegfeg  g fgf ufufufufuf uf ufufuftftf efw tfetrfetf tef tf tefytfyfyf ygy gyegygygy geyg yegy geyeg yg'
			color={colors.yellow}
			isGroup
			bgColor={colors.lightMsgYellow}
		/>
		<Message
			{...user}
			date='9:42'
			message='Je test un message pour voir et assez long pour gerer la width du component'
			color={colors.white}
			bgColor={colors.blue}
			isGroup
			isMe={true}
			state={[{ icon: 'done-all-outline', color: colors.blue, value: 'read' }]}
		/>
		<Message
			{...user}
			date='9:42'
			message='Je test un message pour voir et assez long pour gerer la width du component'
			color={colors.red}
			isGroup
			bgColor={colors.lightMsgRed}
		/>
		<Message
			{...user}
			date='9:42'
			message='Je test un message pour voir'
			color={colors.blue}
			bgColor={colors.white}
			isMe={true}
			isGroup
			styleMsg={{ borderColor: colors.blue, borderWidth: 2 }}
			state={[{ icon: 'paper-plane', color: colors.blue, value: 'sending...' }]}
		/>
		<Message
			{...user}
			date='9:42'
			message='Je test un message pour voir'
			color={colors.red}
			bgColor={colors.white}
			isMe={true}
			isGroup
			styleMsg={{ borderColor: colors.red, borderWidth: 2 }}
			state={[
				{ icon: 'alert-circle-outline', color: colors.red, value: 'failed to send!' },
				{ icon: 'paper-plane', color: colors.blue, value: 'retry sending...' },
			]}
		/>
	</View>
)

export const ChatGroup: React.FC<RequestProps> = ({ user }) => {
	const [isFocus, setIsFocus] = useState(false)

	return (
		<Layout style={[styles.flex]}>
			<SafeAreaView style={[StyleSheet.absoluteFill]}>
				<StatusBar backgroundColor='#00BCD4' barStyle='dark-content' />
				<HeaderChatGroup {...user} />
				<ScrollView>
					<InfosChatGroup user={user} />
					<ChatGroupMessageList user={user} />
				</ScrollView>
				<ChatFooter isFocus={isFocus} setIsFocus={setIsFocus} />
			</SafeAreaView>
		</Layout>
	)
}
