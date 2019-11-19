import React from 'react'
import { View, Image, StyleSheet, StyleProp } from 'react-native'
import { Icon } from 'react-native-ui-kitten'
import { styles, colors } from '../styles'

//
// CircleAvatar => every avatar in white circle or not
//

// Types
type CircleAvatarProps = {
	avatarUri: string
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
	color = colors.white,
	state = {},
	style = null,
}) => (
	<View style={[style]}>
		<View
			style={
				withCircle && [
					styles.alignItems,
					styles.spaceCenter,
					styles.shadow,
					{
						borderWidth: diffSize,
						borderColor: color,
						width: size,
						height: size,
						borderRadius: size / 2,
					},
				]
			}
		>
			<Image
				style={[
					{ width: size - diffSize, height: size - diffSize, borderRadius: (size - diffSize) / 2 },
				]}
				source={{ uri: avatarUri }}
			/>
		</View>
		{state && state.icon && (
			<View style={[styles.absolute, _circleAvatarStyles.state]}>
				<Icon
					name={state.icon}
					width={30}
					height={30}
					fill={state.iconColor ? state.iconColor : color}
				/>
			</View>
		)}
	</View>
)

//
// GroupCircleAvatar => CircleAvatar in a group screen
//

// Types
type GroupCircleAvatarProps = {
	firstAvatarUri: string
	secondAvatarUri: string
	size?: number
	diffSize?: number
}

export const GroupCircleAvatar: React.FC<GroupCircleAvatarProps> = ({
	firstAvatarUri,
	secondAvatarUri,
	size = 100,
	diffSize = 10,
}) => (
	<View style={[styles.flex]}>
		<View style={[styles.row, styles.center, { marginBottom: size / 2, marginRight: size / 2 }]}>
			<View style={[styles.absolute, { marginTop: size / 2, marginLeft: size / 2 }]}>
				<CircleAvatar avatarUri={firstAvatarUri} size={size} diffSize={diffSize} />
			</View>
			<CircleAvatar avatarUri={secondAvatarUri} size={size} diffSize={diffSize} />
		</View>
	</View>
)
