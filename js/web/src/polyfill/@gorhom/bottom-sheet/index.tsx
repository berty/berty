import React, { ForwardedRef, forwardRef, useImperativeHandle } from 'react'
import { ScrollViewProps, View, ViewProps } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import ImportedBottomSheet from '../../../../../node_modules/@gorhom/bottom-sheet' // import from original bottom-sheet

import { useStyles } from '../../../../../packages/contexts/styles'
import { useLayout } from '../../../../../packages/components/hooks'
import { useThemeColor } from '../../../../../packages/store'
import { useAppDimensions } from '../../../../../packages/contexts/app-dimensions.context'

export const useBottomSheetDynamicSnapPoints = (_snapPoints: string[]) => {
	return {
		animatedSnapPoints: () => [0, 0],
		animatedHandleHeight: () => 0,
		animatedContentHeight: () => 0,
		handleContentLayout: () => {
			return {
				nativeEvent: {
					layout: {
						height: 0,
					},
				},
			}
		},
	}
}

type BottomSheetProps = ViewProps & { onClose: () => void }

const BottomSheet = forwardRef(
	({ onClose, ...props }: BottomSheetProps, ref: ForwardedRef<ImportedBottomSheet>) => {
		useImperativeHandle(ref, () => ({
			snapToIndex: () => {},
			snapToPosition: () => {},
			expand: () => {},
			collapse: () => {},
			close: onClose,
			forceClose: () => {},
		}))
		const { padding, border } = useStyles()
		const { windowHeight } = useAppDimensions()
		const colors = useThemeColor()
		const [layout, onLayout] = useLayout()

		return (
			<View
				{...props}
				onLayout={onLayout}
				style={[
					padding.horizontal.medium,
					padding.bottom.medium,
					border.radius.large,
					border.shadow.huge,
					{
						backgroundColor: colors['main-background'],
						shadowColor: colors.shadow,
						zIndex: 100,
						position: 'absolute',
						alignSelf: 'center',
						top: windowHeight * 0.5 - layout.height * 0.5,
					},
				]}
			/>
		)
	},
)

export const BottomSheetView = (props: ViewProps) => <View {...props} />

export const BottomSheetScrollView = (props: ScrollViewProps) => <ScrollView {...props} />

export default BottomSheet
