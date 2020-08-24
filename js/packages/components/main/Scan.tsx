import React, { useState } from 'react'
import { View, TextInput, Button, TouchableOpacity, Vibration, ScrollView } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import QRCodeScanner from 'react-native-qrcode-scanner'
// import { RNCamera } from 'react-native-camera'
import { useNavigation } from '@react-navigation/native'
import ScanTarget from './scan_target.svg'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Messenger } from '@berty-tech/store/oldhooks'

//
// Scan => Scan QrCode of an other contact
//

// Types
type ScanInfosTextProps = {
	textProps: string
}

// Styles

const useStylesScan = () => {
	const [{ border, height, width }, { fontScale }] = useStyles()
	return {
		titleSize: 26 * fontScale,
		styles: {
			infosPoint: [width(10), height(10), border.radius.scale(5)],
		},
	}
}

const ScanBody: React.FC<{}> = () => {
	const handleDeepLink = () => {} /*Messenger.useHandleDeepLink()*/
	const navigation = useNavigation()
	const [
		{ background, margin, flex, column, border },
		{ windowHeight, windowWidth, isGteIpadSize },
	] = useStyles()
	const { titleSize } = useStylesScan()
	const qrScanSize = isGteIpadSize
		? Math.min(windowHeight, windowWidth) * 0.5
		: Math.min(windowHeight * 0.8, windowWidth * 0.8) - 1.25 * titleSize
	const borderRadius = border.radius.scale(30)

	return (
		<View
			style={[
				background.black,
				margin.small,
				column.item.center,
				flex.align.center,
				flex.justify.center,
				borderRadius,
				{
					height: qrScanSize,
					aspectRatio: 1,
				},
			]}
		>
			<QRCodeScanner
				onRead={({ data, type }) => {
					if ((type as string) === 'QR_CODE' || (type as string) === 'org.iso.QRCode') {
						handleDeepLink(data)
						// I would like to use binary mode in QR but this scanner seems to not support it, extended tests were done
						navigation.navigate('Modals', {
							screen: 'ManageDeepLink',
							params: { type: 'qr', value: data },
						})
						Vibration.vibrate(1000)
					}
				}}
				cameraProps={{ captureAudio: false }}
				containerStyle={[borderRadius, { width: '100%', height: '100%', overflow: 'hidden' }]}
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
				style={[
					background.light.grey,
					margin.right.medium,
					row.item.justify,
					_styles.styles.infosPoint,
				]}
			/>
			<Text style={[text.color.light.grey, row.item.justify]}>{textProps}</Text>
		</View>
	)
}

const DevReferenceInput = () => {
	const handleDeepLink = () => {} /*Messenger.useHandleDeepLink()*/
	const [ref, setRef] = useState('')
	const navigation = useNavigation()
	return (
		<>
			<ScanInfosText textProps='Alternatively, enter the reference below' />
			<TextInput
				value={ref}
				onChangeText={setRef}
				//eslint-disable-next-line react-native/no-inline-styles
				style={{ backgroundColor: 'white', padding: 8 }}
			/>
			<Button
				title='Submit'
				onPress={() => {
					handleDeepLink(ref)
					navigation.navigate('Modals', {
						screen: 'ManageDeepLink',
						params: { type: 'link', value: ref },
					})
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

const ScanComponent: React.FC<{}> = () => {
	const { goBack } = useNavigation()
	const [{ color, padding, flex, margin }] = useStyles()
	const { titleSize } = useStylesScan()

	return (
		<ScrollView bounces={false} style={[padding.medium]}>
			<View
				style={[
					flex.direction.row,
					flex.justify.spaceBetween,
					flex.align.center,
					margin.bottom.scale(40),
				]}
			>
				<View style={[flex.direction.row, flex.align.center]}>
					<TouchableOpacity onPress={goBack} style={[flex.align.center, flex.justify.center]}>
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
		</ScrollView>
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
