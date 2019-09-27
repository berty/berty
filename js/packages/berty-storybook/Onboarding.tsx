import React from 'react'
import { StyleSheet } from 'react-native'
import { Text, Button, Layout } from 'react-native-ui-kitten'
import { Grid, Row, Col } from 'react-native-easy-grid'

export namespace Onboarding {
  export const style = StyleSheet.create({
    layout: { flex: 1, padding: 16 },
    text: { textAlign: 'center', lineHeight: 30 },
    button: { flex: 0, alignSelf: 'center' },
    grid: { alignItems: 'center' },
    col: { alignItems: 'center' },
    row: { alignItems: 'center' },
  })

  export const GetStarted: React.FunctionComponent = () => (
    <Layout style={style.layout}>
      <Grid style={style.grid}>
        <Row size={5} />
        <Row size={2}>
          <Col>
            <Text style={style.text}>
              The secure peer-to-peer messaging app that works with or without
              internet access, cellular data or trust in the network
            </Text>
          </Col>
        </Row>
        <Row size={2}>
          <Col>
            <Button style={style.button}>GET STARTED </Button>
          </Col>
        </Row>
      </Grid>
    </Layout>
  )

  export const SelectMode: React.FunctionComponent = () => null

  export const Performance: React.FunctionComponent = () => null

  export const Privacy: React.FunctionComponent = () => null

  // const CreateYourAccount: React.FunctionComponent = () => null
  // const GeneratingYourKey: React.FunctionComponent = () => null
  // const Notifications: React.FunctionComponent = () => null
  // const Bluetooth: React.FunctionComponent = () => null
  // const SetupFinished: React.FunctionComponent = () => null
}
