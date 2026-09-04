import React, { createContext, useContext, useMemo } from "react";
import { PixelRatio, useWindowDimensions } from "react-native";

import {
	initialScaleHeight,
	initialScaleSize,
	iPhone11ShortEdge,
	iPhone11LongEdge,
	initialFontScale,
	initialHeight,
	initialWidth,
	iPadShortEdge,
	iPadLongEdge,
} from "./styles/constant";

const appDimensionsContext = createContext<{
	scaleSize: number;
	scaleHeight: number;
	fontScale: number;
	windowHeight: number;
	windowWidth: number;
	isGteIpadSize: boolean;
	isLandscape: boolean;
}>({
	scaleSize: initialScaleSize,
	scaleHeight: initialScaleHeight,
	fontScale: initialFontScale,
	windowHeight: initialHeight,
	windowWidth: initialWidth,
	isGteIpadSize:
		Math.min(initialHeight, initialWidth) >= iPadShortEdge &&
		Math.max(initialHeight, initialWidth) >= iPadLongEdge,
	isLandscape: initialWidth > initialHeight,
});

interface AppDimensionsProviderProps {
	children: React.ReactNode;
}

export const AppDimensionsProvider = ({ children }: AppDimensionsProviderProps) => {
	const { height: windowHeight, width: windowWidth } = useWindowDimensions();
	const isGteIpadSize =
		Math.min(initialHeight, initialWidth) >= iPadShortEdge &&
		Math.max(initialHeight, initialWidth) >= iPadLongEdge;

	// Derived straight from the window size rather than mirrored into state by an
	// effect, so the first render already has the real values instead of the
	// initial* placeholders.
	const { scaleHeight, scaleSize, fontScale } = useMemo(() => {
		const isLandscape = windowHeight < windowWidth;
		const _scaleHeight =
			windowHeight /
			Math.max(
				isLandscape ? iPhone11ShortEdge : iPhone11LongEdge,
				windowHeight,
			);
		const _scaleSize =
			windowWidth /
			Math.max(isLandscape ? iPhone11LongEdge : iPhone11ShortEdge, windowWidth);
		return {
			scaleHeight: _scaleHeight,
			scaleSize: _scaleSize,
			fontScale: PixelRatio.getFontScale() * _scaleSize,
		};
	}, [windowHeight, windowWidth]);

	return (
		<appDimensionsContext.Provider
			value={{
				scaleHeight,
				scaleSize,
				fontScale,
				windowHeight,
				windowWidth,
				isGteIpadSize,
				isLandscape: windowWidth > windowHeight,
			}}
		>
			<>{children}</>
		</appDimensionsContext.Provider>
	);
};

export const useAppDimensions = () => {
	return useContext(appDimensionsContext);
};
