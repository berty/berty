import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, StyleSheet, StatusBar } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { ScreenFC } from '@berty/navigation'
import { useThemeColor } from '@berty/store'

import { DeleteAccountContent } from './components/DeleteAccountContent'
import { DeleteAccountHeader } from './components/DeleteAccountHeader'

export const DeleteAccount: ScreenFC<'Settings.DeleteAccount'> = () => {
	const [layout, setLayout] = useState(0)
	const { padding, border } = useStyles()
	const colors = useThemeColor()
	const { t }: any = useTranslation()

	return (
		<View
			style={[
				padding.medium,
				{
					justifyContent: 'center',
					height: '100%',
					backgroundColor: colors['secondary-background-header'],
				},
			]}
		>
			<StatusBar backgroundColor={colors['secondary-background-header']} barStyle='light-content' />
			<View
				onLayout={e => !layout && setLayout(e.nativeEvent.layout.height)}
				style={[
					padding.medium,
					border.radius.medium,
					{ backgroundColor: colors['main-background'] },
					layout && { height: layout - 70 },
				]}
			>
				<View style={[_deleteAccountStyles.body]}>
					<DeleteAccountHeader title={t('settings.delete-account.title')} />
					<DeleteAccountContent />
				</View>
			</View>
		</View>
	)
}

const _deleteAccountStyles = StyleSheet.create({
	body: {
		bottom: 78,
	},
})
