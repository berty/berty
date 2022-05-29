import { useNavigation as useReactNavigation } from '@react-navigation/core'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Vibration } from 'react-native'

import {
	ErrorButtonIconLeft,
	HorizontalButtons,
	SmallInput,
	TertiaryButtonIconLeft,
} from '@berty/components'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useDeletingAccountAfterClosing } from '@berty/hooks'
import { useThemeColor } from '@berty/store'

import { DeleteAccountError } from './DeleteAccountError'

const DELETE_STR = 'delete'

export const DeleteAccountContent: React.FC<{}> = () => {
	const { margin, padding, text, column } = useStyles()
	const colors = useThemeColor()
	const navigation = useReactNavigation()
	const { t }: any = useTranslation()
	const [deleteConfirmation, setDeleteConfirmation] = useState<string>()
	const confirmed = deleteConfirmation === DELETE_STR
	const deletingAccountAfterClosing = useDeletingAccountAfterClosing()

	return (
		<>
			<DeleteAccountError error={t('settings.delete-account.first-desc')} />
			<View style={[padding.horizontal.medium, padding.bottom.medium]}>
				<UnifiedText
					style={[text.align.center, text.light, { color: colors['secondary-background-header'] }]}
				>
					{t('settings.delete-account.desc')}
				</UnifiedText>
			</View>
			<View style={[column.justify]}>
				<SmallInput
					autoCorrect={false}
					autoCapitalize='none'
					value={deleteConfirmation}
					onChangeText={setDeleteConfirmation}
				/>

				<View style={[margin.top.large, margin.horizontal.medium]}>
					<HorizontalButtons>
						<TertiaryButtonIconLeft name='arrow-back-outline' onPress={() => navigation.goBack()}>
							{t('settings.delete-account.cancel-button')}
						</TertiaryButtonIconLeft>
						<ErrorButtonIconLeft
							name='close'
							disabled={!confirmed}
							onPress={() => {
								Vibration.vibrate(500)
								deletingAccountAfterClosing()
							}}
						>
							{t('settings.delete-account.delete-button')}
						</ErrorButtonIconLeft>
					</HorizontalButtons>
				</View>
			</View>
		</>
	)
}
