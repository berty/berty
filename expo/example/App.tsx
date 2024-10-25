import { StyleSheet, Text, View } from 'react-native';

import * as BertyMessenger from 'berty-messenger';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>{BertyMessenger.hello()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
