import React, { ComponentProps } from 'react'
import { NativeModules, TextInput, View, Text, Platform } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Icon } from '@ui-kitten/components'

import { Maybe, useContact, useThemeColor } from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'
import { getMediaTypeFromMedias } from '@berty-tech/components/utils'

import { useReplyReaction } from '../ReplyReactionContext'
import { TouchableOpacity } from 'react-native-gesture-handler'

const {
	PlatformConstants: { interfaceIdiom: deviceType },
} = NativeModules

const isTablet = deviceType === 'pad'

export const ReplyMessageBar: React.FC = () => {
	const [{ border }] = useStyles()
	const colors = useThemeColor()
	const { t }: { t: any } = useTranslation()

	const { activeReplyInte, setActiveReplyInte } = useReplyReaction()

	const replyTargetContact = useContact(activeReplyInte?.conversation?.contactPublicKey)
	const replyTargetMember = React.useMemo(() => {
		return replyTargetContact || activeReplyInte?.member
	}, [replyTargetContact, activeReplyInte?.member])

	if (!activeReplyInte) {
		return null
	}

	return (
		<View
			style={[
				border.radius.top.medium,
				{
					backgroundColor: activeReplyInte?.backgroundColor,
					paddingVertical: 4,
					paddingHorizontal: 10,
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
				<Text numberOfLines={1} style={{ color: colors['background-header'], fontSize: 10 }}>
					{t('chat.reply.replying-to')} {replyTargetMember?.displayName || ''}
				</Text>
			</View>

			{activeReplyInte?.payload?.body ? (
				<Text
					numberOfLines={1}
					style={{
						color: activeReplyInte?.textColor,
						fontSize: 12,
						lineHeight: 17,
					}}
				>
					{activeReplyInte?.payload?.body}
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
						fill={activeReplyInte?.textColor}
						style={{ marginTop: 4 }}
					/>
					<Text
						numberOfLines={1}
						style={{
							color: activeReplyInte?.textColor,
							fontSize: 12,
							lineHeight: 17,
							marginLeft: 10,
						}}
					>
						{t(`medias.${getMediaTypeFromMedias(activeReplyInte?.medias)}`)}
					</Text>
				</View>
			)}
			<TouchableOpacity onPress={() => setActiveReplyInte()}>
				<Icon
					name='plus'
					height={18}
					width={18}
					fill={activeReplyInte?.textColor}
					style={{ marginTop: 4, transform: [{ rotate: '45deg' }] }}
				/>
			</TouchableOpacity>
		</View>
	)
}

export const ChatTextInput: React.FC<{
	value?: string | undefined
	onChangeText?: ComponentProps<typeof TextInput>['onChangeText']
	disabled?: Maybe<boolean>
	handleTabletSubmit?: Maybe<() => void>
	placeholder?: Maybe<string>
	onFocusChange?: Maybe<(val: boolean) => void>
}> = React.memo(
	({ disabled, handleTabletSubmit, placeholder, onFocusChange, value, onChangeText }) => {
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
				<ReplyMessageBar />
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
					autoCorrect={false}
					placeholder={placeholder || undefined}
					placeholderTextColor={isFocused ? colors['main-text'] : colors['secondary-text']}
					returnKeyType={isTablet ? 'send' : 'default'}
					onSubmitEditing={() => {
						if (isTablet && typeof handleTabletSubmit === 'function') {
							handleTabletSubmit()
						}
					}}
				/>
			</View>
		)
	},
)
