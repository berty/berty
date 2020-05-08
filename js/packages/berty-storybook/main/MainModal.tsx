import React, { Component } from 'react'
import { StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import * as Animatable from 'react-native-animatable'
import { BlurView } from '@react-native-community/blur'
import { PanGestureHandler, State } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'

console.disableYellowBox = true

class ModalCustom extends Component<{
	modalContainerStyle: object
	easing: string
	duration: number
	blurAmount: number
	items: { header: Element; content?: Element; onPress?: () => void }[]
}> {
	constructor(props) {
		super(props)
		this.item1ContentHeight = 0
		this.item2ContentHeight = 0
		this.translationY = 0
		this.translationYC = 0
		this.state = {
			item1ContentHeightState: 0,
			containerHeightState: 0,
			bottomTabPosition: 'absolute',
		}
	}
	componentDidMount() {
		setTimeout(() => {
			const headerHeight = this.calcHeadersHeight()
			this.containerHeight = this.item1DefaultContentHeight + headerHeight
			this.containerHeightFromChilds = this.item1DefaultContentHeight + headerHeight
			setTimeout(() => this.slideUpContainer(), 50)
		}, 50)
	}
	calcHeadersHeight = () => {
		return this.firstHeaderHeight + this.secondHeaderHeight + this.thirdHeaderHeight
	}
	animate = (ref: string, height: number, animated = true) => {
		const { easing, duration } = this.props
		this[ref].transitionTo(
			{
				height,
			},
			animated ? duration : 0,
			easing,
		)
	}
	onMoveFirstTab = (e) => {
		if (this.slidingContainer) {
			return
		}
		const { translationY } = e.nativeEvent
		let heightValue = translationY
		if (Math.sign(translationY) === -1 && Math.sign(this.translationYC) === -1) {
			heightValue = Math.abs(translationY) - Math.abs(this.translationYC)
			heightValue *= -1
			this.setState({ bottomTabPosition: 'absolute' })
		} else if (Math.sign(translationY) === 1 && Math.sign(this.translationYC) === 1) {
			heightValue = translationY - this.translationYC
			this.setState({ bottomTabPosition: 'relative' })
		}

		const animateValue = this.containerHeight - heightValue
		if (animateValue > this.containerHeightFromChilds) {
			this.slideUpContainer()
			return
		}
		this.translationYC = translationY
		this.containerHeight = animateValue
		this.animate('animRefContainer', animateValue, false)
	}
	onMove = (e) => {
		if (this.sliding) {
			return
		}
		const { translationY } = e.nativeEvent
		if (!this.translationY) {
			this.translationY === translationY
		}
		let heightValue = translationY
		if (Math.sign(translationY) === -1 && Math.sign(this.translationY) === -1) {
			heightValue = Math.abs(translationY) - Math.abs(this.translationY)
			heightValue *= -1
		} else if (Math.sign(translationY) === 1 && Math.sign(this.translationY) === 1) {
			heightValue = translationY - this.translationY
		}
		let animateItem1Value = this.item1ContentHeight + heightValue
		if (animateItem1Value > this.item1DefaultContentHeight) {
			animateItem1Value = this.item1DefaultContentHeight
		} else if (animateItem1Value < 0) {
			animateItem1Value = 0
		}
		let animateItem2Value = this.item2ContentHeight - heightValue

		if (animateItem2Value > this.item2DefaultContentHeight) {
			animateItem2Value = this.item2DefaultContentHeight
		} else if (animateItem2Value < 0) {
			animateItem2Value = 0
		}
		this.item1ContentHeight = animateItem1Value
		this.item2ContentHeight = animateItem2Value
		this.translationY = translationY
		if (
			this.item1ContentHeight + this.calcHeadersHeight() > this.containerHeight ||
			this.item2ContentHeight + this.calcHeadersHeight() > this.containerHeight
		) {
			this.containerHeight = this.containerHeight + Math.abs(heightValue)
			this.animate('animRefContainer', this.containerHeight, false)
		}

		if (
			this.item1ContentHeight + this.item2ContentHeight <
			this.containerHeight - this.calcHeadersHeight()
		) {
			this.containerHeight = this.containerHeight - Math.abs(heightValue)
			this.animate('animRefContainer', this.containerHeight, false)
		}
		this.animate('animRefFirst', animateItem1Value, false)
		this.animate('animRefSecond', animateItem2Value, false)
	}
	slideUpContainer = () => {
		const { duration } = this.props
		this.slidingContainer = true
		this.animate(
			'animRefContainer',
			this.containerHeightFromChilds || this.item1DefaultContentHeight + this.calcHeadersHeight(),
		)
		this.containerHeight = this.containerHeightFromChilds
		this.setState({ bottomTabPosition: 'absolute' })
		setTimeout(() => {
			this.slidingContainer = false
		}, duration)
	}
	slideDownContainer = () => {
		this.slidingContainer = true
		const { closeModal, duration } = this.props
		this.animate('animRefContainer', 0)
		this.setState({ bottomTabPosition: 'relative' })
		this.containerHeight = this.containerHeightFromChilds
		setTimeout(() => {
			this.setState({ visible: false })
			this.slidingContainer = false
			closeModal()
		}, duration)
	}
	slideUp = () => {
		this.sliding = true
		const { duration } = this.props
		this.animate('animRefFirst', this.item1DefaultContentHeight)
		this.animate('animRefSecond', 0)
		this.animate('animRefContainer', this.item1DefaultContentHeight + this.calcHeadersHeight())
		setTimeout(() => {
			this.sliding = false
		}, duration)
		this.item1ContentHeight = this.item1DefaultContentHeight
		this.item2ContentHeight = 0
		this.containerHeight = this.item1DefaultContentHeight + this.calcHeadersHeight()
		this.containerHeightFromChilds = this.item1DefaultContentHeight + this.calcHeadersHeight()
	}
	slideDown = () => {
		this.sliding = true
		console.log('slideDown', this.item2DefaultContentHeight)

		const { duration } = this.props
		this.animate('animRefFirst', 0)
		this.animate('animRefSecond', this.item2DefaultContentHeight)
		this.animate('animRefContainer', this.item2DefaultContentHeight + this.calcHeadersHeight())
		setTimeout(() => {
			this.sliding = false
		}, duration)
		this.item1ContentHeight = 0
		this.item2ContentHeight = this.item2DefaultContentHeight
		this.containerHeight = this.item2DefaultContentHeight + this.calcHeadersHeight()
		this.containerHeightFromChilds = this.item2DefaultContentHeight + this.calcHeadersHeight()
	}
	_handleStateChange = ({ nativeEvent }) => {
		if (nativeEvent.state === State.END) {
			if (Math.sign(nativeEvent.translationY) === -1) {
				if (Math.abs(this.translationY) > 80) {
					this.slideDown()
				} else {
					this.slideUp()
				}
			} else if (Math.sign(nativeEvent.translationY) === 1) {
				if (Math.abs(this.translationY) > 80) {
					this.slideUp()
				} else {
					this.slideDown()
				}
			}
			this.translationY = 0
		}
	}
	_handleStateChangeFirstTab = ({ nativeEvent }) => {
		if (nativeEvent.state === State.END) {
			if (Math.sign(nativeEvent.translationY) === -1) {
				this.slideUpContainer()
			} else if (Math.sign(nativeEvent.translationY) === 1) {
				if (Math.abs(this.translationYC) > 100) {
					this.slideDownContainer()
				} else {
					this.slideUpContainer()
				}
			}
			this.translationYC = 0
		}
	}
	render() {
		const { items, blurAmount, modalContainerStyle } = this.props
		const { containerHeightState, item1ContentHeightState, bottomTabPosition } = this.state
		return (
			<BlurView style={styles.blurView} blurType='light' blurAmount={blurAmount}>
				<TouchableOpacity
					activeOpacity={1}
					onPress={() => this.slideDownContainer()}
					style={styles.backDrop}
				>
					<SafeAreaView style={styles.safeAreaView}>
						<Animatable.View
							ref={(ref) => {
								this.animRefContainer = ref
							}}
							style={[styles.modalContainer, modalContainerStyle, { height: containerHeightState }]}
						>
							<TouchableOpacity onPress={() => this.slideUp()}>
								<PanGestureHandler
									onGestureEvent={(e) => this.onMoveFirstTab(e)}
									onHandlerStateChange={this._handleStateChangeFirstTab}
								>
									{items[0].header}
								</PanGestureHandler>
							</TouchableOpacity>

							<Animatable.View
								ref={(ref) => {
									this.animRefFirst = ref
								}}
								style={[styles.tabContent, { height: item1ContentHeightState }]}
							>
								<TouchableOpacity activeOpacity={1}>{items[0].content}</TouchableOpacity>
							</Animatable.View>

							<TouchableOpacity onPress={() => this.slideDown()}>
								<PanGestureHandler
									onGestureEvent={(e) => this.onMove(e)}
									onHandlerStateChange={this._handleStateChange}
								>
									{items[1].header}
								</PanGestureHandler>
							</TouchableOpacity>
							<Animatable.View
								ref={(ref) => {
									this.animRefSecond = ref
								}}
								style={[styles.tabContent, { height: 0 }]}
							>
								<TouchableOpacity activeOpacity={1}>{items[1].content}</TouchableOpacity>
							</Animatable.View>

							<TouchableOpacity
								style={{ position: bottomTabPosition, bottom: 0, left: 0, right: 0 }}
								onPress={() => items[2].onPress()}
							>
								{items[2].header}
							</TouchableOpacity>
						</Animatable.View>
					</SafeAreaView>
				</TouchableOpacity>
				<View style={styles.outOfView}>
					<View
						onLayout={(event) => {
							const { height } = event.nativeEvent.layout
							this.setState({ containerHeightState: height })
						}}
					>
						<View
							onLayout={(event) => {
								const { height } = event.nativeEvent.layout
								this.firstHeaderHeight = height
							}}
						>
							{items[0].header}
						</View>
						<View
							onLayout={(event) => {
								const { height } = event.nativeEvent.layout
								this.secondHeaderHeight = height
							}}
						>
							{items[1].header}
						</View>
						<View
							onLayout={(event) => {
								const { height } = event.nativeEvent.layout
								this.thirdHeaderHeight = height
							}}
						>
							{items[2].header}
						</View>
						<View
							onLayout={(event) => {
								const { height } = event.nativeEvent.layout
								this.setState({ item1ContentHeightState: height })
								this.item1ContentHeight = height
								this.item1DefaultContentHeight = height
							}}
						>
							{items[0].content}
						</View>
					</View>
					<View
						onLayout={(event) => {
							const { height } = event.nativeEvent.layout
							this.item2DefaultContentHeight = height
						}}
					>
						{items[1].content}
					</View>
				</View>
			</BlurView>
		)
	}
}
const styles = StyleSheet.create({
	bottomModal: {
		justifyContent: 'flex-end',
		margin: 0,
	},
	modalContainer: {
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		backgroundColor: '#fff',
		paddingHorizontal: 2,
	},
	blurView: {
		position: 'absolute',
		top: 0,
		left: 0,
		bottom: 0,
		right: 0,
	},
	backDrop: {
		justifyContent: 'flex-end',
		flex: 1,
	},
	safeAreaView: {
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		paddingTop: 0,
		justifyContent: 'flex-end',
		backgroundColor: '#fff',
	},
	tabContent: {
		overflow: 'hidden',
	},
	outOfView: {
		position: 'absolute',
		right: '100%',
	},
	contentContainer: {
		flex: 1,
	},
})

export default ModalCustom
