import React, { ForwardedRef, forwardRef, ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'

import { DropdownPriv } from '../Dropdown.priv'
import { DropdownRef } from '../interfaces'
import { NetworkProps } from './interfaces'

interface NetworkDropdownPrivProps extends NetworkProps {
	placeholder: string
	icon?: 'earth' | 'privacy'
	children: ReactNode
}

export const NetworkDropdownPriv = forwardRef(
	(props: NetworkDropdownPrivProps, ref: ForwardedRef<DropdownRef>) => {
		const { border, margin } = useStyles()
		const colors = useThemeColor()

		return (
			<View
				style={[
					styles.container,
					margin.top.medium,
					border.shadow.medium,
					{ shadowColor: colors.shadow },
				]}
			>
				<DropdownPriv
					icon={props.icon}
					ref={ref}
					placeholder={props.placeholder}
					accessibilityLabel={props.accessibilityLabel}
				>
					{props.children}
				</DropdownPriv>
			</View>
		)
	},
)

const styles = StyleSheet.create({
	container: {
		borderRadius: 14,
		flex: 1,
		backgroundColor: '#F7F8FE',
	},
})
