import React, { PureComponent } from 'react'
import { Platform } from 'react-native'
import { RNFS } from 'react-native-fs'
import { RNRestart } from 'react-native-restart'
import { Menu, Header } from '../../../Library'
import { mutations } from '../../../../graphql'

export default class Database extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title='Database'
        titleIcon='database'
        backBtn
      />
    ),
  })
  render () {
    return (
      <Menu>
        <Menu.Section customMarginTop={1}>
          <Menu.Item
            icon='database'
            title='Generate fake data'
            onPress={async () => {
              try {
                await mutations.generateFakeData.commit({ t: true })
              } catch (err) {
                this.setState({ err })
                console.error(err)
              }
            }}
          />
          {Platform.OS !== 'web' && (
            <Menu.Item
              icon='refresh-ccw'
              title='Flush database'
              onPress={() => {
                const dbPath = '/tmp/berty.berty-daemon.db'
                RNFS.exists(dbPath)
                  .then(result => {
                    if (result) {
                      return RNFS.unlink(dbPath)
                        .then(() => {
                          RNRestart.Restart()
                          console.log('DB file deleted')
                        })
                        .catch(err => {
                          console.error(err.message)
                        })
                    }
                  })
                  .catch(err => {
                    console.error(err.message)
                  })
              }}
            />
          )}
        </Menu.Section>
      </Menu>
    )
  }
}
