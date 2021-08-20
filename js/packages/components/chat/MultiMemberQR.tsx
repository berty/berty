import React from 'react'
import QRCode from 'react-native-qrcode-svg'
import { Share, TouchableOpacity, View, Text, StatusBar } from 'react-native'
import { Icon, Layout } from '@ui-kitten/components'
import { useNavigation } from '@react-navigation/native'

import { ScreenProps } from '@berty-tech/navigation'
import { useAccount, useConversation, useThemeColor } from '@berty-tech/store/hooks'
import { useStyles } from '@berty-tech/styles'

import { MultiMemberAvatar } from '../avatars'
import logo from '../main/1_berty_picto.png'

const _contentScaleFactor = 0.66

const useStylesMultiMemberQr = () => {
	const _iconIdSize = 30
	const _iconShareSize = 26
	const _titleSize = 25
	const requestAvatarSize = 80

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
				{ backgroundColor: colors['main-background'], top: windowHeight / 10 },
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
				{ backgroundColor: colors['positive-asset'], top: 45 },
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
	const [{ padding }, { scaleSize }] = useStyles()
	const colors = useThemeColor()

	return (
		<View
			style={[
				padding.medium,
				{
					paddingTop: 16 * scaleSize,
					flexGrow: 2,
					flexBasis: '100%',
					backgroundColor: colors['background-header'],
				},
			]}
		>
			<SelectedContent conv={conv} />
			<BertyIdShare />
		</View>
	)
}

export const MultiMemberQR: React.FC<ScreenProps.Chat.MultiMemberQR> = ({
	route: {
		params: { convId },
	},
}) => {
	const colors = useThemeColor()
	const conv = useConversation(convId)
	const { iconIdSize } = useStylesMultiMemberQr()
	const navigation = useNavigation()

	React.useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<Icon
					name='users'
					pack='custom'
					width={iconIdSize}
					height={iconIdSize}
					fill={colors['reverted-main-text']}
				/>
			),
		})
	})
	if (!conv) {
		return null
	}
	return (
		<Layout style={[{ backgroundColor: 'transparent', flex: 1 }]}>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
			<MultiMemberComponent conv={conv} />
		</Layout>
	)
}
