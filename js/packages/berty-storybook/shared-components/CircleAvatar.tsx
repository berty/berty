import React from 'react'
import { View, Image, StyleSheet, StyleProp } from 'react-native'
import { Icon } from 'react-native-ui-kitten'
import { styles, colors } from '@berty-tech/styles'
import { berty } from '@berty-tech/berty-api'
import { BertyChatChatService as Store } from '@berty-tech/berty-store'

//
// CircleAvatar => every avatar in white circle or not
//

// Types
type CircleAvatarProps = {
	avatarUri?: string
	withCircle?: boolean
	size?: number
	diffSize?: number
	color?: string // the color of the circle
	state?: {
		icon: string
		iconColor?: string
		stateColor?: string
	} // when group is created, members have a state for know if the memeber accept, is pending or refuse
	style?: StyleProp<any>
}

// Styles
const _circleAvatarStyles = StyleSheet.create({
	state: {
		right: -10,
		top: -10,
	},
})

export const CircleAvatar: React.FC<CircleAvatarProps> = ({
	avatarUri,
	withCircle = true,
	size = 100,
	diffSize = withCircle ? 10 : 0,
	color = 'white',
	state = {},
	style = null,
}) => {
	const { _circleStyle } = StyleSheet.create({
		_circleStyle: {
			borderWidth: diffSize,
			borderColor: colors[color],
			width: size,
			height: size,
			borderRadius: size / 2,
		},
	})
	return (
		<View style={style}>
			<View style={[styles.alignItems, styles.spaceCenter, _circleStyle]}>
				<Image
					style={[
						{
							width: size - diffSize,
							height: size - diffSize,
							borderRadius: (size - diffSize) / 2,
						},
					]}
					source={avatarUri ? { uri: avatarUri || '' } : undefined}
				/>
			</View>
			{state && state.icon ? (
				<View style={[styles.absolute, _circleAvatarStyles.state]}>
					<Icon
						name={state.icon}
						width={30}
						height={30}
						fill={state.iconColor ? state.iconColor : colors[color]}
					/>
				</View>
			) : null}
		</View>
	)
}

//
// GroupCircleAvatar => CircleAvatar in a group screen
//

// Types
type GroupCircleAvatarProps = {
	firstAvatarUri?: string
	secondAvatarUri?: string
	size?: number
	diffSize?: number
	style?: StyleProp<any>
}

export const GroupCircleAvatar: React.FC<GroupCircleAvatarProps> = ({
	firstAvatarUri,
	secondAvatarUri,
	size = 100,
	diffSize = 10,
	style,
}) => (
	<View style={style}>
		<View style={[styles.row, styles.center, { marginBottom: size / 2, marginRight: size / 2 }]}>
			<View style={[styles.absolute, { marginTop: size / 2, marginLeft: size / 2 }]}>
				<CircleAvatar avatarUri={firstAvatarUri} size={size} diffSize={diffSize} />
			</View>
			<CircleAvatar avatarUri={secondAvatarUri} size={size} diffSize={diffSize} />
		</View>
	</View>
)

export const Avatar: React.FC<{
	uris: Array<string>
	size?: number
	diffSize?: number
	style?: StyleProp<any>
}> = ({ uris, size, diffSize, style }) =>
	uris.length >= 2 ? (
		<GroupCircleAvatar
			firstAvatarUri={uris[0] || ''}
			secondAvatarUri={uris[1] || ''}
			size={size}
			diffSize={diffSize}
			style={style}
		/>
	) : (
		<CircleAvatar
			style={[styles.littlePadding, style]}
			avatarUri={uris[0] || ''}
			size={size}
			diffSize={diffSize}
			withCircle={false}
		/>
	)

const useMembers = (filter: berty.chatmodel.IMember): Array<berty.chatmodel.IMember> | null => {
	const [data, error] = Store.useMemberList({ filter })
	if (error) {
		return null
	}
	return data?.filter((_) => _?.member != null).map((_) => _.member) ?? null
}

export const ConversationAvatar: React.FC<berty.chatmodel.IConversation & {
	size?: number
	diffSize?: number
	style?: StyleProp<any>
}> = ({ id, avatarUri, kind, size, diffSize, style }: berty.chatmodel.IConversation) => {
	const members = useMembers({ conversationId: id })?.filter((_) => _?.avatarUri != null)
	return (
		<Avatar
			uris={
				kind === berty.chatmodel.Conversation.Kind.PrivateGroup && members && members.length >= 2
					? members.map((_) => _.avatarUri || '')
					: [(members && members[0]?.avatarUri) || avatarUri || '']
			}
			size={size}
			diffSize={diffSize}
			style={style}
		/>
	)
}
