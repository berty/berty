import React, { useRef } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { UnifiedText } from '../../shared-components/UnifiedText'
import { DropdownPriv } from '../Dropdown.priv'

type Item = {
	label: string
	value: string
}

interface TextualDropdownProps {
	items: Item[]
	onChangeItem: (item: Item) => void
	placeholder: string
}

export const TextualDropdown: React.FC<TextualDropdownProps> = props => {
	const childRef = useRef<{ toggleView: () => void }>()

	return (
		<View style={styles.container}>
			<DropdownPriv ref={childRef} placeholder={props.placeholder}>
				{props.items.map(item => (
					<TouchableOpacity
						activeOpacity={0.9}
						onPress={() => {
							props.onChangeItem(item)
							childRef.current?.toggleView()
						}}
						style={styles.item}
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
		backgroundColor: '#F7F8FE',
	},
	item: {
		height: 48,
		flexDirection: 'row',
		borderTopWidth: 1,
		borderTopColor: '#F0F0F7',
		paddingLeft: 15,
		paddingVertical: 12,
		paddingRight: 12,
		alignItems: 'center',
	},
})
