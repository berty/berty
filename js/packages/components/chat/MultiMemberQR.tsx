import React from 'react'
import QRCode from 'react-native-qrcode-svg'
import { ScrollView, Share, TouchableOpacity, View, Text, StatusBar } from 'react-native'
import { Icon, Layout } from '@ui-kitten/components'
import { SafeAreaConsumer } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import { useAccount, useConversation, useThemeColor } from '@berty-tech/store/hooks'
import { useStyles } from '@berty-tech/styles'

import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'
import { MultiMemberAvatar } from '../avatars'
import logo from '../main/1_berty_picto.png'

const _contentScaleFactor = 0.66

const useStylesMultiMemberQr = () => {
	const _iconIdSize = 40
	const _iconShareSize = 26
	const _titleSize = 26
	const requestAvatarSize = 100

	const [, { fontScale, scaleSize }] = useStyles()
	const _bertyIdButtonSize = 60 * scaleSize
	return {
		iconShareSize: _iconShareSize * scaleSize,
		iconIdSize: _iconIdSize * scaleSize,
		titleSize: _titleSize * fontScale,
		requestAvatarSize,
		styleBertyIdButton: {
			width: _bertyIdButtonSize,
			height: _bertyIdButtonSize,
			borderRadius: _bertyIdButtonSize / 2,
			marginRight: _bertyIdButtonSize,
			bottom: _bertyIdButtonSize / 2,
		},
		styleBertyIdContent: { paddingBottom: _bertyIdButtonSize / 2 + 10 },
	}
}

export const SelectedContent: React.FC<{ conv: any }> = ({ conv }) => {
	const [{ padding, margin, border, column, text }, { windowHeight, windowWidth }] = useStyles()
	const colors = useThemeColor()
	const { styleBertyIdContent, requestAvatarSize } = useStylesMultiMemberQr()

	return (
		<View
			style={[
				border.radius.scale(30),
				margin.horizontal.medium,
				padding.top.large,
				{ backgroundColor: colors['main-background'] },
				styleBertyIdContent,
			]}
		>
			<View style={[{ top: -70 }]}>
				<View
					style={[
						{ justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
						border.shadow.big,
					]}
				>
					<MultiMemberAvatar publicKey={conv?.publicKey} size={requestAvatarSize} />
				</View>
				<Text
					style={[
						{ fontFamily: 'Open Sans', color: colors['main-text'] },
						text.bold.small,
						text.align.center,
						text.size.large,
					]}
				>
					{conv?.displayName}
				</Text>
			</View>
			<View style={[padding.horizontal.big, { top: -30 }]}>
				<View style={[column.item.center]}>
					<QRCode
						size={_contentScaleFactor * Math.min(windowHeight, windowWidth)}
						value={conv.link}
						logo={logo}
						mode='circle'
						color={colors['background-header']}
					/>
				</View>
			</View>
		</View>
	)
}

const BertyIdShare: React.FC<{}> = () => {
	const [{ row, border, flex }] = useStyles()
	const colors = useThemeColor()
	const { styleBertyIdButton, iconShareSize } = useStylesMultiMemberQr()
	const account = useAccount()
	const url = account?.link
	if (!url) {
		return null
	}
	return (
		<TouchableOpacity
			style={[
				row.item.bottom,
				border.shadow.medium,
				{ backgroundColor: colors['positive-asset'] },
				styleBertyIdButton,
			]}
			onPress={async () => {
				try {
					console.log('sharing', url)
					await Share.share({ url })
				} catch (e) {
					console.error(e)
				}
			}}
		>
			<View style={[flex.tiny, { justifyContent: 'center' }]}>
				<Icon
					style={row.item.justify}
					name='share'
					pack='custom'
					width={iconShareSize}
					height={iconShareSize}
					fill={colors['background-header']}
				/>
			</View>
		</TouchableOpacity>
	)
}

const MultiMemberComponent: React.FC<{ conv: any }> = ({ conv }) => {
	const { goBack } = useNavigation()
	const [{ padding, margin, flex }, { windowHeight, scaleSize }] = useStyles()
	const colors = useThemeColor()
	const { titleSize, iconIdSize } = useStylesMultiMemberQr()
	const { t } = useTranslation()

	return (
		<SafeAreaConsumer>
			{(insets) => {
				return (
					<ScrollView
						bounces={false}
						style={[
							padding.medium,
							{
								paddingTop: scaleSize * ((insets?.top || 0) + 16),
								flexGrow: 2,
								flexBasis: '100%',
								backgroundColor: colors['background-header'],
							},
						]}
					>
						<View
							style={[
								flex.direction.row,
								flex.align.center,
								flex.justify.spaceBetween,
								{ marginBottom: windowHeight * 0.1 },
							]}
						>
							<View style={[flex.direction.row, flex.align.center]}>
								<TouchableOpacity
									onPress={goBack}
									style={{ alignItems: 'center', justifyContent: 'center' }}
								>
									<Icon
										name='arrow-down-outline'
										width={30}
										height={30}
										fill={colors['reverted-main-text']}
									/>
								</TouchableOpacity>
								<Text
									style={[
										margin.left.scale(10),
										{
											fontWeight: '700',
											fontSize: titleSize,
											lineHeight: 1.25 * titleSize,
											color: colors['reverted-main-text'],
										},
									]}
								>
									{t('chat.multi-member-qr.title')}
								</Text>
							</View>
							<Icon
								name='users'
								pack='custom'
								width={iconIdSize}
								height={iconIdSize}
								fill={colors['reverted-main-text']}
							/>
						</View>
						<SelectedContent conv={conv} />
						<BertyIdShare />
					</ScrollView>
				)
			}}
		</SafeAreaConsumer>
	)
}

export const MultiMemberQR: React.FC<ScreenProps.Chat.MultiMemberQR> = ({
	route: {
		params: { convId },
	},
}) => {
	const colors = useThemeColor()
	const conv = useConversation(convId)
	if (!conv) {
		return null
	}
	return (
		<Layout style={[{ backgroundColor: 'transparent', flex: 1 }]}>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
			<SwipeNavRecognizer>
				<MultiMemberComponent conv={conv} />
			</SwipeNavRecognizer>
		</Layout>
	)
}
