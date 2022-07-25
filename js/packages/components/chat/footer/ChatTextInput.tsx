import React from 'react'
import {
	View,
	Platform,
	StyleSheet,
	NativeSyntheticEvent,
	TextInputSelectionChangeEventData,
} from 'react-native'

import { InputPriv } from '@berty/components/inputs/Input.priv'
import { useStyles } from '@berty/contexts/styles'
import { useAppDispatch, useAppSelector, useThemeColor } from '@berty/hooks'
import {
	selectChatInputIsFocused,
	setChatInputIsFocused,
	setChatInputSelection,
} from '@berty/redux/reducers/chatInputsVolatile.reducer'
import { isTablet } from '@berty/utils/react-native/constants'

import { ChatInputProps } from './interface'
import { ReplyMessageBarPriv } from './reply/ReplyMessageBar.priv'

export const ChatTextInput: React.FC<ChatInputProps> = React.memo(props => {
	const { handleTabletSubmit, convPK, editable, placeholder, onChangeText, value } = props
	const { text, border, flex } = useStyles()
	const colors = useThemeColor()
	const dispatch = useAppDispatch()
	const isFocused = useAppSelector(state => selectChatInputIsFocused(state, convPK))

	const handleFocus = React.useCallback(
		(focus: boolean) => {
			dispatch(setChatInputIsFocused({ convPK, isFocused: focus }))
		},
		[dispatch, convPK],
	)

	const handleSelectionChange = React.useCallback(
		(e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
			if (isFocused) {
				dispatch(setChatInputSelection({ convPK, selection: e.nativeEvent.selection }))
			}
		},
		[convPK, dispatch, isFocused],
	)

	return (
		<View
			style={[
				flex.tiny,
				border.radius.medium,
				styles.container,
				{ backgroundColor: `${colors['positive-asset']}70` },
			]}
		>
			<ReplyMessageBarPriv convPK={convPK} />
			<InputPriv
				value={value}
				editable={editable}
				onChangeText={onChangeText}
				placeholder={placeholder}
				onSelectionChange={handleSelectionChange}
				multiline
				onBlur={() => handleFocus(false)}
				onFocus={() => handleFocus(true)}
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
