import React from 'react'
import { Image, View, ViewStyle, Text } from 'react-native'
import palette from 'google-palette'
import { SHA3 } from 'sha3'
import { Buffer } from 'buffer'

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

const pal = palette('tol-rainbow', 256)

export const GenericAvatar: React.FC<{
	cid: Maybe<string>
	colorSeed: Maybe<string>
	size: number
	style?: AvatarStyle
	isEditable?: boolean
	nameSeed: Maybe<string>
}> = ({ cid, size, colorSeed, style, isEditable = false, nameSeed }) => {
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
				<NameAvatar size={size} style={style} colorSeed={colorSeed} nameSeed={nameSeed} />
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
			nameSeed={account?.displayName}
			cid={account?.avatarCid}
			size={size}
			colorSeed={account?.publicKey}
			style={style}
			isEditable={isEditable}
		/>
	)
}

export const NameAvatar: React.FC<{
	colorSeed: Maybe<string>
	size: number
	style?: AvatarStyle
	nameSeed: Maybe<string>
}> = ({ colorSeed, size, style, nameSeed }) => {
	const h = new SHA3(256).update(Buffer.from(colorSeed || '', 'base64')).digest()
	const color = '#' + pal[h[0]]
	return (
		<View
			style={[
				style,
				{
					width: size,
					height: size,
					backgroundColor: color,
					borderRadius: size / 2,
					alignItems: 'center',
					justifyContent: 'center',
				},
			]}
		>
			<Text style={{ color: 'white', fontSize: size * 0.5, includeFontPadding: false }}>
				{(nameSeed || '?')[0].toUpperCase()}
			</Text>
		</View>
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
	if (contact?.displayName) {
		return (
			<NameAvatar
				colorSeed={contact?.publicKey}
				style={style}
				nameSeed={contact?.displayName}
				size={size}
			/>
		)
	}
	return (
		<GenericAvatar
			nameSeed={contact?.displayName}
			cid={contact?.avatarCid}
			size={size}
			colorSeed={contact?.publicKey}
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
	return (
		<GenericAvatar
			cid={member?.avatarCid}
			size={size}
			colorSeed={member?.publicKey}
			nameSeed={member?.displayName}
		/>
	)
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
		return <GenericAvatar size={size} style={style} cid='' colorSeed={publicKey} nameSeed={'G'} />
	}

	if (conv.type === beapi.messenger.Conversation.Type.MultiMemberType) {
		return <MultiMemberAvatar size={size} style={style} publicKey={publicKey} />
	}

	return <ContactAvatar size={size} publicKey={conv?.contactPublicKey} />
}
