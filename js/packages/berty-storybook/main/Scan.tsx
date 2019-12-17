import React from 'react'
import { View, SafeAreaView, StyleSheet, Dimensions } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { styles, colors } from '@berty-tech/styles'
import { SDTSModalComponent } from '../shared-components/SDTSModalComponent'

//
// Scan => Scan QrCode of an other contact
//

// Types
type ScanInfosTextProps = {
	text: string
}

// Styles
const _scanStyles = StyleSheet.create({
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

const Screen = Dimensions.get('window')

const ScanComponent: React.FC<{}> = () => (
	<View style={{ height: Screen.height }}>
		<ScanBody />
		<ScanInfos />
	</View>
)

export const Scan: React.FC<{}> = () => {
	const firstNotToggledPoint = Screen.height - 120
	const firstToggledPoint = 20

	return (
		<Layout style={[styles.flex]}>
			<SafeAreaView style={[styles.flex]}>
				<SDTSModalComponent
					rows={[
						{
							toggledPoint: firstToggledPoint,
							notToggledPoint: firstNotToggledPoint,
							initialPoint: firstToggledPoint,
							title: 'Scan QR code',
							titleColor: colors.white,
							icon: 'code-outline',
							iconColor: colors.white,
							bgColor: colors.red,
							maxHeight: Screen.height - 90,
						},
					]}
				>
					<ScanComponent />
				</SDTSModalComponent>
			</SafeAreaView>
		</Layout>
	)
}
