import React, { useEffect } from 'react'
import { View } from 'react-native'
import { Text } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'

//
// FingerprintContent => Generally on TabBar there is a TabItem Fingerpint that show this component
//

// Types
type FingerprintContentProps = {
	fingerprint: string
}

// Style
const useStylesFingerprintContent = () => {
	const [{ text }] = useStyles()
	return {
		fingerprintContentText: text.size.small,
	}
}

const FingerprintContentText: React.FC<FingerprintContentProps> = ({ fingerprint }) => {
	const [{ text }] = useStyles()
	const _styles = useStylesFingerprintContent()
	return (
		<Text
			style={[
				text.color.blue,
				text.bold.medium,
				text.family.use('Courier'),
				_styles.fingerprintContentText,
			]}
		>
			{fingerprint}
		</Text>
	)
}

const FingerprintContentFaction: React.FC<{}> = () => {
	const [{ row }] = useStyles()
	return (
		<View style={[row.fill]}>
			<FingerprintContentText fingerprint='72EC' />
			<FingerprintContentText fingerprint='F46A' />
			<FingerprintContentText fingerprint='56B4' />
			<FingerprintContentText fingerprint='AD39' />
		</View>
	)
}

export const FingerprintContent: React.FC<{}> = () => {
	const [{ column, border, padding }] = useStyles()
	return (
		<View style={[border.radius.medium, padding.medium, { backgroundColor: '#E8E9FC' }]}>
			<View style={[column.top]}>
				<FingerprintContentFaction />
				<FingerprintContentFaction />
				<FingerprintContentFaction />
				<FingerprintContentFaction />
			</View>
		</View>
	)
}
