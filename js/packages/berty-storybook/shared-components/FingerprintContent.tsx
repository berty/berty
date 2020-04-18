import React from 'react'
import { View } from 'react-native'
import { Text } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { SHA3 } from 'sha3'

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
			{fingerprint.toUpperCase()}
		</Text>
	)
}

const FingerprintContentFaction: React.FC<{ digestPart: string }> = ({ digestPart }) => {
	const [{ row }] = useStyles()
	return (
		<View style={[row.fill]}>
			<FingerprintContentText fingerprint={digestPart.substr(0, 4)} />
			<FingerprintContentText fingerprint={digestPart.substr(4, 4)} />
			<FingerprintContentText fingerprint={digestPart.substr(8, 4)} />
			<FingerprintContentText fingerprint={digestPart.substr(12, 4)} />
		</View>
	)
}

export const FingerprintContent: React.FC<{ seed: string }> = ({ seed }) => {
	const [{ column, border, padding }] = useStyles()
	if (!seed) {
		return <Text style={{ textAlign: 'center' }}>No seed</Text>
	}
	const hash = new SHA3(256)
	hash.update(seed)
	const digest = hash.digest('hex')
	return (
		<View
			style={[border.radius.medium, padding.medium, { backgroundColor: '#E8E9FC', width: '100%' }]}
		>
			<View style={[column.top]}>
				<FingerprintContentFaction digestPart={digest.substr(0, 16)} />
				<FingerprintContentFaction digestPart={digest.substr(16, 16)} />
				<FingerprintContentFaction digestPart={digest.substr(32, 16)} />
				<FingerprintContentFaction digestPart={digest.substr(48, 16)} />
			</View>
		</View>
	)
}
