import React from 'react'
import { TextInputProps, View, Platform, StyleSheet } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { Maybe, useThemeColor } from '@berty/store'
import { isTablet } from '@berty/utils/react-native/constants'

import { InputPriv } from '../Input.priv'
import { ReplyMessageBar } from './reply/ReplyMessageBar.priv'

interface ChatInputProps extends TextInputProps {
	handleTabletSubmit: Maybe<() => void>
	onFocusChange: Maybe<(val: boolean) => void>
	convPK: string
}

export const ChatTextInput: React.FC<ChatInputProps> = React.memo(props => {
	const {
		handleTabletSubmit,
		onFocusChange,
		convPK,
		editable,
		placeholder,
		onChangeText,
		value,
		onSelectionChange,
	} = props
	const { text, border, flex } = useStyles()
	const colors = useThemeColor()
	const [isFocused, setIsFocused] = React.useState<boolean>(false)

	return (
		<View
			style={[
				flex.tiny,
				border.radius.medium,
				styles.container,
				{ backgroundColor: `${colors['positive-asset']}70` },
			]}
		>
			<ReplyMessageBar convPK={convPK} />
			<InputPriv
				value={value}
				multiline
				editable={editable}
				onBlur={() => {
					setIsFocused(false)
					if (typeof onFocusChange === 'function') {
						onFocusChange(false)
					}
				}}
				onFocus={() => {
					setIsFocused(true)
					if (typeof onFocusChange === 'function') {
						onFocusChange(true)
					}
				}}
				blurOnSubmit={false}
				onChangeText={onChangeText}
				style={[
					text.light,
					styles.input,
					{ color: !editable ? colors['secondary-text'] : colors['main-text'] },
				]}
				placeholder={placeholder}
				placeholderTextColor={isFocused ? colors['main-text'] : colors['secondary-text']}
				returnKeyType={isTablet ? 'send' : 'default'}
				onSubmitEditing={() => {
					if (isTablet && typeof handleTabletSubmit === 'function') {
						handleTabletSubmit()
					}
				}}
				onSelectionChange={onSelectionChange}
			/>
		</View>
	)
})

const styles = StyleSheet.create({
	container: {
		// we need to wrap the text input to provide stable vertical padding
		paddingHorizontal: Platform.OS === 'ios' ? undefined : 12,
		padding: Platform.OS === 'ios' ? 12 : undefined,
		paddingTop: Platform.OS === 'ios' ? 7 : undefined,
	},
	input: {
		maxHeight: 150,
		fontFamily: 'Open Sans',
	},
})
