import React from 'react'
import Jdenticon from 'react-native-jdenticon'
import { Image, View, ViewStyle } from 'react-native'

import { useStyles } from '@berty-tech/styles'
import {
	useAccount,
	useContact,
	useMember,
	useConversation,
	Maybe,
	useMsgrContext,
} from '@berty-tech/store/hooks'
import beapi from '@berty-tech/api'
import PinkBotAvatar from '@berty-tech/assets/berty_bot_pink_bg.png'
import GreenDevAvatar from '@berty-tech/assets/berty_dev_green_bg.png'
import OrangeBotAvatar from '@berty-tech/assets/berty_bot_orange_bg.png'
import BlueDevAvatar from '@berty-tech/assets/berty_dev_blue_bg.png'

import AttachmentImage from './AttachmentImage'
import GroupAvatar from './main/Avatar_Group_Copy_19.png'
import Logo from './main/1_berty_picto.svg'

export type AvatarStyle = Omit<
	ViewStyle,
	'borderRadius' | 'width' | 'height' | 'alignItems' | 'justifyContent'
>

export const GenericAvatar: React.FC<{
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

const hardcodedAvatars = {
	berty_dev_green_bg: GreenDevAvatar,
	berty_bot_pink_bg: PinkBotAvatar,
	berty_dev_blue_bg: BlueDevAvatar,
	berty_bot_orange_bg: OrangeBotAvatar,

	group: GroupAvatar,
}

export type HardcodedAvatarKey = keyof typeof hardcodedAvatars

export const HardcodedAvatar: React.FC<{
	size: number
	style?: AvatarStyle
	name: HardcodedAvatarKey
}> = ({ size, style, name }) => {
	const [{ border }] = useStyles()
	let avatar = hardcodedAvatars[name]
	if (!avatar) {
		avatar = Logo
	}

	return (
		<View
			style={[{ borderRadius: size / 2, backgroundColor: 'white' }, border.shadow.medium, style]}
		>
			<Image
				source={avatar}
				style={{
					width: size,
					height: size,
					borderRadius: size / 2,
				}}
			/>
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
	const ctx = useMsgrContext()
	const suggestion = Object.values(ctx.persistentOptions?.suggestions).find(
		(v) => v.pk === publicKey,
	)
	if (suggestion) {
		return <HardcodedAvatar size={size} style={style} name={suggestion.icon as any} />
	}
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

export const MultiMemberAvatar: React.FC<{
	size: number
	style?: AvatarStyle
	publicKey: Maybe<string>
}> = ({ size, style, publicKey }) => {
	const ctx = useMsgrContext()
	const suggestion = Object.values(ctx.persistentOptions?.suggestions).find(
		(v) => v.pk === publicKey,
	)
	let name = 'group'
	if (suggestion) {
		name = suggestion.icon
	}
	return <HardcodedAvatar size={size} style={style} name={name as any} />
}

export const ConversationAvatar: React.FC<{
	publicKey: Maybe<string>
	size: number
	style?: AvatarStyle
}> = ({ publicKey, size, style }) => {
	const conv = useConversation(publicKey)
	const ctx = useMsgrContext()

	const suggestion = Object.values(ctx.persistentOptions?.suggestions).find(
		(v) => v.pk === publicKey,
	)
	if (suggestion) {
		return <HardcodedAvatar size={size} style={style} name={suggestion.icon as any} />
	}

	if (!conv) {
		return <GenericAvatar size={size} style={style} cid='' fallbackSeed={publicKey} />
	}

	if (conv.type === beapi.messenger.Conversation.Type.MultiMemberType) {
		return <MultiMemberAvatar size={size} style={style} publicKey={publicKey} />
	}

	return <ContactAvatar size={size} publicKey={conv?.contactPublicKey} />
}
