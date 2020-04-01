import React from 'react'
import { View, Image, ScrollView } from 'react-native'
import { Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { RequestButtons, RequestAvatar, Fallback, TabBar, Modal } from '../shared-components'
import { BertyChatChatService as Store } from '@berty-tech/berty-store'
import { berty } from '@berty-tech/api'
import { ScreenProps } from '@berty-tech/berty-navigation'

// Styles
const useStylesGroupRequest = () => {
	const [{ width, height, border, margin, padding, text }] = useStyles()
	return {
		avatar: [width(51), height(51), border.radius.scale(51)],
		firstAvatar: [margin.bottom.scale(45), margin.right.scale(45)],
		secondAvatar: [margin.top.scale(45), margin.left.scale(45)],
		state: [padding.top.scale(2), padding.bottom.scale(2), padding.left.tiny, padding.right.tiny],
		stateText: text.size.scale(8),
		previewValue: text.size.medium,
		separateBar: [border.color.light.grey, border.medium],
	}
}

const BodyGroupRequestContentItem: React.FC<berty.chatmodel.IMember & {
	separateBar: boolean
	isConnected?: boolean
}> = ({ avatarUri, name, role, state = {}, separateBar = true, isConnected = false }) => {
	const _styles = useStylesGroupRequest()
	const [{ row, padding, margin, border, color, text }] = useStyles()

	return (
		<View>
			<View style={[row.fill, padding.left.small, padding.right.small]}>
				<View style={[row.center, row.item.justify]}>
					<Image
						style={[margin.right.medium, row.item.justify, _styles.avatar]}
						source={{ uri: avatarUri || '' }}
					/>
					<Text numberOfLines={1} ellipsizeMode='tail' style={row.item.justify}>
						{name}
					</Text>
					{isConnected && (
						<Icon
							style={[margin.left.small]}
							name='checkmark-circle-2'
							width={15}
							height={15}
							fill={color.blue}
						/>
					)}
				</View>
				{state && state.value && (
					<View style={[row.center]}>
						<View style={[border.radius.medium, _styles.state, { backgroundColor: state.bgColor }]}>
							<Text style={[text.bold.medium, _styles.stateText, { color: state.color }]}>
								{state.value}
							</Text>
						</View>
					</View>
				)}
				{role &&
				[berty.chatmodel.Member.Role.Admin, berty.chatmodel.Member.Role.Owner].some(
					(_) => _ === role,
				) ? (
					<View style={[row.item.justify]}>
						<Text style={[text.color.blue, _styles.previewValue]}>
							{berty.chatmodel.Member.Role[role]}
						</Text>
					</View>
				) : null}
			</View>
			{separateBar ? <View style={[margin.small, _styles.separateBar]} /> : null}
		</View>
	)
}

const BodyGroupRequestContent: React.FC<berty.chatmodel.IConversation> = ({ id }) => {
	const [{ maxHeight, padding }] = useStyles()
	return (
		<Store.MemberList request={{ filter: { conversationId: id } }} fallback={Fallback}>
			{(list) => (
				<ScrollView style={maxHeight(330)} contentContainerStyle={[padding.top.big]}>
					{list
						?.map((_) => _?.member)
						.map((member, index) => (
							<BodyGroupRequestContentItem {...member} separateBar={list.length !== index - 1} />
						)) ?? null}
				</ScrollView>
			)}
		</Store.MemberList>
	)
}

const BodyGroupRequest: React.FC<berty.chatmodel.IConversation> = (conversation) => {
	const [{ padding, absolute, row }] = useStyles()

	return (
		<View style={[padding.horizontal.medium, padding.bottom.medium]}>
			<RequestAvatar {...conversation} size={90} />
			<View style={[padding.horizontal.medium, { top: -30 }]}>
				<TabBar tabType='group' />
				<BodyGroupRequestContent {...conversation} />
			</View>
			<RequestButtons />
		</View>
	)
}

export const GroupRequest: React.FC<ScreenProps.Main.GroupRequest> = ({ route: { params } }) => {
	return (
		<Modal>
			<Store.ConversationGet request={{ id: params.id }} fallback={Fallback}>
				{(_) => <BodyGroupRequest {...(_?.conversation || {})} />}
			</Store.ConversationGet>
		</Modal>
	)
}
