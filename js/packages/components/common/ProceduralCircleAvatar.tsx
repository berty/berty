import { useMsgrContext } from '@berty-tech/store/hooks'
import { ColorsStyles, useStyles } from '@berty-tech/styles'
import React from 'react'
import { StyleProp, View } from 'react-native'
import Jdenticon from 'react-native-jdenticon'
import { Icon } from '@ui-kitten/components'

//
// ProceduralCircleAvatar => every avatar in white circle or not
//

// Types
type ProceduralCircleAvatarProps = {
	seed?: string | null
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
export const ProceduralCircleAvatar: React.FC<ProceduralCircleAvatarProps> = ({
	seed,
	size = 100,
	diffSize = 10,
	color = 'white',
	state = {},
	style = null,
}) => {
	// for centering to work properly, size and diffsize must have the same oddness (pair or odd)
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
	const _circleAvatarStyles = [absolute.scale({ top: -10, right: -10 })]
	return (
		<View style={style}>
			<View
				style={[_circleStyle, { display: 'flex', alignItems: 'center', justifyContent: 'center' }]}
			>
				<Jdenticon value={seed} size={(size - diffSize) * scaleSize} style={{}} />
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
// GroupProceduralCircleAvatar => ProceduralCircleAvatar in a group screen
//

// Types
type GroupProceduralCircleAvatarProps = {
	firstSeed?: string
	secondSeed?: string
	size?: number
	diffSize?: number
	style?: StyleProp<any>
}

export const GroupProceduralCircleAvatar: React.FC<GroupProceduralCircleAvatarProps> = ({
	firstSeed,
	secondSeed,
	size = 100,
	diffSize = 10,
	style,
}) => {
	const [{ absolute, width, height }] = useStyles()
	return (
		<View style={style}>
			<View style={[width(size), height(size)]}>
				<ProceduralCircleAvatar
					seed={secondSeed}
					size={size * 0.7}
					diffSize={diffSize * 0.3}
					style={[absolute.right, absolute.bottom]}
				/>
				<ProceduralCircleAvatar
					seed={firstSeed}
					size={size * 0.7}
					diffSize={diffSize * 0.3}
					style={[absolute.left, absolute.top]}
				/>
			</View>
		</View>
	)
}
export const ProceduralAvatar: React.FC<{
	seeds: Array<string>
	size?: number
	diffSize?: number
	style?: StyleProp<any>
}> = ({ seeds, size, diffSize, style }) => {
	return seeds.length >= 2 ? (
		<GroupProceduralCircleAvatar
			firstSeed={seeds[0] || ''}
			secondSeed={seeds[1] || ''}
			size={size}
			diffSize={diffSize}
			style={style}
		/>
	) : (
		<ProceduralCircleAvatar style={style} seed={seeds[0] || ''} size={size} diffSize={diffSize} />
	)
}

type ConversationProceduralAvatarProp = {
	conversationId: string
	size?: number
	diffSize?: number
	style?: StyleProp<any>
}

export const ConversationProceduralAvatar: React.FC<ConversationProceduralAvatarProp> = ({
	conversationId,
	size,
	diffSize,
	style,
}) => {
	const ctx: any = useMsgrContext()
	const seeds: string[] = []
	if (ctx.conversations[conversationId]) {
		seeds.push(conversationId)
	} else {
		const contact: any = Object.values(ctx.contacts).find(
			(c: any) => c.conversationPublicKey === conversationId,
		)
		if (contact) {
			seeds.push(contact.publicKey)
		}
	}
	return <ProceduralAvatar seeds={seeds} size={size} diffSize={diffSize} style={style} />
}
