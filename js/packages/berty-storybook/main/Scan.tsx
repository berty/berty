import React, { useContext } from 'react'
import { View, StyleProp, ViewStyle } from 'react-native'
import { useResponsiveHeight, useResponsiveWidth } from 'react-native-responsive-dimensions'
import { Text } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { useNavigation as useReactNavigation } from '@react-navigation/native'
import QRCodeScanner from 'react-native-qrcode-scanner'
import { SimpleModal } from '../shared-components/SimpleModal'
import { InvalidScan } from '../modals/InvalidScan'
import { AddThisContact } from '../modals/AddThisContact'
import { ModalsContext } from '../ModalsProvider'

//
// Scan => Scan QrCode of an other contact
//

const ScanBody: React.FC = () => {
	const [{ background }] = useStyles()
	const navigation = useReactNavigation()
	const size = useResponsiveWidth(75)
	const borderSize = useResponsiveWidth(5)
	const modals = useContext(ModalsContext)
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
							try {
								const parts = data.split(' ')
								if (parts.length !== 2) {
									throw new Error('Corrupted content')
								}
								const [b64Name, ref] = parts
								const name = Buffer.from(b64Name, 'base64').toString('utf-8')
								modals.setCurrent(
									<AddThisContact
										name={name}
										publicKey={'unknown'}
										reference={ref}
										onConfirm={() => navigation.goBack()}
									/>,
								)
							} catch (e) {
								modals.setCurrent(<InvalidScan title='This link is invalid!' error={`${e}`} />)
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

const Dot: React.FC<{ size: number; color: string; style?: StyleProp<ViewStyle> }> = ({
	size,
	color,
	style,
}) => (
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

const ScanInfosText: React.FC<{ textProps: string; style: StyleProp<ViewStyle> }> = ({
	textProps,
	style,
}) => {
	const [{ row, color }] = useStyles()
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

const ScanInfos: React.FC = () => {
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

export const Scan: React.FC = () => {
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
