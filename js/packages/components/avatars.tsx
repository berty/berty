import React from 'react'
import { Image, View, ViewStyle, Text, TouchableOpacity } from 'react-native'
import palette from 'google-palette'
import { SHA3 } from 'sha3'
import { Buffer } from 'buffer'
import { withBadge } from 'react-native-elements'

import { useStyles } from '@berty-tech/styles'
import {
	useAccount,
	useContact,
	useMember,
	useConversation,
	Maybe,
	useMsgrContext,
	useThemeColor,
} from '@berty-tech/store/hooks'
import { navigate } from '@berty-tech/navigation'
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
	pressable?: boolean
}> = ({ cid, size, colorSeed, style, isEditable = false, nameSeed, pressable }) => {
	const [{ border }] = useStyles()
	const colors = useThemeColor()

	const padding = Math.round(size / 28)
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
					pressable={pressable}
				/>
				{isEditable ? (
					<View
						style={[
							{
								width: innerSize,
								height: innerSize,
								position: 'absolute',
								backgroundColor: colors['positive-asset'],
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
								backgroundColor: colors['positive-asset'],
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
					border.shadow.medium,
					style,
					{
						borderRadius: size / 2,
						width: size,
						height: size,
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: colors['main-background'],
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
	pressable?: boolean
}> = ({ size, style, name, pressable }) => {
	const [{ border }] = useStyles()
	const colors = useThemeColor()

	let avatar = hardcodedAvatars[name]
	if (!avatar) {
		avatar = Logo
	}

	return (
		<TouchableOpacity
			activeOpacity={0.9}
			disabled={!pressable}
			onPress={() => {
				navigate('ImageView', { images: [avatar], previewOnly: true })
			}}
			style={[
				{ borderRadius: size / 2, backgroundColor: colors['main-background'] },
				border.shadow.medium,
				style,
			]}
		>
			<Image
				source={avatar}
				style={{
					width: size,
					height: size,
					borderRadius: size / 2,
				}}
			/>
		</TouchableOpacity>
	)
}

export const AccountAvatar: React.FC<{
	size: number
	style?: AvatarStyle
	isEditable?: boolean
}> = ({ size, style, isEditable }) => {
	const account = useAccount()
	const colors = useThemeColor()
	return (
		<GenericAvatar
			nameSeed={account?.displayName}
			cid={account?.avatarCid}
			size={size}
			colorSeed={colors['main-text']}
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
	const colors = useThemeColor()

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
			<Text
				style={{
					color: colors['reverted-main-text'],
					fontSize: size * 0.5,
					includeFontPadding: false,
				}}
			>
				{(nameSeed || '?')[0].toUpperCase()}
			</Text>
		</View>
	)
}

export const ContactAvatar: React.FC<{
	publicKey: Maybe<string>
	size: number
	style?: AvatarStyle
	fallbackNameSeed?: Maybe<string>
	pressable?: boolean
}> = ({ publicKey, size, style, fallbackNameSeed, pressable }) => {
	const contact = useContact(publicKey)
	const ctx = useMsgrContext()
	const suggestion = Object.values(ctx.persistentOptions?.suggestions).find(v => v.pk === publicKey)
	if (suggestion) {
		return (
			<HardcodedAvatar
				size={size}
				style={style}
				name={suggestion.icon as any}
				pressable={pressable}
			/>
		)
	}
	return (
		<GenericAvatar
			nameSeed={contact?.displayName || fallbackNameSeed}
			cid={contact?.avatarCid}
			size={size}
			colorSeed={publicKey}
			style={style}
			pressable={pressable}
		/>
	)
}

export const MemberAvatar: React.FC<{
	publicKey: Maybe<string>
	conversationPublicKey: Maybe<string>
	size: number
	pressable?: boolean
}> = ({ publicKey, conversationPublicKey, size, pressable }) => {
	const member = useMember({ publicKey, conversationPublicKey })

	return (
		<GenericAvatar
			cid={member?.avatarCid}
			size={size}
			colorSeed={publicKey}
			nameSeed={member?.displayName}
			pressable={pressable}
		/>
	)
}

export const MultiMemberAvatar: React.FC<{
	size: number
	style?: AvatarStyle
	publicKey?: Maybe<string>
	fallbackNameSeed?: Maybe<string>
	pressable?: boolean
}> = ({ size, style, publicKey, fallbackNameSeed, pressable }) => {
	const ctx = useMsgrContext()
	const conv = useConversation(publicKey)
	const suggestion = Object.values(ctx.persistentOptions?.suggestions).find(v => v.pk === publicKey)
	let content: React.ReactElement
	if (suggestion) {
		content = (
			<HardcodedAvatar
				size={size}
				style={style}
				name={suggestion.icon as any}
				pressable={pressable}
			/>
		)
	} else {
		content = (
			<GenericAvatar
				size={size}
				style={style}
				cid={conv?.avatarCid}
				colorSeed={publicKey}
				nameSeed={conv?.displayName || fallbackNameSeed}
				pressable={pressable}
			/>
		)
	}
	const badgeSize = size / 3
	class GroupBadge extends React.Component {
		render = () => <HardcodedAvatar size={badgeSize} name={'group'} />
	}
	const Avatar = () => content
	const WrappedAvatar = withBadge('', { Component: GroupBadge })(Avatar)
	return <WrappedAvatar />
}

export const ConversationAvatar: React.FC<{
	publicKey: Maybe<string>
	size: number
	style?: AvatarStyle
}> = ({ publicKey, size, style }) => {
	const conv = useConversation(publicKey)
	const ctx = useMsgrContext()

	if (conv) {
		if (conv.type === beapi.messenger.Conversation.Type.MultiMemberType) {
			return <MultiMemberAvatar size={size} style={style} publicKey={publicKey} />
		} else if (conv.type === beapi.messenger.Conversation.Type.ContactType) {
			return <ContactAvatar size={size} publicKey={conv?.contactPublicKey} />
		}
	}

	const suggestion = Object.values(ctx.persistentOptions?.suggestions).find(v => v.pk === publicKey)
	if (suggestion) {
		return <HardcodedAvatar size={size} style={style} name={suggestion.icon as any} />
	}

	return <GenericAvatar size={size} style={style} cid='' colorSeed={publicKey} nameSeed={'C'} />
}
