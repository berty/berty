import React from 'react'
import { View, Image, ScrollView, StyleSheet } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { styles, colors } from '@berty-tech/styles'
import { RequestButtons, RequestAvatar, Fallback, TabBar, Modal } from '../shared-components'
import { BertyChatChatService as Store } from '@berty-tech/berty-store'
import { berty } from '@berty-tech/berty-api'
import { ScreenProps } from '@berty-tech/berty-navigation'

// Types
type BodyGroupRequestContentItemProps = {
	avatarUri: string
	name: string
	state?: {
		value: string
		color: string
		bgColor: string
	}
	separateBar?: boolean
	isConnected?: boolean
	previewValue?: string
}

// Styles
const _groupRequestStyles = StyleSheet.create({
	// Avatar
	avatar: {
		width: 51,
		height: 51,
		borderRadius: 51,
	},
	firstAvatar: {
		marginBottom: 45,
		marginRight: 45,
	},
	secondAvatar: {
		marginLeft: 45,
		marginTop: 45,
	},
	state: {
		paddingTop: 2,
		paddingBottom: 2,
		paddingLeft: 8,
		paddingRight: 8,
	},
	stateText: {
		fontSize: 8,
	},
	previewValue: {
		fontSize: 15,
	},
	separateBar: {
		borderColor: 'gray',
		opacity: 0.2,
		borderWidth: 0.5,
	},
})

const BodyGroupRequestContentItem: React.FC<berty.chatmodel.IMember & {
	separateBar: boolean
	isConnected?: boolean
}> = ({ avatarUri, name, role, state = {}, separateBar = true, isConnected = false }) => (
	<View>
		<View style={[styles.row, styles.paddingLeft, styles.paddingRight]}>
			<View style={[styles.row, styles.alignVertical]}>
				<Image
					style={[styles.marginRight, _groupRequestStyles.avatar]}
					source={{ uri: avatarUri || '' }}
				/>
				<Text numberOfLines={1} ellipsizeMode='tail'>
					{name}
				</Text>
				{isConnected && (
					<Icon
						style={[styles.littleMarginLeft]}
						name='checkmark-circle-2'
						width={15}
						height={15}
						fill={colors.blue}
					/>
				)}
			</View>
			{state && state.value && (
				<View style={[styles.center, styles.alignItems]}>
					<View
						style={[
							styles.borderRadius,
							styles.alignItems,
							_groupRequestStyles.state,
							{ backgroundColor: state.bgColor },
						]}
					>
						<Text
							style={[
								styles.center,
								styles.textBold,
								_groupRequestStyles.stateText,
								{ color: state.color },
							]}
						>
							{state.value}
						</Text>
					</View>
				</View>
			)}
			{role &&
			[berty.chatmodel.Member.Role.Admin, berty.chatmodel.Member.Role.Owner].some(
				(_) => _ === role,
			) ? (
				<View style={[styles.center, styles.alignItems]}>
					<Text style={[styles.textBlue, _groupRequestStyles.previewValue]}>
						{berty.chatmodel.Member.Role[role]}
					</Text>
				</View>
			) : null}
		</View>
		{separateBar ? <View style={[styles.littleMargin, _groupRequestStyles.separateBar]} /> : null}
	</View>
)

const BodyGroupRequestContent: React.FC<berty.chatmodel.IConversation> = ({ id }) => (
	<Store.MemberList request={{ filter: { conversationId: id } }} fallback={Fallback}>
		{(list) => (
			<ScrollView style={{ maxHeight: 300 }} contentContainerStyle={[styles.paddingTop]}>
				{list
					?.map((_) => _?.member)
					.map((member, index) => (
						<BodyGroupRequestContentItem {...member} separateBar={list.length !== index - 1} />
					)) ?? null}
			</ScrollView>
		)}
	</Store.MemberList>
)

const BodyGroupRequest: React.FC<berty.chatmodel.IConversation> = (conversation) => (
	<View style={[styles.paddingHorizontal, styles.paddingBottom]}>
		<RequestAvatar style={[styles.alignItems]} {...conversation} size={90} />
		<View style={[styles.paddingRight, styles.paddingLeft]}>
			<TabBar tabType='group' />
			<BodyGroupRequestContent {...conversation} />
		</View>
		<RequestButtons />
	</View>
)

export const GroupRequest: React.FC<ScreenProps.Main.GroupRequest> = ({ route: { params } }) => {
	return (
		<Modal>
			<Store.ConversationGet request={{ id: params.id }} fallback={Fallback}>
				{(_) => console.log(_) || <BodyGroupRequest {...(_?.conversation || {})} />}
			</Store.ConversationGet>
		</Modal>
	)
}
