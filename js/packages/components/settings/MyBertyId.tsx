import React, { useState } from 'react'
import { View, TouchableOpacity, StyleSheet, ScrollView, Share } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { TabBar } from '../shared-components/TabBar'
import { RequestAvatar } from '../shared-components/Request'
import { Messenger } from '@berty-tech/hooks'
import { useNavigation } from '@berty-tech/navigation'
import QRCode from 'react-native-qrcode-svg'
import { FingerprintContent } from '../shared-components/FingerprintContent'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDimensions } from '@react-native-community/hooks'
//
// Settings My Berty ID Vue
//

// Styles
const _bertyIdButtonSize = 60
const _bertyIdContentScaleFactor = 0.66
const _iconShareSize = 26
const _iconArrowBackSize = 30
const _iconIdSize = 45
const _titleSize = 26
const _requestAvatarSize = 90

const _bertyIdStyles = StyleSheet.create({
	bertyIdButton: {
		width: _bertyIdButtonSize,
		height: _bertyIdButtonSize,
		borderRadius: _bertyIdButtonSize / 2,
		marginRight: _bertyIdButtonSize,
		bottom: _bertyIdButtonSize / 2,
	},
	bertyIdContent: { paddingBottom: _bertyIdButtonSize / 2 + 10 },
})

const BertyIdContent: React.FC<{}> = ({ children }) => {
	const [{ column }] = useStyles()

	return (
		<View>
			<View style={[column.item.center]}>{children}</View>
		</View>
	)
}

const ContactRequestQR = () => {
	const client = Messenger.useClient()
	const [{ padding }] = useStyles()

	const { height, width } = useDimensions().window

	if (!client?.deepLink) {
		return <Text>Internal error</Text>
	}

	// I would like to use binary mode in QR but the scanner used seems to not support it, extended tests were done
	return (
		<View style={[padding.top.big]}>
			<QRCode size={_bertyIdContentScaleFactor * Math.min(height, width)} value={client.deepLink} />
		</View>
	)
}

const Fingerprint: React.FC = () => {
	const client = Messenger.useClient()
	const [{ padding }] = useStyles()

	const { height, width } = useDimensions().window

	if (!client) {
		return <Text>Client not initialized</Text>
	}
	return (
		<View
			style={[padding.top.big, { width: _bertyIdContentScaleFactor * Math.min(height, width) }]}
		>
			<FingerprintContent seed={client.accountPk} />
		</View>
	)
}

const SelectedContent: React.FC<{ contentName: string }> = ({ contentName }) => {
	switch (contentName) {
		case 'QR':
			return <ContactRequestQR />
		case 'Fingerprint':
			return <Fingerprint />
		default:
			return <Text>Error: Unknown content name "{contentName}"</Text>
	}
}

const BertIdBody: React.FC<{ user: any }> = ({ user }) => {
	const [{ background, border, margin, padding, opacity }] = useStyles()
	const [selectedContent, setSelectedContent] = useState('QR')
	const client = Messenger.useClient()

	return (
		<View
			style={[
				background.white,
				border.radius.scale(30),
				margin.horizontal.medium,
				padding.top.large,
				_bertyIdStyles.bertyIdContent,
			]}
		>
			<RequestAvatar {...user} seed={client?.accountPk} size={_requestAvatarSize} />
			<View style={[padding.horizontal.big]}>
				<TabBar
					tabs={[
						{ name: 'QR', icon: 'qr', iconPack: 'custom' },
						{ name: 'Fingerprint', icon: 'fingerprint', iconPack: 'custom' },
						{
							name: 'Devices',
							icon: 'smartphone',
							iconPack: 'feather',
							iconTransform: [{ rotate: '22.5deg' }, { scale: 0.8 }],
							buttonDisabled: true,
							style: opacity(0.3),
						},
					]}
					onTabChange={setSelectedContent}
				/>
				<BertyIdContent>
					<SelectedContent contentName={selectedContent} />
				</BertyIdContent>
			</View>
		</View>
	)
}

const BertyIdShare: React.FC<{}> = () => {
	const [{ row, border, background, flex, color }] = useStyles()
	const client = Messenger.useClient()
	const url = client?.deepLink
	if (!url) {
		return null
	}
	return (
		<TouchableOpacity
			style={[
				row.item.bottom,
				background.light.blue,
				border.shadow.medium,
				_bertyIdStyles.bertyIdButton,
			]}
			onPress={async () => {
				try {
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
					width={_iconShareSize}
					height={_iconShareSize}
					fill={color.blue}
				/>
			</View>
		</TouchableOpacity>
	)
}

const MyBertyIdComponent: React.FC<{ user: any }> = ({ user }) => {
	const { goBack } = useNavigation()
	const [{ padding, color }] = useStyles()
	const { height } = useDimensions().window

	return (
		<ScrollView bounces={false} style={[padding.medium]}>
			<View
				style={[
					{
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginBottom: height * 0.1,
					},
				]}
			>
				<View
					style={[
						{
							flexDirection: 'row',
							alignItems: 'center',
						},
					]}
				>
					<TouchableOpacity
						onPress={goBack}
						style={{ alignItems: 'center', justifyContent: 'center' }}
					>
						<Icon
							name='arrow-back-outline'
							width={_iconArrowBackSize}
							height={_iconArrowBackSize}
							fill={color.white}
						/>
					</TouchableOpacity>
					<Text
						style={{
							fontWeight: '700',
							fontSize: _titleSize,
							lineHeight: 1.25 * _titleSize,
							marginLeft: 10,
							color: color.white,
						}}
					>
						My Berty ID
					</Text>
				</View>
				<Icon name='id' pack='custom' width={_iconIdSize} height={_iconIdSize} fill={color.white} />
			</View>
			<BertIdBody user={user} />
			<BertyIdShare />
		</ScrollView>
	)
}

export const MyBertyId: React.FC<{ user: any }> = ({ user }) => {
	const [{ flex, background }] = useStyles()
	return (
		<Layout style={[flex.tiny]}>
			<SafeAreaView style={[flex.tiny, background.blue]}>
				<MyBertyIdComponent user={user} />
			</SafeAreaView>
		</Layout>
	)
}
