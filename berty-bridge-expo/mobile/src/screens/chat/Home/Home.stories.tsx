import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { AppDecorator, NavigationDecorator } from "../../../../.rnstorybook/preview";
import { Home } from "./Home";

const Stack = createNativeStackNavigator();

const meta: Meta = {
	title: "Components",
	decorators: [AppDecorator, NavigationDecorator],
};

export default meta;

type Story = StoryObj;

export const HomeScreen: Story = {
	name: "Home Screen",
	render: (args) => (
		<Stack.Navigator>
			<Stack.Screen name="Home" component={Home} />
		</Stack.Navigator>
	),
};
