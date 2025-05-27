import React from 'react'
import { StyleSheet, View } from 'react-native'

import { DividerItem, MenuToggle, SmallInput } from '@berty/components'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'

import { DropdownPriv } from '../Dropdown.priv'

type AddrCapabilitiesValue = { address: string; capabilities: string[] }

interface DebugServersAddrCapabilitiesProps {
	onChange: (val: AddrCapabilitiesValue[]) => void
	values: AddrCapabilitiesValue[]
	possibleCapabilities: { [key: string]: string }
	dropdownTitle: string
}

export const DebugServersAddrCapabilities: React.FC<DebugServersAddrCapabilitiesProps> = props => {
	return (
		<>
			{props.values.map((value, idx) => (
				<View style={styles.item} key={idx}>
					<DropdownPriv placeholder={props.dropdownTitle}>
						<DividerItem />
						<View style={[]}>
							<SmallInput
								value={value.address}
								onChangeText={newAddress => {
									const newValues = [...props.values]
									newValues[idx].address = newAddress
									return props.onChange(newValues)
								}}
							/>
						</View>
						<View>
							{Object.entries(props.possibleCapabilities).map(([_, possibleCapabilityValue]) => {
								return (
									<MenuToggle
										isToggleOn={value.capabilities.indexOf(possibleCapabilityValue) !== -1}
										onToggle={() => {
											const toggledOn = value.capabilities.indexOf(possibleCapabilityValue) !== -1
											const newValues = [...props.values]

											if (toggledOn) {
												newValues[idx].capabilities = newValues[idx].capabilities.filter(
													value => value !== possibleCapabilityValue,
												)
											} else if (!toggledOn) {
												newValues[idx].capabilities = [
													...newValues[idx].capabilities,
													possibleCapabilityValue,
												]
											}

											props.onChange(newValues)
										}}
										key={possibleCapabilityValue}
									>
										<UnifiedText>{possibleCapabilityValue}</UnifiedText>
									</MenuToggle>
								)
							})}
						</View>
					</DropdownPriv>
				</View>
			))}
		</>
	)
}
const styles = StyleSheet.create({
	item: {
		flexDirection: 'column',
		alignItems: 'center',
		paddingLeft: 32,
		paddingVertical: 12,
		paddingRight: 12,
		flex: 1,
	},
})
