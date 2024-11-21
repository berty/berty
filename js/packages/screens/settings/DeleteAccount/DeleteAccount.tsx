import { useNavigation as useReactNavigation } from '@react-navigation/core'
import { Layout } from '@ui-kitten/components'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, StatusBar, Vibration } from 'react-native'

import { ErrorCard, SmallInput } from '@berty/components'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor, useDeletingAccountAfterClosing } from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'

export const DeleteAccount: ScreenFC<'Settings.DeleteAccount'> = () => {
	const { padding, margin } = useStyles()
	const _styles = _useStyles()
	const [deleteConfirmation, setDeleteConfirmation] = useState('')
	const colors = useThemeColor()
	const { t } = useTranslation()
	const deletingAccountAfterClosing = useDeletingAccountAfterClosing()
	const navigation = useReactNavigation()

	// this is the translated string (of "delete"), that we have to compare with the input
	const DELETE_STR = t('settings.delete-account.delete-button').toLowerCase()

	return (
		<Layout style={_styles.layout}>
			<StatusBar backgroundColor={colors['secondary-background-header']} barStyle='light-content' />
			<ErrorCard
				title={t('settings.delete-account.title')}
				description={t('settings.delete-account.first-desc')}
				onClose={() => navigation.goBack()}
				onConfirm={() => {
					if (deleteConfirmation === DELETE_STR) {
						Vibration.vibrate(500)
						deletingAccountAfterClosing()
					}
				}}
			>
				<View style={[padding.horizontal.medium, padding.bottom.medium]}>
					<UnifiedText style={_styles.light}>
						<UnifiedText style={_styles.light}>
							{t('settings.delete-account.desc-please')}
						</UnifiedText>
						<UnifiedText style={_styles.bold}>
							{t('settings.delete-account.desc-delete')}
						</UnifiedText>
						<UnifiedText style={_styles.light}>
							{t('settings.delete-account.desc-confirm')}
						</UnifiedText>
					</UnifiedText>
				</View>
				<View style={[margin.vertical.medium]}>
					<SmallInput
						value={deleteConfirmation}
						onChangeText={setDeleteConfirmation}
						autoCapitalize='none'
						autoCorrect={false}
					/>
				</View>
			</ErrorCard>
		</Layout>
	)
}

const _useStyles = () => {
	const { text } = useStyles()
	const colors = useThemeColor()

	return {
		layout: { backgroundColor: '#E35179', flex: 1 },
		light: [text.light, text.align.center, { color: colors['secondary-background-header'] }],
		bold: [text.bold, text.align.center, { color: colors['secondary-background-header'] }],
	}
}
