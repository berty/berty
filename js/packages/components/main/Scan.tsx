import React, { useState } from 'react'
import { View, Dimensions, TextInput, Button, TouchableOpacity, Vibration } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import QRCodeScanner from 'react-native-qrcode-scanner'
// import { RNCamera } from 'react-native-camera'
import { useNavigation } from '@react-navigation/native'
import ScanTarget from './scan_target.svg'
import { SafeAreaView } from 'react-native-safe-area-context'

//
// Scan => Scan QrCode of an other contact
//

// Types
type ScanInfosTextProps = {
	textProps: string
}

// Styles
const useStylesScan = () => {
	const [{ border, height, width }] = useStyles()
	return {
		body: [border.scale(10), height(300), border.color.white],
		infosPoint: [width(10), height(10), border.radius.scale(5)],
	}
}

const ScanBody: React.FC<{}> = () => {
	const navigation = useNavigation()
	const [{ background }] = useStyles()
	const borderRadius = 30
	return (
		<View
			style={[
				background.black,
				{
					width: '100%',
					aspectRatio: 1,
					justifyContent: 'center',
					alignItems: 'center',
					borderRadius,
				},
			]}
		>
			<QRCodeScanner
				onRead={({ data, type }) => {
					if ((type as string) === 'QR_CODE' || (type as string) === 'org.iso.QRCode') {
						// I would like to use binary mode in QR but this scanner seems to not support it, extended tests were done
						navigation.navigate('Modals', {
							screen: 'SendContactRequest',
							params: { qrData: data },
						})
						Vibration.vibrate(1000)
					}
				}}
				cameraProps={{ captureAudio: false }}
				containerStyle={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius }}
				cameraStyle={{ width: '100%', height: '100%', aspectRatio: 1 }}
				// flashMode={RNCamera.Constants.FlashMode.torch}
			/>
			<ScanTarget height='75%' width='75%' style={{ position: 'absolute' }} />
		</View>
	)
}

const ScanInfosText: React.FC<ScanInfosTextProps> = ({ textProps }) => {
	const _styles = useStylesScan()
	const [{ row, padding, background, margin, text }] = useStyles()

	return (
		<View style={[row.left, padding.medium]}>
			<View
				style={[background.light.grey, margin.right.medium, row.item.justify, _styles.infosPoint]}
			/>
			<Text style={[text.color.light.grey, row.item.justify]}>{textProps}</Text>
		</View>
	)
}

const DevReferenceInput = () => {
	const [ref, setRef] = useState('')
	const navigation = useNavigation()
	return (
		<>
			<ScanInfosText textProps='Alternatively, enter the reference below' />
			<TextInput value={ref} onChangeText={setRef} />
			<Button
				title='Submit'
				onPress={() => {
					const prefix = 'berty://'
					const params = ref.startsWith(prefix)
						? { uriData: ref.substr(prefix.length) }
						: { qrData: ref }
					navigation.navigate('Modals', { screen: 'SendContactRequest', params })
					Vibration.vibrate(1000)
				}}
			/>
		</>
	)
}

const ScanInfos: React.FC<{}> = () => {
	const [{ margin, padding }] = useStyles()

	return (
		<View style={[margin.top.medium, padding.medium]}>
			<ScanInfosText textProps='Scanning a QR code sends a contact request' />
			<ScanInfosText textProps='You need to wait for the request to be accepted in order to chat with the contact' />
			{__DEV__ && <DevReferenceInput />}
		</View>
	)
}

const Screen = Dimensions.get('window')

const ScanComponent: React.FC<{}> = () => {
	const { goBack } = useNavigation()
	const [{ color, padding }] = useStyles()
	const titleSize = 26
	return (
		<View style={[{ height: Screen.height }, padding.medium]}>
			<View
				style={[
					{
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginBottom: 40,
					},
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
						Scan QR code
					</Text>
				</View>
				<Icon name='qr' pack='custom' width={40} height={40} fill={color.white} />
			</View>
			<ScanBody />
			<ScanInfos />
		</View>
	)
}

export const Scan: React.FC<{}> = () => {
	const [{ flex, background }] = useStyles()

	return (
		<Layout style={[flex.tiny]}>
			<SafeAreaView style={[flex.tiny, background.red]}>
				<ScanComponent />
			</SafeAreaView>
		</Layout>
	)
}
