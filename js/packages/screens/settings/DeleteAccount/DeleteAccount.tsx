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

const DELETE_STR = 'delete'

export const DeleteAccount: ScreenFC<'Settings.DeleteAccount'> = () => {
	const { padding, text, margin } = useStyles()
	const [deleteConfirmation, setDeleteConfirmation] = useState('')
	const colors = useThemeColor()
	const { t } = useTranslation()
	const deletingAccountAfterClosing = useDeletingAccountAfterClosing()
	const navigation = useReactNavigation()

	return (
		<Layout style={{ backgroundColor: '#E35179', flex: 1 }}>
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
					<UnifiedText
						style={[
							text.align.center,
							text.light,
							{ color: colors['secondary-background-header'] },
						]}
					>
						{t('settings.delete-account.desc')}
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
