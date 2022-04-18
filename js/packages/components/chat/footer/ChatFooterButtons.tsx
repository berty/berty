import React from 'react'
import { TouchableOpacity, TouchableOpacityProps, View, ActivityIndicator } from 'react-native'
import { Icon } from '@ui-kitten/components'

import { useThemeColor } from '@berty/store'
import { useStyles } from '@berty/contexts/styles'
import { UnifiedText } from '../../shared-components/UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

const chatInputButtonSizeMultiplier = 36

const ChatInputButton: React.FC<{
	iconName: string
	iconPack?: string
	onPress?: TouchableOpacityProps['onPress']
	size?: number
	iconRatio?: number
	disabled?: boolean
	vOffset?: number
	loading?: boolean
}> = React.memo(({ onPress, disabled, iconName, iconPack, size, iconRatio, vOffset, loading }) => {
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()

	if (size === undefined) {
		size = chatInputButtonSizeMultiplier * scaleSize
	}
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
			<View style={vOffset && vOffset > 0 ? { paddingBottom: vOffset * scaleSize } : undefined}>
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

export const CameraButton: React.FC<{
	onPress?: TouchableOpacityProps['onPress']
	disabled?: boolean
}> = React.memo(props => (
	<ChatInputButton iconName='camera' iconPack='custom' vOffset={1.5} iconRatio={0.44} {...props} />
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
	const { scaleSize } = useAppDimensions()
	return (
		<TouchableOpacity
			style={[
				{
					backgroundColor: colors['input-background'],
					width: chatInputButtonSizeMultiplier * scaleSize,
					height: chatInputButtonSizeMultiplier * scaleSize,
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
			<Icon
				name='plus'
				width={26 * scaleSize}
				height={26 * scaleSize}
				fill={colors['secondary-text']}
			/>
		</TouchableOpacity>
	)
})
