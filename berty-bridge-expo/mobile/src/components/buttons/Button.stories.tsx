import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { StyleSheet, View } from "react-native";

import {
	AppDecorator,
	Spacer,
	ScroolViewDecorator,
} from "../../../.rnstorybook/preview";
import {
	ErrorButtonIconLeft,
	PrimaryButton,
	SecondaryAltButton,
	SecondaryButton,
	SecondaryButtonIconLeft,
	PrimaryFloatingButton,
	SecondaryButtonIconRight,
	PrimaryAltButton,
	TertiaryButtonIconLeft,
	TertiaryAltButton,
} from "../buttons";
// the buttons below are not yet being used in the APP and need to be imported directly:
import { ErrorButton } from "./error/ErrorButton";
import { ErrorButtonIconRight } from "./error/ErrorButtonIconRight";
import { SecondaryFloatingButton } from "./floating-buttons/secondary/SecondaryFloatingButton";
import { PrimaryButtonIconLeft } from "./primary/PrimaryButtonIconLeft";
import { PrimaryButtonIconRight } from "./primary/PrimaryButtonIconRight";
import { TertiaryButton } from "./tertiary/TertiaryButton";
import { TertiaryButtonIconRight } from "./tertiary/TertiaryButtonIconRight";
import { VerticalButtons } from "./vertical/VerticalButtons";

const meta: Meta = {
	title: "Button",
	decorators: [AppDecorator, ScroolViewDecorator],
};

export default meta;

type Story = StoryObj;

const onPress = () => console.log("onPress");

export const CreateAccountStory: Story = {
	name: "Primary Buttons",
	render: (args) => (
		<>
			<PrimaryButton onPress={onPress}>{"Primary"}</PrimaryButton>
			<Spacer />
			<PrimaryAltButton onPress={onPress}>
				{"Primary Alt Button"}
			</PrimaryAltButton>
			<Spacer />
			<PrimaryButtonIconLeft onPress={onPress}>
				{"Primary Button Icon Left"}
			</PrimaryButtonIconLeft>
			<Spacer />
			<PrimaryButtonIconRight onPress={onPress}>
				{"Primary Button Icon Right"}
			</PrimaryButtonIconRight>
			<Spacer />
		</>
	),
};

export const SecondaryButtons: Story = {
	name: "Secondary Buttons",
	render: (args) => (
		<>
			<SecondaryButton onPress={onPress}>{"Secondary"}</SecondaryButton>
			<Spacer />
			<SecondaryAltButton onPress={onPress}>
				{"Secondary Alt Button"}
			</SecondaryAltButton>
			<Spacer />
			<SecondaryButtonIconLeft onPress={onPress}>
				{"Secondary Button Icon Left"}
			</SecondaryButtonIconLeft>
			<Spacer />
			<SecondaryButtonIconRight onPress={onPress}>
				{"Secondary Button Icon Right"}
			</SecondaryButtonIconRight>
			<Spacer />
		</>
	),
};

export const TertiaryButtons: Story = {
	name: "Tertiary Buttons",
	render: (args) => (
		<>
			<TertiaryButton onPress={onPress}>{"Tertiary Button"}</TertiaryButton>
			<Spacer />
			<TertiaryAltButton onPress={onPress}>
				{"Tertiary Alt Button"}
			</TertiaryAltButton>
			<Spacer />
			<TertiaryButtonIconLeft onPress={onPress}>
				{"Tertiary Button Icon Right"}
			</TertiaryButtonIconLeft>
			<Spacer />
			<TertiaryButtonIconRight onPress={onPress}>
				{"Tertiary Button Icon Right"}
			</TertiaryButtonIconRight>
			<Spacer />
		</>
	),
};

export const ErrorButtons: Story = {
	name: "Error Buttons",
	render: (args) => (	<>
		<ErrorButton onPress={onPress}>{"Error Button"}</ErrorButton>
		<Spacer />
		<ErrorButtonIconLeft onPress={onPress}>
			{"Error Button Icon Left"}
		</ErrorButtonIconLeft>
		<Spacer />
		<ErrorButtonIconRight onPress={onPress}>
			{"Error Button Icon Left"}
		</ErrorButtonIconRight>
		<Spacer />
	</>
)}

export const PrimaryFloatingButtons: Story = {
	name: "Primary Floating Buttons",
	render: (args) => (	<>
		<PrimaryFloatingButton onPress={onPress} />
		<View style={styles.floatingButton}>
			<SecondaryFloatingButton onPress={onPress} />
		</View>
	</>
)}

export const Buttons: Story = {
	name: "All Buttons",
	render: (args) => (
		<>
			<PrimaryButton onPress={onPress}>{"Primary"}</PrimaryButton>
			<Spacer />

			<SecondaryButton onPress={onPress}>{"Secondary"}</SecondaryButton>
			<Spacer />

			<TertiaryButton onPress={onPress}>{"Tertiary Button"}</TertiaryButton>
			<Spacer />

			<ErrorButton onPress={onPress}>{"Error Button"}</ErrorButton>
			<Spacer />

			<VerticalButtons
				children={["Vertical Buttons 1", "Vertical Buttons 2"]}
				onPressTop={onPress}
				onPressBottom={onPress}
			/>

			<View style={styles.floatingButton}>
				<PrimaryFloatingButton onPress={onPress} />
			</View>
		</>
	),
};

const styles = StyleSheet.create({
	floatingButton: { marginRight: 60, marginTop: 120 },
});
