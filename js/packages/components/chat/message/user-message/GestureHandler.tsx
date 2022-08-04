import { Icon } from '@ui-kitten/components'
import React, { useState } from 'react'
import { Animated } from 'react-native'
import { PanGestureHandler, State } from 'react-native-gesture-handler'

import { useAppDispatch, useThemeColor } from '@berty/hooks'
import { setActiveReplyInteraction } from '@berty/redux/reducers/chatInputs.reducer'

import { UserMessageContentProps } from './interfaces'
import { UserMessageContent } from './UserMessageContent'

interface GestureHandlerProps extends UserMessageContentProps {
	convPK: string
}

export const GestureHandler: React.FC<GestureHandlerProps> = props => {
	const [animatedValue] = useState(new Animated.Value(0))
	const colors = useThemeColor()

	const dispatch = useAppDispatch()

	const onSetActiveReplyInteraction = () => {
		dispatch(
			setActiveReplyInteraction({
				convPK: props.convPK,
				activeReplyInteraction: {
					...props.inte,
					backgroundColor: props.msgBackgroundColor,
					textColor: props.msgTextColor,
				},
			}),
		)
	}

	return (
		<PanGestureHandler
			enabled={!props.inte.isMine}
			activeOffsetX={20}
			onGestureEvent={({ nativeEvent }) => {
				if (nativeEvent.translationX > 0 && nativeEvent.translationX < 120) {
					Animated.timing(animatedValue, {
						toValue: nativeEvent.translationX,
						duration: 1,
						useNativeDriver: false,
					}).start()
				} else if (nativeEvent.translationX <= 0) {
					Animated.timing(animatedValue, {
						toValue: 0,
						duration: 50,
						useNativeDriver: false,
					}).start()
				}
			}}
			onHandlerStateChange={event => {
				if (event.nativeEvent.oldState === State.ACTIVE) {
					if (event.nativeEvent.translationX > 120) {
						onSetActiveReplyInteraction()
						Animated.timing(animatedValue, {
							toValue: 0,
							duration: 50,
							useNativeDriver: false,
						}).start()
					} else if (event.nativeEvent.velocityX > 100 || event.nativeEvent.translationX > 40) {
						Animated.timing(animatedValue, {
							toValue: 60,
							duration: 50,

							useNativeDriver: false,
						}).start()
					} else {
						Animated.timing(animatedValue, {
							toValue: 0,
							duration: 50,

							useNativeDriver: false,
						}).start()
					}
				}
			}}
		>
			<Animated.View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					transform: [{ translateX: animatedValue }],
				}}
			>
				<Animated.View
					style={{
						marginRight: 10,
						opacity: animatedValue.interpolate({
							inputRange: [0, 60],
							outputRange: [0, 1],
						}),
						position: 'absolute',
						left: -50,
					}}
				>
					<Icon
						name='undo'
						height={30}
						width={30}
						fill={colors['negative-asset']}
						onPress={onSetActiveReplyInteraction}
					/>
				</Animated.View>
				<UserMessageContent {...props} />
			</Animated.View>
		</PanGestureHandler>
	)
}
