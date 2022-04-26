import React from 'react'
import QRCode from 'react-native-qrcode-svg'
import { Share, TouchableOpacity, View, StatusBar, Platform } from 'react-native'
import { Icon, Layout } from '@ui-kitten/components'
import Clipboard from '@react-native-clipboard/clipboard'

import beapi from '@berty/api'
import { ScreenFC } from '@berty/navigation'
import { useStylesBertyId, useThemeColor } from '@berty/store'
import { useStyles } from '@berty/contexts/styles'
import { useConversation } from '@berty/hooks'
import { MultiMemberAvatar } from '@berty/components/avatars'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import logo from '@berty/assets/images/1_berty_picto.png'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

const styleBertyIdOptions = {
	iconIdSize: 30,
	iconShareSize: 26,
	titleSize: 25,
	contentScaleFactor: 0.66,
	avatarSize: 80,
}

const SelectedContent: React.FC<{ conv: beapi.messenger.IConversation }> = ({ conv }) => {
	const { padding, margin, border, column, text } = useStyles()
	const { qrCodeSize, requestAvatarSize, styleBertyIdContent } =
		useStylesBertyId(styleBertyIdOptions)

	const colors = useThemeColor()

	return (
		<View
			style={[
				border.radius.scale(30),
				margin.horizontal.medium,
				padding.top.large,
				{ backgroundColor: colors['main-background'], top: 70 },
				styleBertyIdContent,
			]}
		>
			<View style={[{ top: -70 }]}>
				<View
					style={[
						border.shadow.big,
						{
							justifyContent: 'center',
							alignItems: 'center',
							marginBottom: 20,
							shadowColor: colors.shadow,
						},
					]}
				>
					<MultiMemberAvatar publicKey={conv?.publicKey} size={requestAvatarSize} />
				</View>
				<UnifiedText style={[text.light, text.align.center, text.size.large]}>
					{conv?.displayName}
				</UnifiedText>
			</View>
			<View style={[padding.horizontal.big, { top: -30 }]}>
				<View style={[column.item.center]}>
					{!!conv.link && (
						<QRCode
							size={qrCodeSize}
							value={conv.link}
							logo={logo}
							mode='circle'
							color={colors['background-header']}
							backgroundColor={colors['main-background']}
						/>
					)}
				</View>
			</View>
		</View>
	)
}

const BertyIdShare: React.FC<{ url?: string | null }> = ({ url }) => {
	const { row, border, flex } = useStyles()
	const colors = useThemeColor()
	const { styleBertyIdButton, iconShareSize } = useStylesBertyId(styleBertyIdOptions)
	if (!url) {
		return null
	}
	return (
		<TouchableOpacity
			style={[
				row.item.bottom,
				border.shadow.medium,
				{ backgroundColor: colors['positive-asset'], top: 45, shadowColor: colors.shadow },
				styleBertyIdButton,
			]}
			onPress={async () => {
				try {
					console.log('sharing', url)
					if (Platform.OS === 'web') {
						Clipboard.setString(url)
					} else {
						await Share.share({ url, message: url })
					}
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

const MultiMemberComponent: React.FC<{ conv: beapi.messenger.IConversation }> = ({ conv }) => {
	const { padding } = useStyles()
	const { scaleSize } = useAppDimensions()
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
			<BertyIdShare url={conv.link} />
		</View>
	)
}

export const MultiMemberQR: ScreenFC<'Chat.MultiMemberQR'> = ({
	route: {
		params: { convId },
	},
	navigation,
}) => {
	const colors = useThemeColor()
	const conv = useConversation(convId)
	const { iconIdSize } = useStylesBertyId(styleBertyIdOptions)

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
