import { Icon } from '@ui-kitten/components'
import React, { useRef } from 'react'
import { StyleProp, TextInput, View, ViewStyle } from 'react-native'

import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useStyles } from '@berty/contexts/styles'

import { InputPriv } from '../Input.priv'
import { ResetInputPriv } from '../ResetInput.priv'
import { TouchableWrapperPriv } from './TouchableWrapper.priv'

interface InputPrivProps {
	style: StyleProp<ViewStyle>
	iconName?: string
	iconColor?: string
	value: string
	onChange: (text: string) => void
	placeholder?: string
	clearIcon?: boolean
}

export const TouchableWrapperWithIconPriv: React.FC<InputPrivProps> = props => {
	const { row, margin } = useStyles()

	const input = useRef<TextInput>(null)

	const getIconColor = (): string => {
		// console.log('isFocused', input.current?.isFocused())
		if (props.value.length > 0) {
			return '#393C63'
		}
		if (props.iconColor) {
			return props.iconColor
		}

		// disabled
		return '#D0D0D6'
	}

	return (
		<TouchableWrapperPriv
			style={[
				{
					flex: 12,
					flexDirection: 'row',
					justifyContent: 'flex-start',
					alignItems: 'center',
				},
				props.style,
			]}
			onPress={() => input.current?.focus()}
		>
			<View style={[row.center]}>
				<Icon
					name={props.iconName ?? 'search-outline'}
					fill={getIconColor()}
					width={25}
					height={25}
				/>
			</View>

			<View
				style={[
					margin.left.small,
					{
						flex: 6,
						flexDirection: 'row',
						alignItems: 'flex-start',
					},
				]}
			>
				<InputPriv
					ref={input}
					value={props.value}
					onChange={props.onChange}
					placeholder={props.placeholder}
				/>
			</View>

			{props.value?.length > 0 && props.clearIcon && (
				<ResetInputPriv onPress={() => props.onChange('')} />
			)}
		</TouchableWrapperPriv>
	)
}
