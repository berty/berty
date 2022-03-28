import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import Animated, { EasingNode } from 'react-native-reanimated'
import { BText } from './BText'

const NUMBERS: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

const usePrevious = (value: number) => {
	const ref = useRef<number>()
	useEffect(() => {
		ref.current = value
	})

	if (typeof ref.current === 'undefined') {
		return 0
	}

	return ref.current
}

export const AnimatedNumber: FC<{
	number: number
	fontStyle?: any
	animationDuration?: number
	easing?: Animated.EasingNodeFunction
}> = ({ number, fontStyle, animationDuration, easing }) => {
	const prevNumber = usePrevious(number)
	const prevNumberString = String(Math.abs(prevNumber))

	const animateToNumberString = String(Math.abs(number))
	const animateToNumbersArr = Array.from(animateToNumberString, Number)
	const prevNumberersArr = Array.from(prevNumberString, Number)

	const [numberHeight, setNumberHeight] = useState<number>(0)
	const animations = animateToNumbersArr.map((__, index) => {
		if (typeof prevNumberersArr[index] !== 'number') {
			return new Animated.Value(0)
		}

		const animationHeight = -1 * (numberHeight * prevNumberersArr[index])
		return new Animated.Value(animationHeight)
	})

	useEffect(() => {
		animations.map((animation, index) => {
			if (typeof animateToNumbersArr[index] !== 'number') {
				return
			}

			Animated.timing(animation, {
				toValue: -1 * (numberHeight * animateToNumbersArr[index]),
				duration: animationDuration || 1400,
				easing: easing || EasingNode.elastic(1.2),
			}).start()
		})
	}, [number, animateToNumbersArr, animationDuration, animations, easing, numberHeight])

	const getTranslateY = useCallback(
		(index: number) => {
			return animations[index]
		},
		[animations],
	)

	return (
		<>
			{numberHeight !== 0 && (
				<View style={{ flexDirection: 'row' }}>
					{number < 0 && <BText style={[fontStyle, { height: numberHeight }]}>{'-'}</BText>}
					{animateToNumbersArr.map((n, index) => {
						if (typeof n === 'string') {
							return (
								<BText key={index} style={[fontStyle, { height: numberHeight }]}>
									{n}
								</BText>
							)
						}

						return (
							<View key={index} style={{ height: numberHeight, overflow: 'hidden' }}>
								<Animated.View
									style={[
										{
											transform: [
												{
													translateY: getTranslateY(index),
												},
											],
										},
									]}
								>
									{NUMBERS.map((number, i) => (
										<View style={{ flexDirection: 'row' }} key={i}>
											<BText style={[fontStyle, { height: numberHeight }]}>{number}</BText>
										</View>
									))}
								</Animated.View>
							</View>
						)
					})}
				</View>
			)}
			<BText
				style={[fontStyle, { position: 'absolute', top: -999999 }]}
				onLayout={e => setNumberHeight(e.nativeEvent.layout.height)}
			>
				{0}
			</BText>
		</>
	)
}

export default AnimatedNumber
