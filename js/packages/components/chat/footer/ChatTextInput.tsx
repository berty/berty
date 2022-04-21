import React, { ComponentProps } from 'react'
import { TextInput, View, Platform } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Icon } from '@ui-kitten/components'
import { TouchableOpacity } from 'react-native-gesture-handler'

import { Maybe, useThemeColor } from '@berty/store'
import { useStyles } from '@berty/contexts/styles'
import { useAppDispatch, useAppSelector, useInteractionAuthor } from '@berty/hooks'
import {
	removeActiveReplyInteraction,
	selectActiveReplyInteraction,
} from '@berty/redux/reducers/chatInputs.reducer'
import { isTablet } from '@berty/rnutil/constants'

import { getMediaTypeFromMedias } from '../../utils'
import { UnifiedText } from '../../shared-components/UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

const ReplyMessageBar: React.FC<{ convPK: string }> = ({ convPK }) => {
	const { border, text } = useStyles()
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
				<UnifiedText
					numberOfLines={1}
					style={[text.size.tiny, { color: colors['background-header'] }]}
				>
					{t('chat.reply.replying-to')} {replyTargetAuthor?.displayName || ''}
				</UnifiedText>
			</View>

			{activeReplyInteraction?.payload?.body ? (
				<UnifiedText
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
				</UnifiedText>
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
					<UnifiedText
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
						{/* Ignore check for i18n missing keys
							chat.shared-medias.file
							chat.shared-medias.picture
							chat.shared-medias.audio
						*/}
						{t(`chat.shared-medias.${getMediaTypeFromMedias(activeReplyInteraction?.medias)}`)}
					</UnifiedText>
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
		const { text } = useStyles()
		const { scaleSize } = useAppDimensions()
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
						text.light,
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
