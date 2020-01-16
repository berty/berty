import React from 'react'
import { View, SafeAreaView, StyleSheet, Dimensions } from 'react-native'
import { Layout, Text } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { SDTSModalComponent } from '../shared-components/SDTSModalComponent'

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

	return (
		<View style={[padding.medium]}>
			<View style={[border.radius.scale(20), background.black, padding.scale(30)]}>
				<View style={[border.radius.scale(20), _styles.body]} />
			</View>
		</View>
	)
}

const ScanInfosText: React.FC<ScanInfosTextProps> = ({ textProps }) => {
	const _styles = useStylesScan()
	const [{ row, padding, background, margin, text }] = useStyles()

	return (
		<View style={[row.center, padding.medium]}>
			<View
				style={[background.light.grey, margin.right.medium, row.item.justify, _styles.infosPoint]}
			/>
			<Text style={[text.color.light.grey, row.item.justify]}>{textProps}</Text>
		</View>
	)
}

const ScanInfos: React.FC<{}> = () => {
	const [{ margin, padding }] = useStyles()

	return (
		<View style={[margin.top.medium, padding.medium]}>
			<ScanInfosText textProps='Scanning a QR code sends a contact request' />
			<ScanInfosText textProps='You need to wait for the request to be accepted in order to chat with the contact' />
		</View>
	)
}

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
	const [{ color, flex }] = useStyles()

	return (
		<Layout style={[flex.tiny]}>
			<SafeAreaView style={[flex.tiny]}>
				<SDTSModalComponent
					rows={[
						{
							toggledPoint: firstToggledPoint,
							notToggledPoint: firstNotToggledPoint,
							initialPoint: firstToggledPoint,
							title: 'Scan QR code',
							titleColor: color.white,
							icon: 'code-outline',
							iconColor: color.white,
							bgColor: color.red,
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
