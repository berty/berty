import React, { PureComponent } from 'react'
import { Menu, Header } from '../../../Library'
import { mutations } from '../../../../graphql'

const testScenarios = [
  {
    key: 'all',
    icon: 'sun',
    title: 'All tests',
  },
  {
    key: 'keychain',
    icon: 'lock',
    title: 'Keychain',
  },
  {
    key: 'always-true',
    icon: 'check-circle',
    title: 'Always true',
  },
  {
    key: 'always-false',
    icon: 'x-circle',
    title: 'Always false',
  },
  {
    key: 'missing',
    icon: 'help-circle',
    title: 'Missing test',
  },
  {
    key: 'panicking',
    icon: 'alert-triangle',
    title: 'Panicking',
  },
]

class Observable {
  constructor () {
    this.successHandlers = []
    this.errorHandlers = []
  }

  onError = func => {
    this.errorHandlers.push(func)
  }

  error = value => {
    for (let errorHandler of this.errorHandlers) {
      errorHandler(value)
    }
  }

  onSuccess = func => {
    this.errorHandlers.push(func)
  }

  success = value => {
    for (let errorHandler of this.errorHandlers) {
      errorHandler(value)
    }
  }
}

export default class Tests extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title='Tests'
        titleIcon='check-circle'
        backBtn
      />
    ),
  })

  render () {
    return (
      <Menu absolute>
        <Menu.Section>
          <React.Fragment>
            {testScenarios.map(({ key, icon, title }) =>
              <Menu.Item
                key={key}
                icon={icon}
                title={title}
                onPress={async () => {
                  const promise = mutations.runIntegrationTests.commit({ name: key })
                  const obs = new Observable()

                  try {
                    this.props.navigation.push('devtools/testresult', {
                      result: promise,
                      title: title,
                      resultObserver: obs,
                    })
                  } catch (e) {
                    console.error(e)
                  }

                  try {
                    const result = await promise

                    obs.success(result.RunIntegrationTests)
                  } catch (e) {
                    obs.error(e)
                  }
                }}
              />
            )}
          </React.Fragment>
        </Menu.Section>
      </Menu>
    )
  }
}
