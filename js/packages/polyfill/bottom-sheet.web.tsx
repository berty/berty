import React from 'react'

const BottomSheet = () => <></>

export const BottomSheetView = () => <></>

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

export default BottomSheet
