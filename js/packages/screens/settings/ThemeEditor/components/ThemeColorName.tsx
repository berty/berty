import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'

import { ActionModal } from '@berty/components'
import { SmallInput } from '@berty/components'
import { saveTheme } from '@berty/redux/reducers/theme.reducer'

export const ThemeColorName: React.FC<{ closeModal: () => void }> = ({ closeModal }) => {
	const dispatch = useDispatch()
	const { t } = useTranslation()
	const [themeName, setThemeName] = useState<string>('')

	return (
		<ActionModal
			onClose={closeModal}
			onConfirm={() => {
				dispatch(saveTheme({ themeName }))
				closeModal()
			}}
			title={`🎨 ${t('modals.save-theme.title')}`}
			description={t('modals.save-theme.desc')}
			cancelText={t('modals.save-theme.cancel')}
			confirmText={t('modals.save-theme.add')}
		>
			<SmallInput
				value={themeName}
				onChangeText={setThemeName}
				placeholder={t('modals.save-theme.placeholder')}
			/>
		</ActionModal>
	)
}
