import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";

import { ErrorScreen } from "@berty/components/error";
import AppCommonProviders from "@berty/contexts/AppCommonProviders";
import NotificationProvider from "@berty/contexts/notification.context";
import { PermissionsProvider } from "@berty/contexts/permissions.context";
import { UIKittenProvider } from "@berty/contexts/uiKitten.context";
import { useIsDarkTheme, useMountEffect, useThemeColor } from "@berty/hooks";
import { loadThemeMode } from "@berty/utils/theme/themeMode";
import { isReadyRef, navigationRef } from "@berty/navigation";
import { Navigation } from "@berty/navigation/stacks";
import { initI18N } from "@berty/i18n";
import "intl-pluralrules";

initI18N();

interface BackgroundProps {
	children: React.ReactNode;
}

const Background = ({ children }: BackgroundProps) => {
	const colors = useThemeColor();
	return (
		<View style={{ flex: 1, backgroundColor: colors["main-background"] }}>
			{children}
		</View>
	);
};

// Navigation colors (screen backgrounds, transitions) follow the theme
const ThemedNavigationContainer = ({ children }: BackgroundProps) => {
	const colors = useThemeColor();
	const isDark = useIsDarkTheme();
	const navigationTheme = React.useMemo(
		() => ({
			...DefaultTheme,
			dark: isDark,
			colors: {
				...DefaultTheme.colors,
				background: colors["main-background"],
				card: colors["main-background"],
				text: colors["main-text"],
				border: colors["secondary-background"] ?? colors["main-background"],
			},
		}),
		[colors, isDark]
	);

	return (
		<NavigationContainer
			ref={navigationRef}
			theme={navigationTheme}
			onReady={() => {
				isReadyRef.current = true;
			}}
		>
			{children}
		</NavigationContainer>
	);
};

// the theme mode is a device setting: load it as early as possible
loadThemeMode();

const App: React.FC = () => {
	useMountEffect(() => {
		return () => {
			isReadyRef.current = false;
		};
	});

	return (
		<AppCommonProviders>
			<UIKittenProvider>
				<Background>
					<ErrorScreen>
						<ThemedNavigationContainer>
							<PermissionsProvider>
								<NotificationProvider>
									<Navigation />
								</NotificationProvider>
							</PermissionsProvider>
						</ThemedNavigationContainer>
					</ErrorScreen>
				</Background>
			</UIKittenProvider>
		</AppCommonProviders>
	);
};

export default App;
// export { default } from './.rnstorybook';

