import React from 'react'
import { StyleSheet, View } from 'react-native'

import { SmallInput } from '@berty/components'

import { DropdownPriv } from '../../Dropdown.priv'

interface LinkedIdentityProofServerDropdownProps {
	onChange: (val: string) => void
	value: string
}

export const LinkedIdentityProofServerDropdown: React.FC<LinkedIdentityProofServerDropdownProps> =
	props => {
		return (
			<DropdownPriv placeholder={'Debug tool: proof server URL'}>
				<View style={[styles.item]}>
					<SmallInput value={props.value} onChangeText={props.onChange} placeholder={''} />
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
