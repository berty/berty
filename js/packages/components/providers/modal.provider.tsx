import React, {
	createContext,
	FC,
	ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
	RefObject,
	createRef,
	forwardRef,
	ForwardedRef,
	useEffect,
} from 'react'
import { Keyboard, Platform, TouchableWithoutFeedback, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import BottomSheet, {
	useBottomSheetDynamicSnapPoints,
	BottomSheetScrollView,
} from '@gorhom/bottom-sheet'

import { useAnimatedStyle } from 'react-native-reanimated'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

const useKeyboardHeight = (platforms: string[] = ['ios', 'android']) => {
	const [keyboardHeight, setKeyboardHeight] = useState<number>(0)
	useEffect(() => {
		if (isEventRequired(platforms)) {
			Keyboard.addListener('keyboardDidShow', keyboardDidShow)
			Keyboard.addListener('keyboardDidHide', keyboardDidHide)

			// cleanup function
			return () => {
				Keyboard.removeListener('keyboardDidShow', keyboardDidShow)
				Keyboard.removeListener('keyboardDidHide', keyboardDidHide)
			}
		} else {
			return () => {}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const isEventRequired = (platforms: any) => {
		try {
			return (
				platforms?.map((p: string) => p?.toLowerCase()).indexOf(Platform.OS) !== -1 || !platforms
			)
		} catch (ex: any) {}

		return false
	}

	const keyboardDidShow = (frames: any) => {
		setKeyboardHeight(frames.endCoordinates.height)
	}

	const keyboardDidHide = () => {
		setKeyboardHeight(0)
	}

	return keyboardHeight
}

declare module 'react' {
	function forwardRef<T, P = {}>(
		render: (props: P, ref: React.Ref<T>) => React.ReactElement | null,
	): (props: P & React.RefAttributes<T>) => React.ReactElement | null
}

type stackType = {
	ref: RefObject<BottomSheet>
	component: ReactNode
	id: string
}

const generateUUID = (digits: number = 10): string => {
	let str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVXZ'
	let uuid = []
	for (let i = 0; i < digits; i++) {
		uuid.push(str[Math.floor(Math.random() * str.length)])
	}
	return uuid.join('')
}

const BottomSheetModal = forwardRef(
	(
		{ children, onClose }: { children: ReactNode; onClose: () => void },
		ref: ForwardedRef<BottomSheet>,
	) => {
		const snapPoints = useMemo(() => ['CONTENT_HEIGHT'], [])
		const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
			useBottomSheetDynamicSnapPoints(snapPoints)
		const insets = useSafeAreaInsets()
		const keyboardHeight = useKeyboardHeight()
		const { windowHeight } = useAppDimensions()

		const scrollViewAnimatedStyles = useAnimatedStyle(() => {
			const contentHeight = animatedContentHeight.value
			const handleHeight = animatedHandleHeight.value
			const bottomSheetHeight = handleHeight + contentHeight

			return {
				height: bottomSheetHeight > windowHeight ? windowHeight - handleHeight : bottomSheetHeight,
			}
		})

		return (
			<View
				style={{
					flex: 1,
					position: 'absolute',
					top: 0,
					bottom: 0,
					right: 0,
					left: 0,
				}}
			>
				<TouchableWithoutFeedback
					onPress={() => {
						ref && (ref as RefObject<BottomSheet>).current?.close()
					}}
				>
					<View style={{ height: '100%' }} />
				</TouchableWithoutFeedback>
				<BottomSheet
					ref={ref}
					index={0}
					snapPoints={animatedSnapPoints}
					handleHeight={animatedHandleHeight}
					contentHeight={animatedContentHeight}
					enablePanDownToClose={true}
					enableHandlePanningGesture={Platform.OS === 'ios'}
					onClose={onClose}
					handleIndicatorStyle={
						Platform.OS === 'android' ? { backgroundColor: 'transparent' } : undefined
					}
					style={{
						shadowColor: '#000',
						shadowOffset: {
							width: 0,
							height: 9,
						},
						shadowOpacity: 0.48,
						shadowRadius: 11.95,
						elevation: 18,
						zIndex: 100,
					}}
				>
					<BottomSheetScrollView style={scrollViewAnimatedStyles}>
						<View onLayout={handleContentLayout}>
							{children}
							<View style={{ height: keyboardHeight, paddingBottom: insets.bottom }} />
						</View>
					</BottomSheetScrollView>
				</BottomSheet>
			</View>
		)
	},
)

const ModalContext = createContext<{
	hide: () => void
	hideAll: () => void
	show: (component: ReactNode) => void
}>({
	hide: () => {},
	hideAll: () => {},
	show: () => {},
})

export const ModalProvider: FC = ({ children }) => {
	const [stack, setStack] = useState<stackType[]>([])

	const handleDeleteModal = useCallback((idToRemove: string) => {
		setStack(previous => previous.filter(({ id }) => id !== idToRemove))
	}, [])

	const show = useCallback((component: ReactNode) => {
		setStack(previous => [
			...previous,
			{ ref: createRef<BottomSheet>(), component, id: generateUUID() },
		])
	}, [])

	const hide = useCallback((closeAll: boolean = false) => {
		setStack(previous => {
			if (closeAll) {
				previous.forEach(({ ref }) => {
					ref.current?.close()
				})
			}
			previous.length && previous[previous.length - 1].ref.current?.close()
			return previous
		})
	}, [])

	return (
		<ModalContext.Provider
			value={{
				hide,
				show,
				hideAll: () => {
					hide(true)
				},
			}}
		>
			{children}
			{stack.map(({ ref, component, id }, key) => (
				<BottomSheetModal
					key={`bottom-sheet-${key}`}
					ref={ref}
					onClose={() => handleDeleteModal(id)}
				>
					{component}
				</BottomSheetModal>
			))}
		</ModalContext.Provider>
	)
}

export const useModal = () => {
	const context = useContext(ModalContext)
	if (!context) {
		throw new Error('useConversationModal must be used within a ModalProvider')
	}
	return context
}
