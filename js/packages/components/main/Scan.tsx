import React, { useEffect, useState } from 'react'
import {
	View,
	TextInput,
	Button,
	TouchableOpacity,
	Vibration,
	Text as TextNative,
	StatusBar,
} from 'react-native'
import { Layout, Text, Icon } from '@ui-kitten/components'
import QRCodeScanner from 'react-native-qrcode-scanner'
import { SafeAreaConsumer } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'

import { useStyles } from '@berty-tech/styles'

import ScanTarget from './scan_target.svg'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'
import { checkPermissions } from '../utils'

//
// Scan => Scan QrCode of an other contact
//

// Types
type ScanInfosTextProps = {
	textProps: string
}

// Styles

const useStylesScan = () => {
	const [{ border, height, width }, { fontScale, scaleSize }] = useStyles()
	return {
		titleSize: 26 * fontScale,
		styles: {
			infosPoint: [
				width(10 * scaleSize),
				height(10 * scaleSize),
				border.radius.scale(5 * scaleSize),
			],
		},
	}
}

const ScanBody: React.FC<{}> = () => {
	useEffect(() => {
		checkPermissions(['camera'])
	}, [])
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
				margin.horizontal.small,
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
						// I would like to use binary mode in QR but this scanner seems to not support it, extended tests were done
						navigation.navigate('ManageDeepLink', { type: 'qr', value: data })
						Vibration.vibrate(1000)
					}
				}}
				cameraProps={{ captureAudio: false }}
				containerStyle={[borderRadius, { width: '100%', height: '100%', overflow: 'hidden' }]}
				cameraStyle={{ width: '100%', height: '100%', aspectRatio: 1 }}
				reactivate
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
		<View style={[row.left, padding.horizontal.medium, padding.bottom.medium]}>
			<View
				style={[
					background.light.grey,
					margin.right.medium,
					row.item.justify,
					_styles.styles.infosPoint,
				]}
			/>
			<TextNative
				style={[
					text.color.light.grey,
					text.bold.small,
					text.size.medium,
					row.item.justify,
					{ fontFamily: 'Open Sans' },
				]}
			>
				{textProps}
			</TextNative>
		</View>
	)
}

const DevReferenceInput = () => {
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
					navigation.navigate('ManageDeepLink', { type: 'link', value: ref })
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

const ScanComponent: React.FC<any> = () => {
	const { goBack } = useNavigation()
	const [{ color, padding, flex, margin, background }, { scaleSize }] = useStyles()
	const { titleSize } = useStylesScan()
	const [, setIsTouchingHeader] = useState(false)

	return (
		<SafeAreaConsumer>
			{(insets) => {
				return (
					<View
						style={[
							padding.medium,
							background.red,
							{ paddingTop: scaleSize * ((insets?.top || 0) + 16), flexGrow: 2, flexBasis: '100%' },
						]}
					>
						<View
							style={[
								flex.direction.row,
								flex.justify.spaceBetween,
								flex.align.center,
								margin.bottom.scale(40),
							]}
							onTouchStart={() => {
								setIsTouchingHeader(true)
							}}
							onTouchCancel={() => setIsTouchingHeader(false)}
							onTouchEnd={() => setIsTouchingHeader(false)}
						>
							<View style={[flex.direction.row, flex.align.center]}>
								<TouchableOpacity onPress={goBack} style={[flex.align.center, flex.justify.center]}>
									{/* <Icon name='arrow-back-outline' width={30} height={30} fill={color.white} /> */}
									<Icon name='arrow-down-outline' width={30} height={30} fill={color.white} />
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
			}}
		</SafeAreaConsumer>
	)
}

export const Scan: React.FC<{}> = () => {
	const [{ flex, color }] = useStyles()
	const navigation = useNavigation()

	return (
		<Layout style={[flex.tiny, { backgroundColor: 'transparent' }]}>
			<StatusBar backgroundColor={color.red} barStyle='light-content' />
			<SwipeNavRecognizer
				onSwipeRight={() => navigation.goBack()}
				onSwipeLeft={() => navigation.goBack()}
				onSwipeUp={() => navigation.goBack()}
				onSwipeDown={() => navigation.goBack()}
			>
				<ScanComponent />
			</SwipeNavRecognizer>
		</Layout>
	)
}
