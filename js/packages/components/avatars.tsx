import React from 'react'
import Jdenticon from 'react-native-jdenticon'
import { Image, View, ViewStyle } from 'react-native'

import { useStyles } from '@berty-tech/styles'
import { useAccount, useContact, useMember, useConversation, Maybe } from '@berty-tech/store/hooks'
import beapi from '@berty-tech/api'

import AttachmentImage from './AttachmentImage'
import AvatarGroup19 from './main/Avatar_Group_Copy_19.png'
import Logo from './main/1_berty_picto.svg'

export type AvatarStyle = Omit<
	ViewStyle,
	'borderRadius' | 'width' | 'height' | 'alignItems' | 'justifyContent'
>

const GenericAvatar: React.FC<{
	cid: Maybe<string>
	size: number
	fallbackSeed: Maybe<string>
	style?: AvatarStyle
	isEditable?: boolean
}> = ({ cid, size, fallbackSeed, style, isEditable = false }) => {
	const [{ border, background, color }] = useStyles()
	const padding = Math.round(size / 14)
	let innerSize = Math.round(size - 2 * padding)
	let content: JSX.Element
	if (cid) {
		if (innerSize % 2) {
			innerSize--
		}
		content = (
			<>
				<AttachmentImage
					cid={cid}
					style={{ width: innerSize, height: innerSize, borderRadius: innerSize / 2 }}
					notPressable
				/>
				{isEditable ? (
					<View
						style={[
							{
								width: innerSize,
								height: innerSize,
								position: 'absolute',
								backgroundColor: color.light.blue,
								opacity: 0.6,
							},
							border.radius.scale(innerSize / 2),
						]}
					/>
				) : null}
			</>
		)
	} else {
		let iconSize = Math.round(innerSize - innerSize / 10) // adjust for jdenticon bug
		if (iconSize % 2) {
			iconSize--
		}
		content = (
			<>
				<Jdenticon value={fallbackSeed} size={iconSize} style={{}} />
				{isEditable ? (
					<View
						style={[
							{
								width: innerSize,
								height: innerSize,
								position: 'absolute',
								backgroundColor: color.light.blue,
								opacity: 0.6,
							},
							border.radius.scale(innerSize / 2),
						]}
					/>
				) : null}
			</>
		)
	}
	return (
		<>
			<View
				style={[
					background.white,
					border.shadow.medium,
					style,
					{
						borderRadius: size / 2,
						width: size,
						height: size,
						alignItems: 'center',
						justifyContent: 'center',
					},
				]}
			>
				{content}
			</View>
		</>
	)
}

export const BotAvatar: React.FC<{ size: number; style?: AvatarStyle }> = ({ size, style }) => {
	const [{ border, flex, background }] = useStyles()
	const padding = Math.round(size / 15)
	let innerSize = Math.round(size - 2 * padding)
	if (innerSize % 2) {
		innerSize--
	}
	let iconSize = Math.round(innerSize - innerSize / 8)
	if (iconSize % 2) {
		iconSize--
	}
	return (
		<View
			style={[
				background.white,
				border.shadow.medium,
				style,
				flex.justify.center,
				flex.align.center,
				{
					borderRadius: size / 2,
					width: size,
					height: size,
				},
			]}
		>
			<Logo width={iconSize} height={iconSize} style={{ right: -2, top: -1 }} />
		</View>
	)
}

export const AccountAvatar: React.FC<{
	size: number
	style?: AvatarStyle
	isEditable?: boolean
}> = ({ size, style, isEditable }) => {
	const account = useAccount()
	return (
		<GenericAvatar
			cid={account?.avatarCid}
			size={size}
			fallbackSeed={account?.publicKey}
			style={style}
			isEditable={isEditable}
		/>
	)
}

export const ContactAvatar: React.FC<{
	publicKey: Maybe<string>
	size: number
	style?: AvatarStyle
}> = ({ publicKey, size, style }) => {
	const contact = useContact(publicKey)
	return (
		<GenericAvatar
			cid={contact?.avatarCid}
			size={size}
			fallbackSeed={contact?.publicKey}
			style={style}
		/>
	)
}

export const MemberAvatar: React.FC<{
	publicKey: Maybe<string>
	conversationPublicKey: Maybe<string>
	size: number
}> = ({ publicKey, conversationPublicKey, size }) => {
	const member = useMember({ publicKey, conversationPublicKey })
	return <GenericAvatar cid={member?.avatarCid} size={size} fallbackSeed={member?.publicKey} />
}

export const MultiMemberAvatar: React.FC<{ size: number; style?: AvatarStyle }> = ({
	size,
	style,
}) => {
	const [{ border }] = useStyles()
	return (
		<View
			style={[{ borderRadius: size / 2, backgroundColor: 'white' }, border.shadow.medium, style]}
		>
			<Image
				source={AvatarGroup19}
				style={{
					width: size,
					height: size,
					borderRadius: size / 2,
				}}
			/>
		</View>
	)
}

export const ConversationAvatar: React.FC<{
	publicKey: Maybe<string>
	size: number
	style?: AvatarStyle
}> = ({ publicKey, size, style }) => {
	const conv = useConversation(publicKey)

	if (!conv) {
		return <GenericAvatar size={size} style={style} cid='' fallbackSeed={publicKey} />
	}

	if (conv.type === beapi.messenger.Conversation.Type.MultiMemberType) {
		return <MultiMemberAvatar size={size} style={style} />
	}

	return <ContactAvatar size={size} publicKey={conv?.contactPublicKey} />
}
