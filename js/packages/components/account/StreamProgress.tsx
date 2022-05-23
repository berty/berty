import React from 'react'
import { ActivityIndicator, Button, View, Platform } from 'react-native'
import * as Progress from 'react-native-progress'
import { useSelector } from 'react-redux'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useStyles } from '@berty/contexts/styles'
import { useAppSelector, useRestartAfterClosing } from '@berty/hooks'
import { useDeleteAccount } from '@berty/hooks'
import {
	selectSelectedAccount,
	selectStreamError,
	selectStreamProgress,
} from '@berty/redux/reducers/ui.reducer'
import { useThemeColor } from '@berty/store'

const StreamProgressCmp: React.FC = () => {
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

const gutter = 50

export const StreamProgress: React.FC = () => {
	const streamInProgress = useSelector(selectStreamProgress)
	const streamError = useSelector(selectStreamError)
	const deleteAccount = useDeleteAccount()
	const restart = useRestartAfterClosing()
	const selectedAccount = useAppSelector(selectSelectedAccount)

	const colors = useThemeColor()

	if (streamError && !streamInProgress) {
		return (
			<View
				style={[
					{
						padding: gutter,
						alignItems: 'center',
						justifyContent: 'center',
						paddingBottom: 30,
						height: '100%',
						width: '100%',
					},
				]}
			>
				<UnifiedText style={{ color: colors['warning-asset'] }}>
					{streamError.toString()}
				</UnifiedText>
				<UnifiedText style={{ marginTop: gutter }}>
					Likely couldn't connect to the node, or the connection dropped
				</UnifiedText>
				<View style={{ marginTop: gutter }}>
					<Button onPress={() => restart()} title='Restart' />
				</View>
				<View style={{ marginTop: gutter }}>
					<Button onPress={() => deleteAccount(selectedAccount)} title='Delete account' />
				</View>
			</View>
		)
	}
	return <StreamProgressCmp />
}
