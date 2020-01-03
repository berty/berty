import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-ui-kitten'
import { styles } from '@berty-tech/styles'

//
// FingerprintContent => Generally on TabBar there is a TabItem Fingerpint that show this component
//

// Types
type FingerprintContentProps = {
	fingerprint: string
}

// Styles
const _fingerprintContentStyles = StyleSheet.create({
	fingerprintContentText: {
		fontSize: 12,
	},
})

const FingerprintContentText: React.FC<FingerprintContentProps> = ({ fingerprint }) => (
	<Text
		style={[
			styles.textBlue,
			styles.fontCourier,
			styles.textBold,
			_fingerprintContentStyles.fingerprintContentText,
		]}
	>
		{fingerprint}
	</Text>
)

const FingerprintContentFaction: React.FC<{}> = () => (
	<View style={[styles.row, styles.spaceAround]}>
		<FingerprintContentText fingerprint='72EC' />
		<FingerprintContentText fingerprint='F46A' />
		<FingerprintContentText fingerprint='56B4' />
		<FingerprintContentText fingerprint='AD39' />
	</View>
)

export const FingerprintContent: React.FC<{}> = () => (
	<View style={[styles.bgLightBlueGrey, styles.borderRadius, styles.padding]}>
		<View style={[styles.col]}>
			<FingerprintContentFaction />
			<FingerprintContentFaction />
			<FingerprintContentFaction />
			<FingerprintContentFaction />
		</View>
	</View>
)
