import React from 'react'
import { View, Image, StyleProp } from 'react-native'
import { Icon } from 'react-native-ui-kitten'
import { useStyles, ColorsStyles } from '@berty-tech/styles'
import { messenger } from '@berty-tech/store'

//
// CircleAvatar => every avatar in white circle or not
//

// Types
type CircleAvatarProps = {
	avatarUri?: string
	withCircle?: boolean
	size?: number
	diffSize?: number
	color?: keyof ColorsStyles<string> // the color of the circle
	state?: {
		icon: string
		iconColor?: string
	} // when group is created, members have a state for know if the memeber accept, is pending or refuse
	style?: StyleProp<any>
}

// Styles
export const CircleAvatar: React.FC<CircleAvatarProps> = ({
	avatarUri,
	size = 100,
	diffSize = 10,
	color = 'white',
	state = {},
	style = null,
}) => {
	const [
		{ row, width, height, background, border, absolute, color: colorDecl },
		{ scaleSize },
	] = useStyles()
	const _circleStyle = [
		row.center,
		width(size),
		height(size),
		background.white,
		border.radius.scale(size / 2),
	]
	const _imgStyle = [
		row.item.justify,
		width(size - diffSize),
		height(size - diffSize),
		border.radius.scale((size - diffSize) / 2),
	]
	const _circleAvatarStyles = [absolute.scale({ top: -10, right: -10 })]
	return (
		<View style={style}>
			<View style={[_circleStyle]}>
				<Image style={_imgStyle} source={avatarUri ? { uri: avatarUri || '' } : {}} />
			</View>
			{state && state.icon ? (
				<View style={[_circleAvatarStyles]}>
					<Icon
						name={state.icon}
						width={30 * scaleSize}
						height={30 * scaleSize}
						fill={state.iconColor ? state.iconColor : colorDecl[color]}
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
}) => {
	const [{ absolute, width, height }] = useStyles()
	return (
		<View style={style}>
			<View style={[width(size), height(size)]}>
				<CircleAvatar
					avatarUri={secondAvatarUri}
					size={size * 0.7}
					diffSize={diffSize * 0.3}
					style={[absolute.right, absolute.bottom]}
				/>
				<CircleAvatar
					avatarUri={firstAvatarUri}
					size={size * 0.7}
					diffSize={diffSize * 0.3}
					style={[absolute.left, absolute.top]}
				/>
			</View>
		</View>
	)
}
export const Avatar: React.FC<{
	uris: Array<string>
	size?: number
	diffSize?: number
	style?: StyleProp<any>
}> = ({ uris, size, diffSize, style }) => {
	return uris.length >= 2 ? (
		<GroupCircleAvatar
			firstAvatarUri={uris[0] || ''}
			secondAvatarUri={uris[1] || ''}
			size={size}
			diffSize={diffSize}
			style={style}
		/>
	) : (
		<CircleAvatar style={style} avatarUri={uris[0] || ''} size={size} diffSize={diffSize} />
	)
}

type ConversationAvatarProp = messenger.conversation.Entity & {
	size?: number
	diffSize?: number
	style?: StyleProp<any>
}

export const ConversationAvatar: React.FC<ConversationAvatarProp> = ({ size, diffSize, style }) => {
	return <Avatar uris={[]} size={size} diffSize={diffSize} style={style} />
}
