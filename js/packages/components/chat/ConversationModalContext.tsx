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
} from 'react'
import { Platform, TouchableWithoutFeedback, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import BottomSheet, { BottomSheetView, useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet'
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

		const handleSheetChanges = useCallback(
			(index: number) => {
				if (index === -1) {
					onClose()
				}
			},
			[onClose],
		)

		return (
			<View
				style={{
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
					onChange={handleSheetChanges}
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
					<BottomSheetView style={{ paddingBottom: insets?.bottom }} onLayout={handleContentLayout}>
						{children}
					</BottomSheetView>
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

export const ConversationModalProvider: FC = ({ children }) => {
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

	const hide = useCallback(
		(closeAll: boolean = false) => {
			if (closeAll) {
				stack.forEach(({ ref }) => {
					ref.current?.close()
				})
				return
			}
			stack.length && stack[stack.length - 1].ref.current?.close()
		},
		[stack],
	)

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

export const useConversationModal = () => {
	const context = useContext(ModalContext)
	if (!context) {
		throw new Error('useConversationModal must be used within a ModalProvider')
	}
	return context
}
