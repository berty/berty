import React from "react";
import {View, Text} from "react-native";

export default api => {
  const style = {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  };

  function CenteredView(props) {
    return <View style={style}>{props.children}</View>;
  }

  api.storiesOf("CenteredView", module).add("default view", function() {
    return (
      <CenteredView>
        <Text>Hello Storybook</Text>
      </CenteredView>
    );
  });

  api.storiesOf("OtherCenteredView", module).add("default view", function() {
    return (
      <CenteredView>
        <Text>Hello Storybook 2</Text>
      </CenteredView>
    );
  });
};
