import React from 'react'
import { View, Image, StyleProp } from 'react-native'
import { Icon } from 'react-native-ui-kitten'
import { useStyles, ColorsTypes } from '@berty-tech/styles'
import { berty } from '@berty-tech/api'
import Jdenticon from 'react-native-jdenticon'
import { Chat } from '@berty-tech/hooks'

//
// ProceduralCircleAvatar => every avatar in white circle or not
//

// Types
type ProceduralCircleAvatarProps = {
	seed?: string
	withCircle?: boolean
	size?: number
	diffSize?: number
	color?: ColorsTypes // the color of the circle
	state?: {
		icon: string
		iconColor?: ColorsTypes
		stateColor?: ColorsTypes
	} // when group is created, members have a state for know if the memeber accept, is pending or refuse
	style?: StyleProp<any>
}

// Styles
export const ProceduralCircleAvatar: React.FC<ProceduralCircleAvatarProps> = ({
	seed,
	withCircle = true,
	size = 100,
	diffSize = 10,
	color = 'white',
	state = {},
	style = null,
}) => {
	const [{ row, width, height, background, border, absolute, color: colorDecl }] = useStyles()
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
				<Jdenticon value={seed} size={size - diffSize} style={{}} />
			</View>
			{state && state.icon ? (
				<View style={[_circleAvatarStyles]}>
					<Icon
						name={state.icon}
						width={30}
						height={30}
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
	const [{ padding }] = useStyles()
	return seeds.length >= 2 ? (
		<GroupProceduralCircleAvatar
			firstSeed={seeds[0] || ''}
			secondSeed={seeds[1] || ''}
			size={size}
			diffSize={diffSize}
			style={style}
			withCircle={false}
		/>
	) : (
		<ProceduralCircleAvatar
			style={style}
			seed={seeds[0] || ''}
			size={size}
			diffSize={diffSize}
			withCircle={false}
		/>
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
	const conversation = Chat.useGetConversation(conversationId)
	const contact = Chat.useOneToOneConversationContact(conversationId)
	const seeds: string[] = []
	switch (conversation.kind) {
		case berty.chatmodel.Conversation.Kind.OneToOne:
			if (contact) {
				seeds.push(contact.publicKey)
			}
			break
		case 'fake':
			seeds.push(conversation.id)
			break
	}
	return <ProceduralAvatar seeds={seeds} size={size} diffSize={diffSize} style={style} />
}
