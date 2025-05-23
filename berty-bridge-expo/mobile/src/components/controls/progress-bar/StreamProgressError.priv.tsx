import React from 'react'
import { Button, StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useAppSelector, useRestartAfterClosing, useThemeColor } from '@berty/hooks'
import { useDeleteAccount } from '@berty/hooks'
import { selectSelectedAccount, selectStreamError } from '@berty/redux/reducers/ui.reducer'

const gutter = 50

export const StreamProgressErrorPriv: React.FC = () => {
	const streamError = useSelector(selectStreamError)
	const deleteAccount = useDeleteAccount()
	const restart = useRestartAfterClosing()
	const selectedAccount = useAppSelector(selectSelectedAccount)
	const colors = useThemeColor()

	return (
		<View
			style={[
				{
					padding: gutter,
				},
				styles.container,
			]}
		>
			<UnifiedText style={{ color: colors['warning-asset'] }}>{streamError.toString()}</UnifiedText>
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

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingBottom: 30,
		height: '100%',
		width: '100%',
	},
})
