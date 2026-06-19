import { mapping, light } from "@eva-design/eva";
import { ApplicationProvider } from "@ui-kitten/components";
import { StatusBar } from "expo-status-bar";
import React from "react";

interface UIKittenProviderProps {
	children: React.ReactNode;
}

export const UIKittenProvider = ({ children }: UIKittenProviderProps) => (
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
			theme={light}
		>
			<StatusBar style="dark" />
			{children}
		</ApplicationProvider>
	</>
);
