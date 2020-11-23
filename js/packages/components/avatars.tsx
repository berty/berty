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
	usePersistentOptions,
} from '@berty-tech/store/hooks'
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
}> = ({ cid, size, fallbackSeed, style }) => {
	const [{ border, background }] = useStyles()
	const padding = Math.round(size / 15)
	let innerSize = Math.round(size - 2 * padding)
	let content: JSX.Element
	if (cid) {
		if (innerSize % 2) {
			innerSize--
		}
		content = (
			<AttachmentImage
				cid={cid}
				style={{ width: innerSize, height: innerSize, borderRadius: innerSize / 2 }}
			/>
		)
	} else {
		let iconSize = Math.round(innerSize - innerSize / 10) // adjust for jdenticon bug
		if (iconSize % 2) {
			iconSize--
		}
		content = <Jdenticon value={fallbackSeed} size={iconSize} style={{}} />
	}
	return (
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
	)
}

const BetabotAvatar: React.FC<{ size: number; style?: AvatarStyle }> = ({ size, style }) => {
	const [{ border, flex, background }] = useStyles()

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
			<Logo width={size - 15} height={size - 15} style={{ right: -1, top: -1 }} />
		</View>
	)
}

export const AccountAvatar: React.FC<{ size: number; style?: AvatarStyle }> = ({ size, style }) => {
	const account = useAccount()
	return (
		<GenericAvatar
			cid={account?.avatarCid}
			size={size}
			fallbackSeed={account?.publicKey}
			style={style}
		/>
	)
}

export const ContactAvatar: React.FC<{
	publicKey: Maybe<string>
	size: number
	style?: AvatarStyle
}> = ({ publicKey, size, style }) => {
	const contact = useContact(publicKey)
	const persistOpts = usePersistentOptions()

	if (
		persistOpts.betabot.convPk &&
		publicKey?.toString() === persistOpts.betabot.convPk.toString()
	) {
		return <BetabotAvatar size={size} style={style} />
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
