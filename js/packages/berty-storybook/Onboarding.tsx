import React, { useState, useRef } from 'react'
import {
  SafeAreaView,
  View,
  StyleSheet,
  ActivityIndicator as Spinner,
} from 'react-native'
import { Text, Button, Layout, Input } from 'react-native-ui-kitten'
import { Grid, Row, Col } from 'react-native-easy-grid'
import Swiper from 'react-native-swiper'
import { Card, TouchableCard } from '@berty-tech/shared-storybook'
import styles from './styles'

type Navigation = () => void
type Form<T> = (arg0: object) => Promise<void>

const _styles = StyleSheet.create({
  swiperCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 32,
  },
})

export const GetStarted: React.FC<{
  selectMode?: Navigation
}> = ({ selectMode }) => (
  <Layout style={[styles.flex]}>
    <Grid>
      <Row size={5} />
      <Row size={2}>
        <Col>
          <Text style={[styles.textCenter, styles.padding]}>
            The secure peer-to-peer messaging app that works with or without
            internet access, cellular data or trust in the network
          </Text>
        </Col>
      </Row>
      <Row size={2}>
        <Col>
          <Button style={[styles.center]} onPress={selectMode}>
            GET STARTED
          </Button>
        </Col>
      </Row>
    </Grid>
  </Layout>
)

export const SelectMode: React.FC<{
  privacy?: Navigation
  performance?: Navigation
}> = ({ privacy, performance }) => (
  <Layout style={[styles.flex]}>
    <SafeAreaView style={styles.flex}>
      <Text
        style={[styles.center, styles.textCenter, styles.paddingTop]}
        category="h4"
      >
        Select your app mode
      </Text>
      <View
        style={[
          styles.padding,
          styles.flex,
          styles.wrap,
          styles.center,
          styles.col,
          { justifyContent: 'space-evenly' },
        ]}
      >
        <TouchableCard
          style={[styles.bgBlue, styles.stretch]}
          onPress={performance}
        >
          <Text category="h5" style={[styles.textWhite]}>
            Performance
          </Text>
          <Text category="s2" style={[styles.textWhite]}>
            Easy to use - All the features
          </Text>
          <Text category="c1" style={[styles.textWhite]}>
            Receive push notifications
          </Text>
          <Text category="c1" style={[styles.textWhite]}>
            Offline messaging
          </Text>
          <Text category="c1" style={[styles.textWhite]}>
            Add contacts easily
          </Text>
          <Text category="c1" style={[styles.textWhite]}>
            Fastest message delivery
          </Text>
        </TouchableCard>
        <TouchableCard style={[styles.bgRed, styles.stretch]} onPress={privacy}>
          <Text category="h5" style={[styles.textWhite]}>
            Highest level of Privacy
          </Text>
          <Text category="s2" style={[styles.textWhite]}>
            For advanced users - Less metadatas
          </Text>
          <Text category="c1" style={[styles.textWhite]}>
            Push notifications disabled
          </Text>
          <Text category="c1" style={[styles.textWhite]}>
            Local peer discovery disabled
          </Text>
          <Text category="c1" style={[styles.textWhite]}>
            Contact requests disabled
          </Text>
        </TouchableCard>
      </View>
      <Text style={[styles.textCenter, styles.paddingVertical]} category="c1">
        All this presets can be modified at any time in the settings
      </Text>
    </SafeAreaView>
  </Layout>
)

const CreateYourAccount: React.FC<{
  submit: Form<{ name: string }>
  next: Navigation
}> = ({ submit, next }) => {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [, setErr] = useState(null)
  return (
    <Card style={[styles.bgWhite, _styles.swiperCard]}>
      <Text status="danger" style={styles.textRight}>
        Required
      </Text>
      <Text category="h4" style={[styles.paddingTop, styles.textCenter]}>
        Create your account
      </Text>
      <Text category="c1" style={[styles.paddingVertical, styles.textCenter]}>
        A name is the only information required
      </Text>
      <Input
        placeholder="Name"
        style={styles.marginTop}
        onChangeText={setName}
      />
      <Button
        style={styles.marginTop}
        disabled={loading ? true : false}
        onPress={async (): Promise<void> => {
          try {
            setLoading(true)
            await submit({ name })
            next()
          } catch (err) {
            setErr(err)
          } finally {
            setLoading(false)
          }
        }}
      >
        {loading ? '' : 'CREATE MY ACCOUNT'}
      </Button>
    </Card>
  )
}

const GeneratingYourKey: React.FC<{}> = () => (
  <Card style={[styles.bgWhite, _styles.swiperCard]}>
    <Text />
    <Text category="h4" style={[styles.paddingTop, styles.textCenter]}>
      Generating your key ...
    </Text>
    <Text category="c1" style={[styles.paddingVertical, styles.textCenter]}>
      This might take a few seconds
    </Text>
    <Spinner size="large" />
  </Card>
)

const Notifications: React.FC<{
  submit: Form<{}>
  next: Navigation
}> = ({ submit, next }) => (
  <>
    <Text
      category="h5"
      style={[
        styles.textWhite,
        styles.textCenter,
        styles.padding,
        styles.margin,
      ]}
    >
      {"Don't miss ant new message or contact request"}
    </Text>
    <Card style={[styles.bgWhite, _styles.swiperCard]}>
      <Text status="success" style={styles.textRight}>
        Recommanded
      </Text>
      <Text category="h4" style={[styles.paddingTop, styles.textCenter]}>
        Notifications
      </Text>
      <Text category="c1" style={[styles.paddingVertical, styles.textCenter]}>
        You need to authorize push notifications from Berty on your phone
      </Text>
      <Button
        style={styles.marginTop}
        onPress={async (): Promise<void> => {
          try {
            await submit({})
            next()
          } catch (err) {
            next()
          }
        }}
      >
        AUTHORIZE NOTIFICATIONS
      </Button>
      <Button
        appearance="ghost"
        size="tiny"
        style={styles.marginTop}
        onPress={next}
      >
        SKIP AND DO THIS LATER
      </Button>
    </Card>
  </>
)

const Bluetooth: React.FC<{
  submit: Form<{}>
  next: Navigation
}> = ({ submit, next }) => (
  <>
    <Text
      category="h5"
      style={[
        styles.textWhite,
        styles.textCenter,
        styles.padding,
        styles.margin,
      ]}
    >
      {
        'Communicate whithout an internet connection (wifi or data) by connecting your phone directly with peers nearby'
      }
    </Text>
    <Card style={[styles.bgWhite, _styles.swiperCard]}>
      <Text status="warning" style={styles.textRight}>
        Optional
      </Text>
      <Text category="h4" style={[styles.paddingTop, styles.textCenter]}>
        Bluetooth
      </Text>
      <Text category="c1" style={[styles.paddingVertical, styles.textCenter]}>
        To use this feature you need to autorize the use of Bluetooth on your
        phone
      </Text>
      <Button
        style={styles.marginTop}
        onPress={async (): Promise<void> => {
          try {
            await submit({})
            next()
          } catch (err) {
            next()
          }
        }}
      >
        AUTHORIZE BLUETOOTH
      </Button>
      <Button
        appearance="ghost"
        size="tiny"
        style={styles.marginTop}
        onPress={next}
      >
        SKIP AND DO THIS LATER
      </Button>
    </Card>
  </>
)

const SetupFinished: React.FC<{ next: Navigation }> = ({ next }) => (
  <>
    <Card style={[styles.bgWhite, _styles.swiperCard]}>
      <Text />
      <Text category="h4" style={[styles.paddingTop, styles.textCenter]}>
        Setup finished !
      </Text>
      <Text category="c1" style={[styles.paddingVertical, styles.textCenter]}>
        You can now use the app, start adding contacts and talk freely and
        privately with them
      </Text>
      <Button style={styles.marginTop} onPress={next}>
        START USING APP
      </Button>
    </Card>
  </>
)

export const Performance: React.FC<{
  createAccount: Form<{ name: string }>
  generateKey: Form<{}>
  authorizeNotifications: Form<null>
  authorizeBluetooth: Form<null>
  startApp: Navigation
}> = ({
  createAccount,
  generateKey,
  authorizeNotifications,
  authorizeBluetooth,
  startApp,
}) => {
  const swiperRef = useRef<Swiper>(null)
  const next: (index: number) => () => void = (index) => (): void => {
    swiperRef && swiperRef.current && swiperRef.current.scrollTo(index, true)
    return
  }
  return (
    <Layout style={[styles.flex, styles.bgBlue]}>
      <SafeAreaView style={[styles.flex]}>
        <Swiper
          index={0}
          ref={swiperRef}
          activeDotStyle={[styles.bgWhite, styles.relative]}
          scrollEnabled={false}
        >
          <CreateYourAccount
            submit={createAccount}
            next={(): void => {
              next(2)()
              generateKey({})
                .then(() => next(3)())
                .catch(() => next(1)())
            }}
          />
          <GeneratingYourKey />
          <Notifications submit={authorizeNotifications} next={next(4)} />
          <Bluetooth submit={authorizeBluetooth} next={next(5)} />
          <SetupFinished next={startApp} />
        </Swiper>
      </SafeAreaView>
    </Layout>
  )
}

export const Privacy: React.FC<{
  createAccount: Form<{ name: string }>
  generateKey: Form<{}>
  startApp: Navigation
}> = ({ createAccount, generateKey, startApp }) => {
  const swiperRef = useRef<Swiper>(null)
  const next: (index: number) => () => void = (index) => (): void => {
    swiperRef && swiperRef.current && swiperRef.current.scrollTo(index, true)
    return
  }
  return (
    <Layout style={[styles.flex, styles.bgRed]}>
      <SafeAreaView style={[styles.flex]}>
        <Swiper
          ref={swiperRef}
          activeDotStyle={[styles.bgWhite, styles.relative]}
          scrollEnabled={false}
        >
          <CreateYourAccount
            submit={createAccount}
            next={(): void => {
              next(2)()
              generateKey({})
                .then(() => next(3)())
                .catch(() => next(1)())
            }}
          />
          <GeneratingYourKey />
          <SetupFinished next={startApp} />
        </Swiper>
      </SafeAreaView>
    </Layout>
  )
}
