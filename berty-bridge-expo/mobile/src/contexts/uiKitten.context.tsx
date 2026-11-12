import { mapping, light, dark } from "@eva-design/eva";
import { ApplicationProvider } from "@ui-kitten/components";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform } from "react-native";

import { useIsDarkTheme } from "@berty/hooks";

interface UIKittenProviderProps {
	children: React.ReactNode;
}

export const UIKittenProvider = ({ children }: UIKittenProviderProps) => {
	const isDark = useIsDarkTheme();

	// The app config sets the Android navigation bar icons to dark (the bar is transparent under
	// edge-to-edge and the screens were always light), which would be invisible on the dark themes.
	React.useEffect(() => {
		if (Platform.OS !== "android") {
			return;
		}
		try {
			// not declared in every version of the module: do nothing if it is missing
			const { setStyle } = NavigationBar as unknown as {
				setStyle?: (style: "light" | "dark") => void;
			};
			setStyle?.(isDark ? "light" : "dark");
		} catch (err) {
			console.warn("unable to set the navigation bar style: ", err);
		}
	}, [isDark]);

	return (
		<>
			<ApplicationProvider
				mapping={mapping}
				customMapping={
					{
						strict: {
							"text-font-family": "Open Sans",
							"text-paragraph-1-font-weight": "600",
						},
					} as any
				}
				theme={isDark ? dark : light}
			>
				<StatusBar style={isDark ? "light" : "dark"} />
				{children}
			</ApplicationProvider>
		</>
	);
};
