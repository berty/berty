import React, { useState } from 'react'
import { View, SafeAreaView, StyleSheet } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { styles, colors } from '@berty-tech/styles'

//
// Scan Invalid
//

// Styles
const _invalidScanStyles = StyleSheet.create({
	header: {
		width: 120,
		height: 120,
		borderRadius: 60,
	},
	errorText: {
		fontSize: 14,
		fontFamily: 'Courier',
	},
	dismissButton: {
		borderColor: colors.lightGrey,
		borderWidth: 2,
		borderRadius: 10,
		marginTop: 50,
		paddingLeft: 10,
		paddingRight: 14,
		paddingTop: 8,
		paddingBottom: 8,
	},
	dismissText: {
		fontSize: 17,
	},
	body: {
		bottom: 78,
	},
})

const InvalidScanHeader: React.FC<{}> = () => (
	<View>
		<View
			style={[
				styles.bgWhite,
				styles.center,
				styles.shadow,
				styles.marginBottom,
				styles.spaceCenter,
				styles.alignItems,
				_invalidScanStyles.header,
			]}
		>
			<Icon name='alert-circle-outline' width={100} height={100} fill={colors.red} />
		</View>
		<View>
			<Text style={[styles.textRed, styles.textBold, styles.textCenter]}>
				This QR code is invalid!
			</Text>
		</View>
	</View>
)

const InvalidScanError: React.FC<{}> = () => (
	<View style={[styles.borderRadius, styles.bgLightRed, styles.padding, styles.bigMarginTop]}>
		<Text
			style={[styles.textRed, styles.textCenter, styles.textBold, _invalidScanStyles.errorText]}
		>
			Invalid format: missing characters
		</Text>
	</View>
)

const InvalidScanDismissButton: React.FC<{}> = () => (
	<View
		style={[
			styles.row,
			styles.center,
			styles.alignItems,
			styles.spaceCenter,
			styles.marginBottom,
			_invalidScanStyles.dismissButton,
		]}
	>
		<Icon name='close' width={30} height={30} fill={colors.grey} />
		<Text style={[styles.textGrey, styles.littlePaddingLeft, _invalidScanStyles.dismissText]}>
			DISMISS
		</Text>
	</View>
)

const InvalidScanBody: React.FC<{}> = () => {
	const [layout, setLayout] = useState()

	return (
		<View style={[styles.padding]}>
			<View
				onLayout={(e) => !layout && setLayout(e.nativeEvent.layout.height)}
				style={[
					styles.bgWhite,
					styles.padding,
					styles.borderRadius,
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

export const InvalidScan: React.FC<{}> = () => (
	<Layout style={[styles.flex, styles.centerItems, styles.spaceCenter, styles.bgRed]}>
		<SafeAreaView>
			<InvalidScanBody />
		</SafeAreaView>
	</Layout>
)
