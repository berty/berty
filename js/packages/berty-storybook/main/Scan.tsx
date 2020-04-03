import React, { useState } from 'react'
import {
	ScrollView,
	View,
	SafeAreaView,
	KeyboardAvoidingView,
	Dimensions,
	TextInput,
	Button,
	TouchableOpacity,
	StyleProp,
	ViewStyle,
} from 'react-native'
import {
	useResponsiveHeight,
	useResponsiveWidth,
	useResponsiveFontSize,
} from 'react-native-responsive-dimensions'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { useNavigation as useReactNavigation } from '@react-navigation/native'
// import { SDTSModalComponent } from '../shared-components/SDTSModalComponent'
import QRCodeScanner from 'react-native-qrcode-scanner'
// import { RNCamera } from 'react-native-camera'
import { Chat } from '@berty-tech/hooks'
import { useNavigation } from '@berty-tech/berty-navigation'
import { SimpleModal } from './SimpleModal'

//
// Scan => Scan QrCode of an other contact
//

// Types
type ScanInfosTextProps = {
	textProps: string
}

const ScanBody: React.FC<{}> = () => {
	const [{ background }] = useStyles()
	const sendContactRequest = Chat.useAccountSendContactRequest()
	const navigation = useReactNavigation()
	const size = useResponsiveWidth(75)
	const borderSize = useResponsiveWidth(5)
	return (
		<View
			style={[
				background.black,
				{
					borderRadius: 20,
					alignSelf: 'center',
					alignItems: 'center',
					justifyContent: 'center',
					width: size + 3 * borderSize,
					aspectRatio: 1,
				},
			]}
		>
			<View
				style={[
					{
						borderRadius: 20,
						width: size + borderSize,
						borderWidth: borderSize / 2,
						borderColor: 'white',
						aspectRatio: 1,
					},
				]}
			>
				<QRCodeScanner
					onRead={({ data, type }) => {
						if ((type as string) === 'QR_CODE') {
							// I would like to use binary mode in QR but this scanner seems to not support it, extended tests were done
							console.log('Scan.tsx: found QR:', type, data)
							let success = false
							try {
								sendContactRequest(data)
								success = true
							} catch (e) {
								navigation.navigate('Error', { error: `${e}` })
							}
							if (success) {
								navigation.goBack()
							}
						}
					}}
					containerStyle={{
						height: '100%',
						overflow: 'hidden',
						borderRadius: 10,
						aspectRatio: 1,
					}}
					cameraStyle={{
						width: '100%',
						aspectRatio: 1,
					}}
					cameraProps={{
						captureAudio: false,
					}}
					// flashMode={RNCamera.Constants.FlashMode.torch}
				/>
			</View>
		</View>
	)
}

const Dot = (props: { size: number; color: string; style?: StyleProp<ViewStyle> }) => {
	const { size, color, style } = props
	return (
		<View
			style={[
				{
					backgroundColor: color,
					width: size,
					aspectRatio: 1,
					borderRadius: size / 2,
				},
				style,
			]}
		/>
	)
}

const ScanInfosText: React.FC<ScanInfosTextProps & { style: StyleProp<ViewStyle> }> = ({
	textProps,
	style,
}) => {
	const [{ row, text, color }] = useStyles()
	return (
		<View style={[row.left, style]}>
			<Dot
				size={10}
				color={color.light.grey}
				style={{ alignSelf: 'flex-start', marginTop: 5, marginRight: 10 }}
			/>
			<Text style={[{ color: '#FFDEE9' }, row.item.justify, { fontSize: 13, fontWeight: '600' }]}>
				{textProps}
			</Text>
		</View>
	)
}

const ScanInfos: React.FC<{}> = () => {
	const [{ padding }] = useStyles()

	const itemsSpacing = useResponsiveHeight(3)
	const width = useResponsiveWidth(85)

	return (
		<View
			style={[
				padding.medium,
				{
					flexDirection: 'column',
					alignSelf: 'center',
					alignItems: 'flex-start',
					flexGrow: 1,
					paddingLeft: 20,
					paddingRight: 20,
					width,
				},
			]}
		>
			<ScanInfosText
				style={{ marginBottom: itemsSpacing }}
				textProps='Scanning a QR code sends a contact request'
			/>
			<ScanInfosText
				style={{ marginBottom: itemsSpacing }}
				textProps='You need to wait for the request to be accepted in order to chat with the contact'
			/>
		</View>
	)
}

export const Scan: React.FC<{}> = () => {
	const [{ color }] = useStyles()
	const bottomSpace = useResponsiveHeight(5)
	return (
		<SimpleModal title='Scan QR Code' color={color.red} iconName='image-outline'>
			<View style={{ marginBottom: bottomSpace }}>
				<ScanBody />
			</View>
			<ScanInfos />
		</SimpleModal>
	)
}
