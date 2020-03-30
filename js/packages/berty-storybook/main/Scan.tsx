import React, { useState } from 'react'
import { View, SafeAreaView, Dimensions, TextInput, Button, TouchableOpacity } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
// import { SDTSModalComponent } from '../shared-components/SDTSModalComponent'
import QRCodeScanner from 'react-native-qrcode-scanner'
// import { RNCamera } from 'react-native-camera'
import { Chat } from '@berty-tech/hooks'
import { useNavigation } from '@berty-tech/berty-navigation'

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
	const _styles = useStylesScan()
	const [{ padding, border, background }] = useStyles()
	const sendContactRequest = Chat.useAccountSendContactRequest()
	return (
		<View style={[padding.medium]}>
			<View style={[border.radius.scale(20), background.black, padding.scale(30)]}>
				<View style={[border.radius.scale(20), _styles.body]}>
					<QRCodeScanner
						onRead={({ data, type }) => {
							if ((type as string) === 'QR_CODE') {
								// I would like to use binary mode in QR but this scanner seems to not support it, extended tests were done
								console.log('Scan.tsx: found QR:', data)
								sendContactRequest(data)
							}
						}}
						cameraProps={{ captureAudio: false }}
						// flashMode={RNCamera.Constants.FlashMode.torch}
					/>
				</View>
			</View>
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
	const sendContactRequest = Chat.useAccountSendContactRequest()
	const navigation = useNavigation()
	return (
		<>
			<ScanInfosText textProps='Alternatively, enter the reference below' />
			<TextInput value={ref} onChangeText={setRef} />
			<Button
				title='Submit'
				onPress={() => {
					sendContactRequest(ref)
					navigation.goBack()
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
			<DevReferenceInput />
		</View>
	)
}

const Screen = Dimensions.get('window')

const ScanComponent: React.FC<{}> = () => {
	const { goBack } = useNavigation()
	const [{ color, padding }] = useStyles()
	return (
		<View style={[{ height: Screen.height }, padding.medium]}>
			<TouchableOpacity onPress={goBack}>
				<Icon name='arrow-back-outline' width={30} height={30} fill={color.black} />
			</TouchableOpacity>
			<ScanBody />
			{__DEV__ && <ScanInfos />}
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
