import React from 'react'
import { ActivityIndicator, View, Platform } from 'react-native'
import * as Progress from 'react-native-progress'
import { useSelector } from 'react-redux'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useStyles } from '@berty/contexts/styles'
import { selectStreamProgress } from '@berty/redux/reducers/ui.reducer'
import { useThemeColor } from '@berty/store'

export const StreamProgressPriv: React.FC = () => {
	const { text } = useStyles()
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	const stream = useSelector(selectStreamProgress)

	return (
		<View style={{ backgroundColor: colors['main-background'], flex: 1 }}>
			<UnifiedText
				style={[
					text.align.center,
					{
						position: 'absolute',
						top: 60 * scaleSize,
						left: 0,
						right: 0,
					},
				]}
			>
				{stream?.stream || 'Test'}
			</UnifiedText>
			<View
				style={{
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
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
