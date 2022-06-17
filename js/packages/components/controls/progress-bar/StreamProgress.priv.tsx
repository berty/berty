import React from 'react'
import { ActivityIndicator, View, Platform, StyleSheet } from 'react-native'
import * as Progress from 'react-native-progress'
import { useSelector } from 'react-redux'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { selectStreamProgress } from '@berty/redux/reducers/ui.reducer'
import { useThemeColor } from '@berty/store'

import { StreamProgressProps } from './interfaces'

export const StreamProgressPriv: React.FC<StreamProgressProps> = props => {
	const { text } = useStyles()
	const colors = useThemeColor()
	const stream = useSelector(selectStreamProgress)

	return (
		<View
			style={{ backgroundColor: colors['main-background'], flex: 1 }}
			accessibilityLabel={props.accessibilityLabel}
		>
			<UnifiedText style={[text.align.center, styles.title]}>
				{stream?.stream || 'Test'}
			</UnifiedText>
			<View style={styles.content}>
				<UnifiedText style={[text.align.center]}>{stream?.msg.doing || 'Doing'}</UnifiedText>
				<UnifiedText style={[text.align.center]}>
					{stream?.msg.completed || '0'} / {stream?.msg.total || '6'}
				</UnifiedText>
				{Platform.OS === 'web' ? (
					<ActivityIndicator size='large' />
				) : (
					<Progress.Bar progress={stream?.msg.progress || 0} width={200} color='#3946E1' />
				)}
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	title: {
		position: 'absolute',
		top: 60,
		left: 0,
		right: 0,
	},
	content: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
})
