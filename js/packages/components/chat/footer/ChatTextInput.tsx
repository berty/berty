import React, { ComponentProps } from 'react'
import { NativeModules, TextInput, View, Text, Platform } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Icon } from '@ui-kitten/components'
import { TouchableOpacity } from 'react-native-gesture-handler'

import { Maybe, useThemeColor } from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'
import { useAppDispatch, useAppSelector, useInteractionAuthor } from '@berty-tech/react-redux'
import {
	removeActiveReplyInteraction,
	selectActiveReplyInteraction,
} from '@berty-tech/redux/reducers/chatInputs.reducer'

import { getMediaTypeFromMedias } from '../../utils'

const {
	PlatformConstants: { interfaceIdiom: deviceType },
} = NativeModules

const isTablet = deviceType === 'pad'

export const ReplyMessageBar: React.FC<{ convPK: string }> = ({ convPK }) => {
	const [{ border, text }] = useStyles()
	const colors = useThemeColor()
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const activeReplyInteraction = useAppSelector(state =>
		selectActiveReplyInteraction(state, convPK),
	)
	const replyTargetAuthor = useInteractionAuthor(
		activeReplyInteraction?.conversationPublicKey || '',
		activeReplyInteraction?.cid || '',
	)

	if (!activeReplyInteraction) {
		return null
	}

	return (
		<View
			style={[
				border.radius.top.medium,
				{
					backgroundColor: activeReplyInteraction?.backgroundColor,
					paddingVertical: 4,
					paddingLeft: 10,
					paddingRight: 18,
					zIndex: 0,
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
				},
			]}
		>
			<View
				style={{
					position: 'absolute',
					top: -20,
					alignSelf: 'center',
					backgroundColor: colors['input-background'],
					borderColor: colors['positive-asset'],
					paddingVertical: 2,
					paddingHorizontal: 20,
					borderWidth: 1,
					borderRadius: 20,
				}}
			>
				<Text numberOfLines={1} style={[text.size.tiny, { color: colors['background-header'] }]}>
					{t('chat.reply.replying-to')} {replyTargetAuthor?.displayName || ''}
				</Text>
			</View>

			{activeReplyInteraction?.payload?.body ? (
				<Text
					numberOfLines={1}
					style={[
						text.size.small,
						{
							color: activeReplyInteraction?.textColor,
							lineHeight: 17,
						},
					]}
				>
					{activeReplyInteraction?.payload?.body}
				</Text>
			) : (
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<Icon
						name='attach-outline'
						height={15}
						width={15}
						fill={activeReplyInteraction?.textColor}
						style={{ marginTop: 4 }}
					/>
					<Text
						numberOfLines={1}
						style={[
							text.size.small,
							{
								color: activeReplyInteraction?.textColor,
								lineHeight: 17,
								marginLeft: 10,
							},
						]}
					>
						{t(`medias.${getMediaTypeFromMedias(activeReplyInteraction?.medias)}`)}
					</Text>
				</View>
			)}
			<TouchableOpacity
				onPress={() => {
					dispatch(removeActiveReplyInteraction({ convPK }))
				}}
			>
				<Icon
					name='plus'
					height={18}
					width={18}
					fill={activeReplyInteraction?.textColor}
					style={{ marginTop: 2, transform: [{ rotate: '45deg' }] }}
				/>
			</TouchableOpacity>
		</View>
	)
}

export const ChatTextInput: React.FC<{
	value?: string | undefined
	onChangeText?: ComponentProps<typeof TextInput>['onChangeText']
	onSelectionChange?: ComponentProps<typeof TextInput>['onSelectionChange']
	disabled?: Maybe<boolean>
	handleTabletSubmit?: Maybe<() => void>
	placeholder?: Maybe<string>
	onFocusChange?: Maybe<(val: boolean) => void>
	convPK: string
}> = React.memo(
	({
		disabled,
		handleTabletSubmit,
		placeholder,
		onFocusChange,
		value,
		onChangeText,
		onSelectionChange,
		convPK,
	}) => {
		const [{ text }, { scaleSize }] = useStyles()
		const colors = useThemeColor()
		const [isFocused, setIsFocused] = React.useState<boolean>(false)

		return (
			<View
				style={{
					// we need to wrap the text input to provide stable vertical padding
					backgroundColor: `${colors['positive-asset']}70`,
					paddingHorizontal: Platform.OS == 'ios' ? undefined : 12 * scaleSize,
					padding: Platform.OS === 'ios' ? 12 * scaleSize : undefined,
					paddingTop: Platform.OS === 'ios' ? 7 * scaleSize : undefined,
					borderRadius: 15 * scaleSize,
					flex: 1,
				}}
			>
				<ReplyMessageBar convPK={convPK} />
				<TextInput
					value={value}
					multiline
					editable={!disabled}
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
						text.bold.small,
						{
							maxHeight: 150 * scaleSize,
							color: disabled ? colors['secondary-text'] : colors['main-text'],
							fontFamily: 'Open Sans',
						},
					]}
					placeholder={placeholder || undefined}
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
	},
)
