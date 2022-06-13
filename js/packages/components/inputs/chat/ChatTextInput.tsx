import React from 'react'
import { View, Platform, StyleSheet } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/store'
import { isTablet } from '@berty/utils/react-native/constants'

import { InputPriv } from '../Input.priv'
import { ChatInputProps } from './interface'
import { ReplyMessageBar } from './reply/ReplyMessageBar.priv'

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
				editable={editable}
				onChangeText={onChangeText}
				placeholder={placeholder}
				onSelectionChange={onSelectionChange}
				multiline
				onBlur={() => {
					setIsFocused(false)
					onFocusChange(false)
				}}
				onFocus={() => {
					setIsFocused(true)
					onFocusChange(true)
				}}
				blurOnSubmit={false}
				style={[
					text.light,
					styles.input,
					{ color: !editable ? colors['secondary-text'] : colors['main-text'] },
				]}
				placeholderTextColor={isFocused ? colors['main-text'] : colors['secondary-text']}
				returnKeyType={isTablet ? 'send' : 'default'}
				onSubmitEditing={() => {
					if (isTablet) {
						handleTabletSubmit()
					}
				}}
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
	input: { maxHeight: 150, fontFamily: 'Open Sans' },
})
