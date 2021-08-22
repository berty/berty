import React from 'react'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { CommonActions } from '@react-navigation/native'
import { Icon, Text } from '@ui-kitten/components'

import beapi from '@berty-tech/api'
import { useClient, useMsgrContext, useThemeColor } from '@berty-tech/store/hooks'
import { Routes, useNavigation } from '@berty-tech/navigation'
import { useStyles } from '@berty-tech/styles'

import { pbDateToNum } from '../../helpers'
import { ContactAvatar } from '../../avatars'
import FromNow from '../../shared-components/FromNow'
import { UnreadCount } from './UnreadCount'

const useStylesContactRequest: any = () => {
	const [{ border, padding, margin, width, height, row, flex }] = useStyles()
	const colors = useThemeColor()

	return {
		contactReqContainer: [
			border.radius.medium,
			border.shadow.medium,
			flex.align.center,
			flex.justify.flexEnd,
			height(180),
			margin.medium,
			margin.top.huge,
			margin.bottom.medium,
			padding.horizontal.small,
			padding.top.scale(33),
			padding.bottom.medium,
			width(121),
			{ backgroundColor: colors['main-background'] },
		],
		declineButton: [
			border.medium,
			border.medium,
			border.radius.tiny,
			border.shadow.tiny,
			flex.align.center,
			height(25),
			padding.tiny,
			{ flexShrink: 2, flexGrow: 0 },
			{ backgroundColor: colors['main-background'], borderColor: colors['negative-asset'] },
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
	const client = useClient()
	const decline: any = () => {} // Messenger.useDiscardContactRequest()
	const { dispatch } = useNavigation()
	const { contactReqContainer, declineButton, acceptButton, buttonsWrapper } =
		useStylesContactRequest()
	const ctx = useMsgrContext()
	const { t }: any = useTranslation()

	const id = publicKey
	const [{ border, padding, row, absolute, text }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const createdDate = pbDateToNum(createdDateStr) || Date.now()
	return (
		<TouchableOpacity
			style={contactReqContainer}
			onPress={() => {
				if (conversationPublicKey) {
					dispatch(
						CommonActions.navigate({
							name: Routes.Chat.OneToOne,
							params: {
								convId: conversationPublicKey,
							},
						}),
					)
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
				<Text
					style={[
						text.align.center,
						text.bold.small,
						text.size.scale(14),
						{ color: colors['main-text'] },
					]}
					numberOfLines={2}
				>
					{displayName || ''}
				</Text>
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
				<Text
					style={[
						text.size.scale(11),
						text.align.center,
						{
							lineHeight: (text.size.scale(11) as any).fontSize * 1.6,
							color: colors['secondary-text'],
						},
					]}
				>
					{t('main.home.requests.card-title')}
				</Text>
				<Text
					style={[
						text.size.scale(10),
						text.align.center,
						{
							lineHeight: (text.size.scale(11) as any).fontSize * 2,
							color: colors['secondary-text'],
						},
					]}
				>
					<FromNow date={createdDate} />
				</Text>
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
								ctx.playSound('contactRequestAccepted')
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
					<Text
						style={[
							text.size.scale(10),
							padding.horizontal.tiny,
							{ color: colors['background-header'] },
						]}
					>
						{t('main.home.requests.accept')}
					</Text>
				</TouchableOpacity>
			</View>
		</TouchableOpacity>
	)
}

export const IncomingRequests: React.FC<any> = ({ items, onLayout }) => {
	const [{ padding, text, row }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const { t }: any = useTranslation()
	return items?.length ? (
		<View
			onLayout={onLayout}
			style={[padding.top.scale(50), { backgroundColor: colors['background-header'] }]}
		>
			<View>
				<View style={[row.left]}>
					<Text
						style={[
							text.size.huge,
							text.bold.medium,
							padding.horizontal.medium,
							padding.bottom.small,
							{ color: colors['reverted-main-text'] },
						]}
					>
						{t('main.home.requests.title')}
					</Text>
					<View style={{ position: 'relative', top: -2, left: -(23 * scaleSize) }}>
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
