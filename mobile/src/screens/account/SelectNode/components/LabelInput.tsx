import React from 'react'
import { View } from 'react-native'

import { SmallInput } from '@berty/components'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'

interface ILabelInputProps {
	label: string
	value: string
	onChangeText: (value: string) => void
	placeholder: string
}

export const LabelInput: React.FC<ILabelInputProps> = ({
	label,
	value,
	onChangeText,
	placeholder,
}) => {
	const { row, column, margin, flex } = useStyles()

	return (
		<View style={[row.center]}>
			<View style={[row.item.justify, column.justify]}>
				<UnifiedText style={[margin.left.medium, row.item.justify]}>{label}</UnifiedText>
			</View>
			<View style={[margin.left.medium, flex.tiny, row.item.justify]}>
				<SmallInput
					value={value}
					onChangeText={onChangeText}
					placeholder={placeholder}
					autoCorrect={false}
					textAlign={'right'}
				/>
			</View>
		</View>
	)
}
