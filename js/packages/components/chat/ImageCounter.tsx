import { Icon } from '@ui-kitten/components'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'

import { UnifiedText } from '../shared-components/UnifiedText'

export const ImageCounter: React.FC<{ count: number }> = ({ count }) => {
	const { border, padding } = useStyles()
	const colors = useThemeColor()

	return (
		<View
			style={[
				{
					backgroundColor: colors['background-header'],
				},
				styles.container,
				padding.small,
				border.radius.large,
			]}
		>
			<Icon name='plus' width={22} height={22} fill={colors['reverted-main-text']} />
			<UnifiedText
				style={{
					color: colors['reverted-main-text'],
					fontSize: 18,
				}}
			>
				{count}
			</UnifiedText>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
})
