import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'

interface HelpMessageProps {
	clearHelpMessageValue: () => void
	helpMessage: string
}

export const HelpMessage: React.FC<HelpMessageProps> = props => {
	const colors = useThemeColor()
	const { border, padding, margin } = useStyles()

	return (
		<TouchableOpacity style={styles.container} onPress={props.clearHelpMessageValue}>
			<View
				style={[
					{ backgroundColor: colors['background-header'] },
					padding.small,
					border.radius.small,
					margin.right.small,
				]}
			>
				<UnifiedText style={{ color: colors['reverted-main-text'] }}>
					{props.helpMessage}
				</UnifiedText>
			</View>
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: -30,
		right: 0,
		zIndex: 42000,
	},
})
