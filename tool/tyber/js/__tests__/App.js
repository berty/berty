import "react-native";
import React from "react";
import { App } from "../app/App.tsx";

// Note: test renderer must be required after react-native.
import renderer from "react-test-renderer";

// Mock window and its methods used by App
global.window = {
	matchMedia: () => ({
		matches: true,
		addEventListener: () => {},
		removeEventListener: () => {},
	}),
};

it("renders correctly", () => {
	renderer.create(<App />);
});
