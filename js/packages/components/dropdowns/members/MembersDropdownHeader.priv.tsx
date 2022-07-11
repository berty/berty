import React from 'react'
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

	return (
		<View style={[margin.horizontal.medium]}>
			<SmallClearableInput
				value={inputValue}
				onChangeText={setInputValue}
				placeholder='Search member'
				iconName='search-outline'
			/>
		</View>
	)
}
