import React from 'react'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Icon } from '@ui-kitten/components'

import beapi from '@berty/api'
import { useMessengerClient, useThemeColor, pbDateToNum } from '@berty/store'
import { useNavigation } from '@berty/navigation'
import { useStyles } from '@berty/contexts/styles'
import { usePlaySound } from '@berty/hooks'
import { ContactAvatar } from '@berty/components/avatars'
import FromNow from '@berty/components/shared-components/FromNow'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

import { UnreadCount } from './UnreadCount'

const useStylesContactRequest: any = () => {
	const { border, padding, margin, width, height, row, flex } = useStyles()
	const colors = useThemeColor()

	return {
		contactReqContainer: [
			border.radius.medium,
			border.shadow.medium,
			flex.align.center,
			flex.justify.end,
			height(180),
			margin.medium,
			margin.top.huge,
			margin.bottom.medium,
			padding.horizontal.small,
			padding.top.scale(33),
			padding.bottom.medium,
			width(121),
			{ backgroundColor: colors['main-background'], shadowColor: colors.shadow },
		],
		declineButton: [
			border.medium,
			border.medium,
			border.radius.tiny,
			border.shadow.tiny,
			flex.align.center,
			height(25),
			padding.tiny,
			{
				flexShrink: 2,
				flexGrow: 0,
				backgroundColor: colors['main-background'],
				borderColor: colors['negative-asset'],
				shadowColor: colors.shadow,
			},
		],
		acceptButton: [
			border.radius.tiny,
			border.shadow.tiny,
			flex.align.center,
			height(25),
			padding.horizontal.tiny,
			flex.justify.center,
			{
				flexWrap: 'wrap',
				backgroundColor: colors['positive-asset'],
				shadowColor: colors.shadow,
			},
		],
		buttonsWrapper: [
			flex.align.center,
			flex.direction.row,
			flex.justify.spaceAround,
			margin.top.scale(3),
			row.item.bottom,
			{
				flexGrow: 0,
				flexShrink: 2,
				width: '100%',
				minHeight: 0,
			},
		],
	}
}

const ContactRequest: React.FC<beapi.messenger.IContact> = ({
	displayName,
	publicKey,
	conversationPublicKey,
	createdDate: createdDateStr,
}) => {
	const playSound = usePlaySound()
	const client = useMessengerClient()
	const decline: any = () => {} // Messenger.useDiscardContactRequest()
	const { navigate } = useNavigation()
	const { contactReqContainer, declineButton, acceptButton, buttonsWrapper } =
		useStylesContactRequest()
	const { t }: any = useTranslation()

	const id = publicKey
	const { border, padding, row, absolute, text } = useStyles()
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	const createdDate = pbDateToNum(createdDateStr) || Date.now()
	return (
		<TouchableOpacity
			style={contactReqContainer}
			onPress={() => {
				if (conversationPublicKey) {
					navigate({
						name: 'Chat.OneToOne',
						params: {
							convId: conversationPublicKey,
						},
					})
				}
			}}
		>
			<View style={[absolute.center, border.shadow.medium, absolute.scale({ top: -27.5 })]}>
				<ContactAvatar publicKey={publicKey} size={54} />
			</View>
			<View
				style={{
					flexGrow: 2,
					justifyContent: 'center',
					flexShrink: 1,
					flexBasis: 45,
					minHeight: 0,
				}}
			>
				<UnifiedText style={[text.align.center, text.light, text.size.scale(14)]} numberOfLines={2}>
					{displayName || ''}
				</UnifiedText>
			</View>
			<View
				style={{
					flexGrow: 1,
					flexShrink: 1,
					justifyContent: 'flex-end',
					alignSelf: 'center',
					minHeight: 0,
				}}
			>
				<UnifiedText
					style={[
						text.size.tiny,
						text.align.center,
						{
							lineHeight: (text.size.tiny as any).fontSize * 1.6,
							color: colors['secondary-text'],
						},
					]}
				>
					{t('main.home.requests.card-title')}
				</UnifiedText>
				<UnifiedText
					style={[
						text.size.tiny,
						text.align.center,
						{
							lineHeight: (text.size.tiny as any).fontSize * 2,
							color: colors['secondary-text'],
						},
					]}
				>
					<FromNow date={createdDate} />
				</UnifiedText>
			</View>
			<View style={buttonsWrapper}>
				<TouchableOpacity
					style={declineButton}
					onPress={(): void => {
						decline({ id })
					}}
				>
					<Icon
						name='close-outline'
						fill={colors['secondary-text']}
						width={17 * scaleSize}
						height={17 * scaleSize}
						style={[padding.tiny, row.item.justify]}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					style={acceptButton}
					onPress={() =>
						client
							?.contactAccept({ publicKey })
							.then(() => {
								playSound('contactRequestAccepted')
							})
							.catch((err: any) => console.warn('Failed to accept contact request:', err))
					}
				>
					<Icon
						name='checkmark-outline'
						fill={colors['background-header']}
						width={17 * scaleSize}
						height={17 * scaleSize}
					/>
					<UnifiedText
						style={[
							text.size.tiny,
							padding.horizontal.tiny,
							{ color: colors['background-header'] },
						]}
					>
						{t('main.home.requests.accept')}
					</UnifiedText>
				</TouchableOpacity>
			</View>
		</TouchableOpacity>
	)
}

export const IncomingRequests: React.FC<any> = ({ items, onLayout }) => {
	const { padding, text, row } = useStyles()
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	const { t }: any = useTranslation()

	return items?.length ? (
		<View
			onLayout={onLayout}
			style={[padding.top.medium, { backgroundColor: colors['background-header'] }]}
		>
			<View>
				<View style={[row.left]}>
					<UnifiedText
						style={[
							text.size.huge,
							text.bold,
							padding.horizontal.medium,
							padding.bottom.small,
							{ color: colors['reverted-main-text'] },
						]}
					>
						{t('main.home.requests.title')}
					</UnifiedText>
					<View style={{ position: 'relative', top: -2 * scaleSize, left: -(23 * scaleSize) }}>
						<UnreadCount value={items.length} />
					</View>
				</View>
				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					{items.map((c: any) => {
						return <ContactRequest key={c.publicKey} {...c} />
					})}
				</ScrollView>
			</View>
		</View>
	) : null
}
