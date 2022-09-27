import palette from 'google-palette'
import React from 'react'
import { Image, View, ViewStyle } from 'react-native'
import { useSelector } from 'react-redux'
import { SHA3 } from 'sha3'

import beapi from '@berty/api'
import GroupAvatar from '@berty/assets/images/Avatar_Group_Copy_19.png'
import OrangeBotAvatar from '@berty/assets/images/berty_bot_orange_bg.png'
import PinkBotAvatar from '@berty/assets/images/berty_bot_pink_bg.png'
import BlueDevAvatar from '@berty/assets/images/berty_dev_blue_bg.png'
import GreenDevAvatar from '@berty/assets/images/berty_dev_green_bg.png'
import Logo from '@berty/assets/logo/1_berty_picto.svg'
import { useAccount, useContact, useConversation, useMember, useThemeColor } from '@berty/hooks'
import { selectPersistentOptions } from '@berty/redux/reducers/persistentOptions.reducer'
import { Maybe } from '@berty/utils/type/maybe'

import { UnifiedText } from './shared-components/UnifiedText'

type AvatarStyle = Omit<
	ViewStyle,
	'borderRadius' | 'width' | 'height' | 'alignItems' | 'justifyContent'
>

const pal = palette('tol-rainbow', 256)

export const GenericAvatar: React.FC<{
	colorSeed: Maybe<string>
	size: number
	style?: AvatarStyle
	nameSeed: Maybe<string>
}> = React.memo(({ size, colorSeed, style, nameSeed }) => {
	const colors = useThemeColor()

	return (
		<View style={{ zIndex: -1 }}>
			<View
				style={[
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
				<View style={{ justifyContent: 'center', alignItems: 'center' }}>
					<NameAvatar size={size} style={style} colorSeed={colorSeed} nameSeed={nameSeed} />
				</View>
			</View>
		</View>
	)
})

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
}> = React.memo(({ size, style, name }) => {
	const colors = useThemeColor()

	let avatar = hardcodedAvatars[name]
	if (!avatar) {
		avatar = Logo
	}

	return (
		<View
			style={[
				style,
				{
					borderRadius: size / 2,
					backgroundColor: colors['main-background'],
				},
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
		</View>
	)
})

export const AccountAvatar: React.FC<{
	size: number
	style?: AvatarStyle
}> = React.memo(({ size, style }) => {
	const account = useAccount()
	const colors = useThemeColor()
	return (
		<GenericAvatar
			nameSeed={account.displayName}
			size={size}
			colorSeed={colors['main-text']}
			style={style}
		/>
	)
})

const NameAvatar: React.FC<{
	colorSeed: Maybe<string>
	size: number
	style?: AvatarStyle
	nameSeed: Maybe<string>
}> = React.memo(({ colorSeed, size, style, nameSeed }) => {
	const colors = useThemeColor()

	const h = new SHA3(256).update(colorSeed || '').digest()
	const color = '#' + pal[h[0]]

	const codePoint = (nameSeed || '?').codePointAt(0)
	const char = codePoint ? String.fromCodePoint(codePoint) : '?'

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
			<UnifiedText
				style={{
					color: colors['reverted-main-text'],
					fontSize: size * 0.5,
					includeFontPadding: false,
				}}
			>
				{char}
			</UnifiedText>
		</View>
	)
})

export const ContactAvatar: React.FC<{
	publicKey: Maybe<string>
	size: number
	style?: AvatarStyle
	fallbackNameSeed?: Maybe<string>
}> = React.memo(({ publicKey, size, style, fallbackNameSeed }) => {
	const contact = useContact(publicKey)
	const persistentOptions = useSelector(selectPersistentOptions)

	// NOTE: Suggestions are disabled
	const suggestion = Object.values(persistentOptions?.suggestions).find(v => v.pk === publicKey)
	if (suggestion) {
		return <HardcodedAvatar size={size} style={style} name={suggestion.icon} />
	}
	return (
		<GenericAvatar
			nameSeed={contact?.displayName || fallbackNameSeed}
			size={size}
			colorSeed={publicKey}
			style={style}
		/>
	)
})

export const MemberAvatar: React.FC<{
	publicKey: Maybe<string>
	conversationPublicKey: Maybe<string>
	size: number
}> = React.memo(({ publicKey, conversationPublicKey, size }) => {
	const member = useMember(conversationPublicKey, publicKey)

	return <GenericAvatar size={size} colorSeed={publicKey} nameSeed={member?.displayName} />
})

export const MultiMemberAvatar: React.FC<{
	size: number
	style?: AvatarStyle
	publicKey?: Maybe<string>
	fallbackNameSeed?: Maybe<string>
}> = React.memo(({ size, style, publicKey, fallbackNameSeed }) => {
	const persistentOptions = useSelector(selectPersistentOptions)
	const conv = useConversation(publicKey)
	// this useMemo prevents flickering
	return React.useMemo(() => {
		let content: React.ReactElement

		// NOTE: Suggestions are disabled
		const suggestion = Object.values(persistentOptions?.suggestions).find(v => v.pk === publicKey)
		if (suggestion) {
			content = <HardcodedAvatar size={size} style={style} name={suggestion.icon} />
		} else {
			content = (
				<GenericAvatar
					size={size}
					style={style}
					colorSeed={publicKey}
					nameSeed={conv?.displayName || fallbackNameSeed}
				/>
			)
		}

		// TODO: diff a OneToOne conversation icon and a MultiMember conversation icon
		const Avatar = () => content
		return <Avatar />
	}, [conv?.displayName, fallbackNameSeed, persistentOptions?.suggestions, publicKey, size, style])
})

export const ConversationAvatar: React.FC<{
	publicKey: Maybe<string>
	size: number
	style?: AvatarStyle
}> = React.memo(({ publicKey, size, style }) => {
	const conv = useConversation(publicKey)
	const persistentOptions = useSelector(selectPersistentOptions)

	if (conv) {
		if (conv.type === beapi.messenger.Conversation.Type.MultiMemberType) {
			return <MultiMemberAvatar size={size} style={style} publicKey={publicKey} />
		} else if (conv.type === beapi.messenger.Conversation.Type.ContactType) {
			return <ContactAvatar size={size} publicKey={conv?.contactPublicKey} />
		}
	}

	// NOTE: Suggestions are disabled
	const suggestion = Object.values(persistentOptions?.suggestions).find(v => v.pk === publicKey)
	if (suggestion) {
		return <HardcodedAvatar size={size} style={style} name={suggestion.icon} />
	}

	return <GenericAvatar size={size} style={style} colorSeed={publicKey} nameSeed={'C'} />
})
