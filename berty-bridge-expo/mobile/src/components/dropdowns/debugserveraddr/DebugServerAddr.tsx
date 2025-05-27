import React from 'react'
import { StyleSheet, View } from 'react-native'

import { SmallInput } from '@berty/components'

import { DropdownPriv } from '../Dropdown.priv'

interface DebugServerAddrProps {
	onChange: (val: string) => void
	value: string
	dropdownTitle: string
}

export const DebugServerAddr: React.FC<DebugServerAddrProps> = props => {
	return (
		<DropdownPriv placeholder={props.dropdownTitle}>
			<View style={[styles.item]}>
				<SmallInput value={props.value} onChangeText={props.onChange} />
			</View>
		</DropdownPriv>
	)
}

const styles = StyleSheet.create({
	item: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingLeft: 32,
		paddingVertical: 12,
		paddingRight: 12,
		flex: 1,
	},
})
