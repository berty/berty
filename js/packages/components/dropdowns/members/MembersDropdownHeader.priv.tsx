import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import { SmallClearableInput } from '@berty/components'
import { useStyles } from '@berty/contexts/styles'

interface MembersDropdownHeaderProps {
	inputValue: string
	setInputValue: (value: string) => void
}

export const MembersDropdownHeader: React.FC<MembersDropdownHeaderProps> = ({
	inputValue,
	setInputValue,
}) => {
	const { margin } = useStyles()
	const { t } = useTranslation()

	return (
		<View style={[margin.horizontal.medium]}>
			<SmallClearableInput
				value={inputValue}
				onChangeText={setInputValue}
				placeholder={t('chat.multi-member-settings.members-dropdown.search-placeholder')}
				iconName='search-outline'
			/>
		</View>
	)
}
