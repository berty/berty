import React from 'react'
import QRCode from 'react-native-qrcode-svg'
import { ScrollView, Share, TouchableOpacity, View, Text } from 'react-native'
import { Icon, Layout } from '@ui-kitten/components'
import { SafeAreaConsumer } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import { useAccount, useConversation } from '@berty-tech/store/hooks'
import { useStyles } from '@berty-tech/styles'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'
import { ProceduralCircleAvatar } from '@berty-tech/components/shared-components'

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
	const [
		{ padding, margin, border, background, column, text },
		{ windowHeight, windowWidth },
	] = useStyles()
	const { styleBertyIdContent, requestAvatarSize } = useStylesMultiMemberQr()

	return (
		<View
			style={[
				background.white,
				border.radius.scale(30),
				margin.horizontal.medium,
				padding.top.large,
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
					<ProceduralCircleAvatar
						{...conv}
						seed={conv?.publicKey}
						size={requestAvatarSize}
						diffSize={30}
					/>
				</View>
				<Text
					style={[
						{ fontFamily: 'Open Sans' },
						text.color.black,
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
					/>
				</View>
			</View>
		</View>
	)
}

const BertyIdShare: React.FC<{}> = () => {
	const [{ row, border, background, flex, color }] = useStyles()
	const { styleBertyIdButton, iconShareSize } = useStylesMultiMemberQr()
	const account = useAccount()
	const url = account?.link
	if (!url) {
		return null
	}
	return (
		<TouchableOpacity
			style={[row.item.bottom, background.light.blue, border.shadow.medium, styleBertyIdButton]}
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
					fill={color.blue}
				/>
			</View>
		</TouchableOpacity>
	)
}

const MultiMemberComponent: React.FC<{ conv: any }> = ({ conv }) => {
	const { goBack } = useNavigation()
	const [{ padding, color, margin, background, flex }, { windowHeight, scaleSize }] = useStyles()
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
							background.blue,
							{
								paddingTop: scaleSize * ((insets?.top || 0) + 16),
								flexGrow: 2,
								flexBasis: '100%',
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
									<Icon name='arrow-down-outline' width={30} height={30} fill={color.white} />
								</TouchableOpacity>
								<Text
									style={[
										margin.left.scale(10),
										{
											fontWeight: '700',
											fontSize: titleSize,
											lineHeight: 1.25 * titleSize,
											color: color.white,
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
								fill={color.white}
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
	const conv = useConversation(convId)
	const { goBack } = useNavigation()
	if (!conv) {
		return null
	}
	return (
		<Layout style={[{ backgroundColor: 'transparent', flex: 1 }]}>
			<SwipeNavRecognizer
				onSwipeUp={() => goBack()}
				onSwipeDown={() => goBack()}
				onSwipeLeft={() => goBack()}
				onSwipeRight={() => goBack()}
			>
				<MultiMemberComponent conv={conv} />
			</SwipeNavRecognizer>
		</Layout>
	)
}
