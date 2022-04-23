import React, {
	useState,
	useRef,
	FC,
	useMemo,
	useCallback,
	forwardRef,
	useImperativeHandle,
	ReactNode,
	ForwardedRef,
} from 'react'
import { View, Animated, Easing, TouchableOpacity } from 'react-native'
import { Divider, Icon } from '@ui-kitten/components'

import { useThemeColor } from '@berty/store'
import { useStyles } from '@berty/contexts/styles'
import { ButtonSetting } from '@berty/components/shared-components'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

const heightButton = 55

const AccordionIcon: FC<{ name: string; pack?: string; fill?: string; size?: number }> = ({
	name,
	pack,
	fill,
	size = 20,
}) => {
	const colors = useThemeColor()
	const { scaleSize } = useAppDimensions()

	return (
		<Icon
			name={name}
			width={size * scaleSize}
			height={size * scaleSize}
			pack={pack ? pack : undefined}
			fill={fill ? fill : colors['background-header']}
		/>
	)
}

export const AccordionItem: FC<{
	value: string | null
	toggle: boolean
	onToggleChange?: (list: any) => void
	onPressModify?: () => void
}> = ({ value, toggle, onToggleChange, onPressModify }) => {
	const colors = useThemeColor()
	const { padding } = useStyles()

	return (
		<>
			<ButtonSetting
				name={value || ''}
				alone={false}
				actionIcon={null}
				toggled
				toggleStatus='secondary'
				varToggle={toggle}
				actionToggle={onToggleChange}
				rightComponent={
					onPressModify ? (
						<TouchableOpacity onPress={onPressModify} style={[padding.right.medium]}>
							<AccordionIcon name='edit-outline' size={24} />
						</TouchableOpacity>
					) : null
				}
			/>
			<Divider style={{ backgroundColor: colors['input-background'] }} />
		</>
	)
}

export const AccordionAddItem: FC<{
	onPress: () => void
}> = ({ onPress }) => {
	const { padding } = useStyles()
	const { scaleSize } = useAppDimensions()

	return (
		<>
			<TouchableOpacity
				style={[
					padding.horizontal.medium,
					{
						flex: 1,
						flexDirection: 'row',
						justifyContent: 'center',
					},
				]}
				onPress={onPress}
			>
				<View
					style={{
						height: heightButton * scaleSize,
						justifyContent: 'center',
					}}
				>
					<AccordionIcon name='plus-circle' pack='feather' size={24} />
				</View>
			</TouchableOpacity>
		</>
	)
}

type AccordionProps = {
	title: string
	icon?: string
	children?: ReactNode
}

export type AccordionRef = { open: () => void; close: () => void }

export const Accordion = forwardRef(
	({ title, icon, children }: AccordionProps, ref: ForwardedRef<AccordionRef>) => {
		const { margin, padding, border } = useStyles()
		const { scaleSize } = useAppDimensions()
		const colors = useThemeColor()
		const [open, setOpen] = useState(false)
		const animatedController = useRef(new Animated.Value(0)).current
		const [bodySectionHeight, setBodySectionHeight] = useState(0)

		const bodyHeight = useMemo(
			() =>
				animatedController.interpolate({
					inputRange: [0, 1],
					outputRange: [0, bodySectionHeight],
				}),
			[animatedController, bodySectionHeight],
		)

		const arrowAngle = useMemo(
			() =>
				animatedController.interpolate({
					inputRange: [0, 1],
					outputRange: ['0rad', `${Math.PI * 0.5}rad`],
				}),
			[animatedController],
		)

		const closeListItem = useCallback(() => {
			Animated.timing(animatedController, {
				duration: 300,
				toValue: 0,
				easing: Easing.bezier(0.4, 0.0, 0.2, 1),
				useNativeDriver: false,
			}).start()
			setOpen(false)
		}, [animatedController])

		const openListItem = useCallback(() => {
			Animated.timing(animatedController, {
				duration: 300,
				toValue: 1,
				easing: Easing.bezier(0.4, 0.0, 0.2, 1),
				useNativeDriver: false,
			}).start()
			setOpen(true)
		}, [animatedController])

		const toggleListItem = useCallback(() => {
			if (open) {
				closeListItem()
			} else {
				openListItem()
			}
		}, [closeListItem, open, openListItem])

		useImperativeHandle(ref, () => ({
			open: openListItem,
			close: closeListItem,
		}))

		return (
			<>
				<ButtonSetting
					name={title}
					color={colors['main-text']}
					icon={icon}
					iconPack='custom'
					iconColor='#6E6DFF'
					actionIconColor={colors['main-text']}
					backgroundColor={colors['input-background']}
					onPress={toggleListItem}
					style={[{ zIndex: 999 }]}
					actionIconAngle={arrowAngle}
				/>
				<Animated.View
					style={{
						height: bodyHeight,
						overflow: 'hidden',
					}}
				>
					<View
						style={{
							position: 'absolute',
							bottom: 0,
							right: 0,
							left: 0,
						}}
						onLayout={event => setBodySectionHeight(event.nativeEvent.layout.height)}
					>
						<View
							style={[
								padding.horizontal.medium,
								margin.tiny,
								border.radius.medium,
								border.shadow.medium,
								margin.top.small,
								{
									minHeight: 60 * scaleSize,
									backgroundColor: colors['main-background'],
									flex: 1,
									shadowColor: colors.shadow,
								},
							]}
						>
							{children}
						</View>
					</View>
				</Animated.View>
			</>
		)
	},
)
