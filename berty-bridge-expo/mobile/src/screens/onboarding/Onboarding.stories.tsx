import React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	AppDecorator,
	NavigationDecorator,
} from "../../../.rnstorybook/preview";
import { CreatingAccount, OpeningAccount } from "../account";
import { CreateAccount } from "./CreateAccount/CreateAccount";
import { DefaultMode } from "./DefaultMode/DefaultMode";


const meta: Meta = {
	title: "Onboarding",
	decorators: [AppDecorator, NavigationDecorator],
};

export default meta;

type Story = StoryObj;

export const CreateAccountStory: Story = {
	name: "Create Account",
	render: (args) => <CreateAccount {...args} />,
};

export const DefaultModeStory: Story = {
	name: "Default Mode",
	render: (args) => <DefaultMode {...args} />,
};

export const CreatingAccountStory: Story = {
	name: "Creating Account",
	render: (args) => <CreatingAccount {...args} />,
};

export const Onboarding: Story = {
	name: "Onboarding",
	parameters: {
		routeParams: {
			selectedAccount: "123-account-id-123",
			isNewAccount: true,
		},
	},
	render: () => <OpeningAccount />,
};
