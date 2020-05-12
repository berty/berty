import React, { useState } from 'react'
import { View, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Share } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { TabBar } from '../shared-components/TabBar'
import { RequestAvatar } from '../shared-components/Request'
import { Chat } from '@berty-tech/hooks'
import { useNavigation } from '@berty-tech/berty-navigation'
import QRCode from 'react-native-qrcode-svg'
import { FingerprintContent } from '../shared-components/FingerprintContent'
import { SafeAreaView } from 'react-native-safe-area-context'

//
// Settings My Berty ID Vue
//

// Style
const useStylesBertyId = () => {
	const [{ margin, padding, maxHeight, minHeight }] = useStyles()
	return {
		bodyMarginTop: margin.top.scale(60),
		bodyContent: [margin.bottom.scale(40), padding.top.scale(50)],
		scrollViewMaxHeight: maxHeight(400),
		contentMinHeight: minHeight(400),
	}
}
const _bertyIdStyles = StyleSheet.create({
	headerToggleBar: {
		borderWidth: 2.5,
		width: '12%',
		borderRadius: 4,
	},
	bertyLayout: { borderTopLeftRadius: 25, borderTopRightRadius: 25, height: '100%' },
	bertyIdButton: { width: 60, height: 60, borderRadius: 60 / 2, marginRight: 60, bottom: 30 },
})

const BertyIdContent: React.FC<{}> = ({ children }) => {
	const _styles = useStylesBertyId()
	const [{ padding, column }] = useStyles()

	return (
		<ScrollView
			style={[_styles.scrollViewMaxHeight]}
			contentContainerStyle={[padding.vertical.medium]}
		>
			<View style={[column.justify, { alignItems: 'center' }]}>{children}</View>
		</ScrollView>
	)
}

const ContactRequestQR = () => {
	const contactRequestReference = Chat.useContactRequestReference()
	const contactRequestEnabled = Chat.useContactRequestEnabled()
	const [styles] = useStyles()
	// I would like to use binary mode in QR but the scanner used seems to not support it, extended tests were done
	if (contactRequestEnabled) {
		return (
			<View style={[styles.padding.top.big]}>
				<QRCode size={Dimensions.get('window').width * 0.66} value={contactRequestReference} />
			</View>
		)
	} else {
		return <Text>Error: Contact request is disabled</Text>
	}
}

const Fingerprint: React.FC = () => {
	const client = Chat.useClient()
	const [styles] = useStyles()
	if (!client) {
		return <Text>Client not initialized</Text>
	}
	return (
		<View style={[styles.padding.top.big, { width: '100%' }]}>
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
	const _styles = useStylesBertyId()
	const [{ background, border, margin, padding, opacity }] = useStyles()
	const [selectedContent, setSelectedContent] = useState()
	const client = Chat.useClient()
	return (
		<View
			style={[
				background.white,
				border.radius.scale(30),
				margin.horizontal.medium,
				_styles.bodyMarginTop,
			]}
		>
			<RequestAvatar {...user} seed={client?.accountPk} size={90} />
			<View style={[padding.horizontal.big, _styles.bodyContent]}>
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
	const contactRequestReference = Chat.useContactRequestReference()
	if (!contactRequestReference) {
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
					await Share.share({ url: `berty://${encodeURIComponent(contactRequestReference)}` })
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
					width={26}
					height={26}
					fill={color.blue}
				/>
			</View>
		</TouchableOpacity>
	)
}

const Screen = Dimensions.get('window')

const MyBertyIdComponent: React.FC<{ user: any }> = ({ user }) => {
	const { goBack } = useNavigation()
	const [{ padding, color, margin }] = useStyles()
	const titleSize = 26
	return (
		<View style={[{ height: Screen.height }, padding.medium]}>
			<View
				style={[
					{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
					margin.horizontal.medium,
				]}
			>
				<View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
					<TouchableOpacity
						onPress={goBack}
						style={{ alignItems: 'center', justifyContent: 'center' }}
					>
						<Icon name='arrow-back-outline' width={30} height={30} fill={color.white} />
					</TouchableOpacity>
					<Text
						style={{
							fontWeight: '700',
							fontSize: titleSize,
							lineHeight: 1.25 * titleSize,
							marginLeft: 10,
							color: color.white,
						}}
					>
						My Berty ID
					</Text>
				</View>
				<Icon name='id' pack='custom' width={45} height={45} fill={color.white} />
			</View>
			<BertIdBody user={user} />
			<BertyIdShare />
		</View>
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
