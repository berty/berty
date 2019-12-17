import React, { useState, useRef, useEffect } from 'react'
import { Text, View, StyleSheet, Animated, TouchableWithoutFeedback, StyleProp } from 'react-native'
import { Icon } from 'react-native-ui-kitten'
import { styles, colors } from '../styles'
import Interactable from 'react-native-interactable'

type SDTSModalProps = {
	toggledPoint: number
	notToggledPoint: number
	snapPoints: { y: number; id: string }[]
	diffPoint: number
	initialPoint: { y: number }
	//
	deltaY: Animated.Value
	isToggled: boolean
	layout: number
	onFocus: any
	//
	title?: string
	titleColor?: string
	icon?: string | null
	iconColor?: string
	bgColor?: string
	//
	maxHeight?: number
	//
	dragEnabled?: boolean | undefined
	//
	header?: boolean
}

type SDTSComponentProps = {
	setComponentValues: React.Dispatch<React.SetStateAction<any>>
	setFocusAction: React.Dispatch<React.SetStateAction<any>>
	componentValues: SDTSModalProps
	ref: any
	dragEnabled?: boolean
	//
	children: React.ReactNode
	//
	interactableStyle?: StyleProp<any>[]
}

type SDTSModalComponentProps = {
	rows: {
		toggledPoint: number
		notToggledPoint: number
		initialPoint?: number
		//
		title?: string
		titleColor?: string
		icon?: string | undefined
		iconColor?: string
		bgColor?: string
		//
		maxHeight?: number
		//
		dragEnabled?: boolean | undefined
		//
		header?: boolean
	}[]
	children: React.ReactNode
	// FirstChild: React.Component<any, any, any>
	// SecondChild: React.Component<any, any, any>
	// ThirdChild: React.Component<any, any, any>
}

const _styles2 = StyleSheet.create({
	placeholder: {
		backgroundColor: '#FFFFFF',
		height: 120,
		marginTop: 16,
	},
	placeholder2: {
		height: 90,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
	},
})

const SDTSComponent: React.FC<SDTSComponentProps> = ({
	setComponentValues,
	setFocusAction,
	componentValues,
	ref,
	dragEnabled = true,
	//
	children,
	//
	interactableStyle = null,
}) => {
	const handleOnDrag = (e: any) => {
		setFocusAction(componentValues.onFocus)
		if (e.nativeEvent.targetSnapPointId === 'toggle') {
			setComponentValues({
				...componentValues,
				isToggled: true,
			})
		} else if (e.nativeEvent.targetSnapPointId === 'not-toggle') {
			setComponentValues({
				...componentValues,
				isToggled: false,
			})
		}
	}

	return (
		<Interactable.View
			style={interactableStyle}
			verticalOnly={true}
			snapPoints={componentValues.snapPoints}
			boundaries={{ top: componentValues.toggledPoint, bottom: componentValues.notToggledPoint }}
			ref={ref}
			dragEnabled={dragEnabled}
			onDrag={(e: any) => handleOnDrag(e)}
			animatedValueY={componentValues.deltaY}
			showsVerticalScrollIndicator={false}
			initialPosition={componentValues.initialPoint}
		>
			<View style={[styles.shadow]}>
				<TouchableWithoutFeedback>
					<View style={[_styles2.placeholder2, { backgroundColor: componentValues.bgColor }]}>
						<View
							style={[
								styles.littleMarginTop,
								styles.center,
								styles.bgLightGrey,
								{
									borderWidth: 2.5,
									borderColor: colors.lightGrey,
									width: '14%',
									borderRadius: 4,
								},
							]}
						/>
						{componentValues.header && (
							<View>
								<View
									style={[
										styles.row,
										styles.paddingHorizontal,
										styles.paddingBottom,
										styles.littlePaddingTop,
										styles.spaceBetween,
										styles.alignItems,
									]}
								>
									<Text
										style={[
											styles.fontFamily,
											styles.textBold,
											{ fontSize: 20, color: componentValues.titleColor },
										]}
									>
										{componentValues.title}
									</Text>
									{componentValues.icon && (
										<Icon
											style={[styles.flex, styles.right]}
											name={componentValues.icon}
											width={40}
											height={40}
											fill={componentValues.iconColor}
										/>
									)}
								</View>
							</View>
						)}
					</View>
				</TouchableWithoutFeedback>
			</View>
			<Animated.View
				onLayout={(e: any) =>
					componentValues.layout === 0 &&
					setComponentValues({ ...componentValues, layout: e.nativeEvent.layout.height })
				}
				style={[
					styles.paddingBottom,
					styles.paddingHorizontal,
					{ maxHeight: componentValues.maxHeight, backgroundColor: componentValues.bgColor },
				]}
			>
				{children}
			</Animated.View>
		</Interactable.View>
	)
}

export const SDTSModalComponent: React.FC<SDTSModalComponentProps> = ({ rows, children }) => {
	const [focus, setFocus] = useState()
	const firstRef = useRef(null)
	const secondRef = useRef(null)
	const thirdRef = useRef(null)
	const [first, setFirst] = useState({
		toggledPoint: rows[0].toggledPoint,
		notToggledPoint: rows[0].notToggledPoint,
		snapPoints: [
			{ y: rows[0].toggledPoint, id: 'toggle' },
			{ y: rows[0].notToggledPoint, id: 'not-toggle' },
		],
		diffPoint: rows[0].notToggledPoint - rows[0].toggledPoint,
		initialPoint: { y: rows[0].initialPoint || rows[0].notToggledPoint },
		//
		deltaY: new Animated.Value(0),
		isToggled: rows[0].initialPoint === rows[0].toggledPoint ? true : false,
		layout: 0,
		onFocus: 0,
		//
		maxHeight: rows[0].maxHeight || 500,
		//
		title: rows[0].title !== undefined ? rows[0].title : undefined,
		titleColor: rows[0].titleColor || colors.black,
		icon: rows[0].icon !== undefined ? rows[0].icon : null,
		iconColor: rows[0].iconColor || colors.blue,
		bgColor: rows[0].bgColor || colors.white,
		//
		dragEnabled: rows[0].dragEnabled !== undefined ? rows[0].dragEnabled : true,
		//
		header: rows[0].header !== undefined ? rows[0].header : true,
	})
	const [second, setSecond] = useState()
	const [third, setThird] = useState()

	useEffect(() => {
		if (rows.length >= 2 && !second) {
			setSecond({
				toggledPoint: rows[1].toggledPoint,
				notToggledPoint: rows[1].notToggledPoint,
				snapPoints: [
					{ y: rows[1].toggledPoint, id: 'toggle' },
					{ y: rows[1].notToggledPoint, id: 'not-toggle' },
				],
				diffPoint: rows[1].notToggledPoint - rows[1].toggledPoint,
				initialPoint: { y: rows[1].initialPoint || rows[1].notToggledPoint },
				//
				deltaY: new Animated.Value(0),
				isToggled: rows[1].initialPoint === rows[1].toggledPoint ? true : false,
				layout: 0,
				onFocus: 1,
				//
				maxHeight: rows[1].maxHeight || 500,
				//
				title: rows[1].title !== undefined ? rows[1].title : undefined,
				titleColor: rows[1].titleColor || colors.black,
				icon: rows[1].icon !== undefined ? rows[1].icon : null,
				iconColor: rows[1].iconColor || colors.blue,
				bgColor: rows[1].bgColor || colors.white,
				//
				dragEnabled: rows[1].dragEnabled !== undefined ? rows[1].dragEnabled : true,
				//
				header: rows[1].header !== undefined ? rows[1].header : true,
			})
			if (rows.length > 2 && !third) {
				setThird({
					toggledPoint: rows[2].toggledPoint,
					notToggledPoint: rows[2].notToggledPoint,
					snapPoints: [
						{ y: rows[2].toggledPoint, id: 'toggle' },
						{ y: rows[2].notToggledPoint, id: 'not-toggle' },
					],
					diffPoint: rows[2].notToggledPoint - rows[2].toggledPoint,
					initialPoint: { y: rows[2].initialPoint || rows[2].notToggledPoint },
					//
					deltaY: new Animated.Value(0),
					isToggled: rows[2].initialPoint === rows[2].toggledPoint ? true : false,
					layout: 0,
					onFocus: 2,
					//
					maxHeight: rows[2].maxHeight || 500,
					//
					title: rows[2].title !== undefined ? rows[2].title : undefined,
					titleColor: rows[2].titleColor || colors.black,
					icon: rows[2].icon !== undefined ? rows[2].icon : null,
					iconColor: rows[2].iconColor || colors.blue,
					bgColor: rows[2].bgColor || colors.white,
					//
					dragEnabled: rows[2].dragEnabled !== undefined ? rows[2].dragEnabled : true,
					//
					header: rows[2].header !== undefined ? rows[2].header : true,
				})
			}
		}
	}, [first, rows, second, third])

	return (
		<View style={[styles.absolute, styles.left, styles.right, styles.bottom]}>
			<View>
				{first && (
					<SDTSComponent
						setComponentValues={setFirst}
						setFocusAction={setFocus}
						componentValues={first}
						ref={firstRef}
						dragEnabled={first.dragEnabled}
						interactableStyle={[{ zIndex: 3 }]}
					>
						{rows.length > 1 ? children[0] : children}
					</SDTSComponent>
				)}
				{second && (
					<SDTSComponent
						setComponentValues={setSecond}
						setFocusAction={setFocus}
						componentValues={second}
						ref={secondRef}
						dragEnabled={
							second.dragEnabled === false ? second.dragEnabled : first.isToggled ? false : true
						}
						interactableStyle={[
							{ zIndex: 2 },
							focus === 0 &&
								!second.isToggled && {
									transform: [
										{
											translateY: first.deltaY.interpolate({
												inputRange: [
													first.toggledPoint,
													first.toggledPoint,
													first.notToggledPoint,
													first.notToggledPoint,
												],
												outputRange: [-first.diffPoint, -first.diffPoint, 0, 0], // height of second component
											}),
										},
									],
								},
							focus === 0 &&
								second.isToggled && {
									transform: [
										{
											translateY: first.deltaY.interpolate({
												inputRange: [
													first.toggledPoint,
													first.toggledPoint,
													first.notToggledPoint,
													first.notToggledPoint,
												],
												outputRange: [
													second.diffPoint - first.diffPoint,
													second.diffPoint - first.diffPoint,
													0,
													0,
												],
											}),
										},
									],
								},
						]}
					>
						{children && children[1]}
					</SDTSComponent>
				)}
				{third && (
					<SDTSComponent
						setComponentValues={setThird}
						setFocusAction={setFocus}
						componentValues={third}
						ref={thirdRef}
						dragEnabled={
							third.dragEnabled === false
								? third.dragEnabled
								: first.isToggled || second.isToggled
								? false
								: true
						}
						interactableStyle={[
							{ zIndex: 1 },
							focus === 0 &&
								!third.isToggled && {
									transform: [
										{
											translateY: first.deltaY.interpolate({
												inputRange: [
													first.toggledPoint,
													first.toggledPoint,
													first.notToggledPoint,
													first.notToggledPoint,
												],
												outputRange: [
													-first.diffPoint,
													-first.diffPoint,
													second.isToggled ? -second.diffPoint : 0,
													second.isToggled ? -second.diffPoint : 0,
												],
											}),
										},
									],
								},
							focus === 0 &&
								third.isToggled && {
									transform: [
										{
											translateY: first.deltaY.interpolate({
												inputRange: [
													first.toggledPoint,
													first.toggledPoint,
													first.notToggledPoint,
													first.notToggledPoint,
												],
												outputRange: [
													third.diffPoint - first.diffPoint,
													third.diffPoint - first.diffPoint,
													second.isToggled ? 90 : 0,
													second.isToggled ? 90 : 0,
												], // TODO : what is 90 ?
											}),
										},
									],
								},
							focus === 1 &&
								third.isToggled && {
									transform: [
										{
											translateY: second.deltaY.interpolate({
												inputRange: [
													second.toggledPoint,
													second.toggledPoint,
													second.notToggledPoint,
													second.notToggledPoint,
												],
												outputRange: [
													third.diffPoint - second.diffPoint,
													third.diffPoint - second.diffPoint,
													0,
													0,
												],
											}),
										},
									],
								},
							focus === 1 &&
								!third.isToggled && {
									transform: [
										{
											translateY: second.deltaY.interpolate({
												inputRange: [
													second.toggledPoint,
													second.toggledPoint,
													second.notToggledPoint,
													second.notToggledPoint,
												],
												outputRange: [-second.diffPoint, -second.diffPoint, 0, 0],
											}),
										},
									],
								},
						]}
					>
						{children && children[2]}
					</SDTSComponent>
				)}
			</View>
		</View>
	)
}
