import { Icon } from '@ui-kitten/components'
import React from 'react'
import { TouchableOpacity, TouchableOpacityProps, View, ActivityIndicator } from 'react-native'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'

const chatInputButtonSizeMultiplier = 36

export const ChatInputButton: React.FC<{
	iconName: string
	iconPack?: string
	onPress?: TouchableOpacityProps['onPress']
	iconRatio?: number
	disabled?: boolean
	vOffset?: number
	loading?: boolean
}> = React.memo(({ onPress, disabled, iconName, iconPack, iconRatio, vOffset, loading }) => {
	const colors = useThemeColor()
	const size = chatInputButtonSizeMultiplier

	if (iconRatio === undefined) {
		iconRatio = 0.5
	}
	const iconSize = iconRatio * size

	const style: TouchableOpacityProps['style'] = React.useMemo(
		() => ({
			alignItems: 'center',
			justifyContent: 'center',
			width: size,
			height: size,
			backgroundColor: disabled ? colors['secondary-text'] : colors['background-header'],
			borderRadius: (size || 0) / 2,
		}),
		[disabled, size, colors],
	)

	return (
		<TouchableOpacity style={style} disabled={disabled} onPress={onPress}>
			<View style={vOffset && vOffset > 0 ? { paddingBottom: vOffset } : undefined}>
				{loading ? (
					<ActivityIndicator size='small' color={colors['reverted-main-text']} />
				) : (
					<Icon
						name={iconName}
						pack={iconPack}
						width={iconSize}
						height={iconSize}
						fill={colors['reverted-main-text']}
					/>
				)}
			</View>
		</TouchableOpacity>
	)
})

export const SendButton: React.FC<{
	onPress?: TouchableOpacityProps['onPress']
	disabled?: boolean
	loading?: boolean
}> = React.memo(props => (
	<ChatInputButton iconName='paper-plane-outline' iconRatio={0.56} {...props} />
))

export const RecordButton: React.FC<{
	onPress?: TouchableOpacityProps['onPress']
	disabled?: boolean
}> = React.memo(props => (
	<ChatInputButton iconName='microphone-footer' iconPack='custom' iconRatio={0.5} {...props} />
))

export const MoreButton: React.FC<{
	n?: number
	onPress?: TouchableOpacityProps['onPress']
	disabled?: boolean
}> = React.memo(({ n, onPress, disabled }) => {
	const colors = useThemeColor()
	const { padding, border } = useStyles()

	return (
		<TouchableOpacity
			style={[
				{
					backgroundColor: colors['input-background'],
					width: chatInputButtonSizeMultiplier,
					height: chatInputButtonSizeMultiplier,
					justifyContent: 'center',
					alignItems: 'center',
				},
				padding.small,
				border.radius.small,
			]}
			onPress={onPress}
			disabled={disabled}
		>
			{!!n && <UnifiedText>{n}</UnifiedText>}
			<Icon name='plus' width={26} height={26} fill={colors['secondary-text']} />
		</TouchableOpacity>
	)
})
