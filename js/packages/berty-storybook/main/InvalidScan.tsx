import React, { useState } from 'react'
import { View, SafeAreaView, StyleSheet } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { styles, colors, useStyles } from '@berty-tech/styles'

//
// Scan Invalid
//

// Styles
const useStylesInvalidScan = () => {
	const [{ width, height, border, text, padding, margin }] = useStyles()
	return {
		header: [width(120), height(120), border.radius.scale(60)],
		dismissButton: [
			border.color.light.grey,
			border.scale(2),
			border.radius.small,
			margin.top.scale(50),
			padding.left.small,
			padding.right.medium,
			padding.top.small,
			padding.bottom.small,
		],
		dismissText: [text.size.scale(17)],
	}
}

const _invalidScanStyles = StyleSheet.create({
	errorText: {
		fontSize: 14,
		fontFamily: 'Courier',
	},
	body: {
		bottom: 78,
	},
})

const InvalidScanHeader: React.FC<{}> = () => {
	const _styles = useStylesInvalidScan()
	const [{ background, margin, text, border, row, column }] = useStyles()

	return (
		<View>
			<View
				style={[
					background.white,
					border.shadow.medium,
					margin.bottom.medium,
					row.item.justify,
					column.justify,
					_styles.header,
				]}
			>
				<Icon
					name='alert-circle-outline'
					width={100}
					height={100}
					fill={colors.red}
					style={[row.item.justify]}
				/>
			</View>
			<View>
				<Text style={[text.color.red, text.bold, text.align.center]}>This QR code is invalid!</Text>
			</View>
		</View>
	)
}

const InvalidScanError: React.FC<{}> = () => {
	const [{ border, background, padding, margin, text }] = useStyles()

	return (
		<View style={[border.radius.medium, background.light.red, padding.medium, margin.top.huge]}>
			<Text style={[text.color.red, text.align.center, text.bold, _invalidScanStyles.errorText]}>
				Invalid format: missing characters
			</Text>
		</View>
	)
}

const InvalidScanDismissButton: React.FC<{}> = () => {
	const _styles = useStylesInvalidScan()
	const [{ row, margin, color, column, padding, text }] = useStyles()

	return (
		<View style={row.center}>
			<View style={[row.fill, margin.bottom.medium, _styles.dismissButton]}>
				<Icon name='close' width={30} height={30} fill={color.grey} style={row.item.justify} />
				<Text style={[text.color.grey, padding.left.small, row.item.justify, _styles.dismissText]}>
					DISMISS
				</Text>
			</View>
		</View>
	)
}

const InvalidScanBody: React.FC<{}> = () => {
	const [layout, setLayout] = useState()
	const [{ background, padding, border }] = useStyles()

	return (
		<View style={[padding.medium]}>
			<View
				onLayout={(e) => !layout && setLayout(e.nativeEvent.layout.height)}
				style={[
					background.white,
					padding.medium,
					border.radius.medium,
					layout && { height: layout - 78 },
				]}
			>
				<View style={[_invalidScanStyles.body]}>
					<InvalidScanHeader />
					<InvalidScanError />
					<InvalidScanDismissButton />
				</View>
			</View>
		</View>
	)
}

export const InvalidScan: React.FC<{}> = () => {
	const [{ flex, row, background, column }] = useStyles()

	return (
		<Layout style={[flex.tiny, row.fill, column.justify, background.red]}>
			<SafeAreaView>
				<InvalidScanBody />
			</SafeAreaView>
		</Layout>
	)
}
