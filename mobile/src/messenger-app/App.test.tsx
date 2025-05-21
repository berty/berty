import "react-native";
import React from "react";
import { render } from "@testing-library/react";

import App from "./App";

// Note: test renderer must be required after react-native.

jest.mock("react-native/Libraries/LogBox/LogBox");

describe("Berty MessengerApp", () => {
	beforeEach(() => {
		jest.resetModules();
		jest.resetAllMocks();
		jest.useFakeTimers();
	});
	it("Renderer test", (done) => {
		render(<App />);
		done();
	});
});
