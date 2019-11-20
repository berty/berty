import React from 'react'
import { View, SafeAreaView, StyleSheet } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { styles, colors } from '../styles'

//
// Scan => Scan QrCode of an other contact
//

// Types
type ScanInfosTextProps = {
	text: string
}

// Styles
const _scanStyles = StyleSheet.create({
	scan: {
		borderTopLeftRadius: 25,
		borderTopRightRadius: 25,
		height: '100%',
	},
	headerToggleBar: {
		borderWidth: 2.5,
		width: '12%',
		borderRadius: 4,
	},
	body: {
		borderWidth: 10,
		height: 300,
	},
	infosPoint: {
		width: 10,
		height: 10,
		borderRadius: 5,
	},
})

const ScanHeader: React.FC<{}> = () => (
	<View>
		<View
			style={[
				styles.littleMarginTop,
				styles.center,
				_scanStyles.headerToggleBar,
				{ borderColor: colors.lightGrey },
			]}
		/>
		<View style={[styles.row, styles.padding, styles.spaceBetween, styles.alignItems]}>
			<Text style={[styles.fontFamily, styles.textWhite]} category='h4'>
				Scan QR code
			</Text>
			<Icon
				style={[styles.flex, styles.right]}
				name='code-outline'
				width={40}
				height={40}
				fill={colors.white}
			/>
		</View>
	</View>
)

const ScanBody: React.FC<{}> = () => (
	<View style={[styles.padding]}>
		<View style={[styles.borderRadius, styles.bgBlack, styles.bigPadding]}>
			<View style={[styles.borderRadius, _scanStyles.body, { borderColor: colors.white }]} />
		</View>
	</View>
)

const ScanInfosText: React.FC<ScanInfosTextProps> = ({ text }) => (
	<View style={[styles.row, styles.alignItems, styles.padding]}>
		<View style={[styles.bgLightGrey, styles.marginRight, _scanStyles.infosPoint]} />
		<Text style={[styles.textLightGrey]}>{text}</Text>
	</View>
)

const ScanInfos: React.FC<{}> = () => (
	<View style={[styles.marginTop, styles.padding]}>
		<ScanInfosText text='Scanning a QR code sends a contact request' />
		<ScanInfosText text='You need to wait for the request to be accepted in order to chat with the contact' />
	</View>
)

export const Scan: React.FC<{}> = () => (
	<Layout style={[styles.flex]}>
		<SafeAreaView>
			<View style={[styles.bgRed, _scanStyles.scan]}>
				<ScanHeader />
				<ScanBody />
				<ScanInfos />
			</View>
		</SafeAreaView>
	</Layout>
)
