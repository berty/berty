import React from 'react'
import { View, Image, ScrollView, StyleSheet } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { styles, colors } from '../styles'
import { UserProps, RequestProps } from '../shared-props/User'
import { RequestButtons, RequestAvatar } from '../shared-components/Request'
import { TabBar } from '../shared-components/TabBar'
import { Modal } from '../shared-components/Modal'

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

const BodyGroupRequestContentItem: React.FC<BodyGroupRequestContentItemProps> = ({
	avatarUri,
	name,
	state = {},
	separateBar = true,
	isConnected = false,
	previewValue = null,
}) => (
	<View>
		<View style={[styles.row, styles.paddingLeft, styles.paddingRight]}>
			<View style={[styles.row, styles.alignVertical]}>
				<Image
					style={[styles.marginRight, _groupRequestStyles.avatar]}
					source={{ uri: avatarUri }}
				/>
				<Text numberOfLines={1}>{name}</Text>
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
			{previewValue && (
				<View style={[styles.center, styles.alignItems]}>
					<Text style={[styles.textBlue, _groupRequestStyles.previewValue]}>{previewValue}</Text>
				</View>
			)}
		</View>
		{separateBar && <View style={[styles.littleMargin, _groupRequestStyles.separateBar]} />}
	</View>
)

const BodyGroupRequestContent: React.FC<UserProps> = ({ avatarUri, name }) => (
	<ScrollView style={{ maxHeight: 300 }} contentContainerStyle={[styles.paddingTop]}>
		<BodyGroupRequestContentItem
			avatarUri={avatarUri}
			name={name}
			state={{ value: 'Creator', color: colors.white, bgColor: colors.blue }}
		/>
		<BodyGroupRequestContentItem avatarUri={avatarUri} name={name} />
		<BodyGroupRequestContentItem avatarUri={avatarUri} name={name} isConnected={true} />
		<BodyGroupRequestContentItem avatarUri={avatarUri} name={name} />
		<BodyGroupRequestContentItem avatarUri={avatarUri} name={name} isConnected={true} />
		<BodyGroupRequestContentItem avatarUri={avatarUri} name={name} isConnected={true} />
		<BodyGroupRequestContentItem avatarUri={avatarUri} name={name} />
		<BodyGroupRequestContentItem avatarUri={avatarUri} name={name} />
		<BodyGroupRequestContentItem avatarUri={avatarUri} name={name} />
		<BodyGroupRequestContentItem avatarUri={avatarUri} name={name} />
		<BodyGroupRequestContentItem
			avatarUri={avatarUri}
			name={name}
			previewValue='Me'
			separateBar={false}
		/>
	</ScrollView>
)

const BodyGroupRequest: React.FC<RequestProps> = ({ user }) => (
	<View style={[styles.paddingHorizontal, styles.paddingBottom]}>
		<RequestAvatar style={[styles.alignItems]} {...user} size={90} />
		<View style={[styles.paddingRight, styles.paddingLeft]}>
			<TabBar tabType='group' />
			<BodyGroupRequestContent {...user} />
		</View>
		<RequestButtons />
	</View>
)

export const GroupRequest: React.FC<RequestProps> = ({ user }) => (
	<Layout style={[styles.flex, styles.bgBlue]}>
		<Modal>
			<BodyGroupRequest user={user} />
		</Modal>
	</Layout>
)
