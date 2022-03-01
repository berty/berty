import React from 'react'
import QRCode from 'react-native-qrcode-svg'
import { Share, TouchableOpacity, View, Text, StatusBar } from 'react-native'
import { Icon, Layout } from '@ui-kitten/components'

import beapi from '@berty-tech/api'
import { ScreenFC } from '@berty-tech/navigation'
import { useStylesBertyId, useThemeColor } from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'
import { useAccount, useConversation } from '@berty-tech/react-redux'

import { MultiMemberAvatar } from '../avatars'
import logo from '../main/1_berty_picto.png'

const styleBertyIdOptions = {
	iconIdSize: 30,
	iconShareSize: 26,
	titleSize: 25,
	contentScaleFactor: 0.66,
	avatarSize: 80,
}

export const SelectedContent: React.FC<{ conv: beapi.messenger.IConversation }> = ({ conv }) => {
	const [{ padding, margin, border, column, text }] = useStyles()
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

const BertyIdShare: React.FC = () => {
	const [{ row, border, flex }] = useStyles()
	const colors = useThemeColor()
	const { styleBertyIdButton, iconShareSize } = useStylesBertyId(styleBertyIdOptions)
	const account = useAccount()
	const url = account.link
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
					await Share.share({ url, message: url })
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
