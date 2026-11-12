import React, { useRef } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { useThemeColor } from '@berty/hooks'

import { UnifiedText } from '../../shared-components/UnifiedText'
import { DropdownPriv } from '../Dropdown.priv'
import { DropdownRef } from '../interfaces'

type Item = {
	label: string
	value: string
}

interface TextualDropdownProps {
	items: Item[]
	onChangeItem: (item: Item) => void
	placeholder: string
	testID?: string
}

export const TextualDropdown: React.FC<TextualDropdownProps> = props => {
	const childRef = useRef<DropdownRef>(null)
	const colors = useThemeColor()

	return (
		<View style={[styles.container, { backgroundColor: colors['input-background'] }]}>
			<DropdownPriv ref={childRef} placeholder={props.placeholder} testID={props.testID}>
				{props.items.map(item => (
					<TouchableOpacity
						activeOpacity={0.9}
						onPress={() => {
							props.onChangeItem(item)
							childRef.current?.toggleView?.()
						}}
						style={[styles.item, { borderTopColor: colors['secondary-background'] }]}
						key={`${item.label}-${item.value}`}
					>
						<UnifiedText>{item.label}</UnifiedText>
					</TouchableOpacity>
				))}
			</DropdownPriv>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		borderRadius: 14,
		flex: 1,
	},
	item: {
		height: 48,
		flexDirection: 'row',
		borderTopWidth: 1,
		paddingLeft: 15,
		paddingVertical: 12,
		paddingRight: 12,
		alignItems: 'center',
	},
})
