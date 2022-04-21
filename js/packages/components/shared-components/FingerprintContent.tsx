import React from 'react'
import { View } from 'react-native'
import { SHA3 } from 'sha3'

import { useStyles } from '@berty/contexts/styles'
import { Maybe, useThemeColor } from '@berty/store'
import { UnifiedText } from './UnifiedText'

//
// FingerprintContent => Generally on TabBar there is a TabItem Fingerpint that show this component
//

// Types
type FingerprintContentProps = {
	fingerprint: string
}

// Style
const useStylesFingerprintContent = () => {
	const { text } = useStyles()
	return {
		fingerprintContentText: text.size.small,
	}
}

const FingerprintContentText: React.FC<FingerprintContentProps> = ({ fingerprint }) => {
	const { text } = useStyles()
	const colors = useThemeColor()
	const _styles = useStylesFingerprintContent()
	return (
		<UnifiedText
			style={[
				text.bold,
				_styles.fingerprintContentText,
				{ fontFamily: 'Courier, monospace', color: colors['background-header'] },
			]}
		>
			{fingerprint.toUpperCase()}
		</UnifiedText>
	)
}

const FingerprintContentFaction: React.FC<{ digestPart: string }> = ({ digestPart }) => {
	const { row } = useStyles()
	return (
		<View style={[row.fill]}>
			<FingerprintContentText fingerprint={digestPart.substr(0, 4)} />
			<FingerprintContentText fingerprint={digestPart.substr(4, 4)} />
			<FingerprintContentText fingerprint={digestPart.substr(8, 4)} />
			<FingerprintContentText fingerprint={digestPart.substr(12, 4)} />
		</View>
	)
}

export const FingerprintContent: React.FC<{ seed: Maybe<string>; isEncrypted?: boolean }> = ({
	seed,
	isEncrypted,
}) => {
	const { column, border, padding } = useStyles()
	const colors = useThemeColor()

	if (isEncrypted) {
		return (
			<UnifiedText style={{ textAlign: 'center' }}>
				This conversation is totally encrypted, title included.
			</UnifiedText>
		)
	}
	if (!seed) {
		return <UnifiedText style={{ textAlign: 'center' }}>No seed</UnifiedText>
	}
	const digest = new SHA3(256).update(seed).digest('hex')
	return (
		<View
			style={[
				border.radius.medium,
				padding.medium,
				{ backgroundColor: colors['input-background'], width: '100%' },
			]}
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
