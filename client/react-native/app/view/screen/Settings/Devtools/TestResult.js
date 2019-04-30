import React, { PureComponent } from 'react'
import RN from 'react-native'
import {
  Header,
  Screen,
  Flex,
  TextInputMultilineFix,
  Button,
} from '@berty/view/component'
import { colors } from '@berty/common/constants'
import {
  marginTop,
  padding,
  paddingVertical,
  rounded,
  textTiny,
} from '@berty/common/styles'

export default class TestResult extends PureComponent {
  constructor (props) {
    super(props)

    const resultObserver = props.navigation.getParam('resultObserver')

    resultObserver.onSuccess(val => {
      try {
        this.setState({
          success: val.success,
          verbose: val.verbose,
        })
      } catch (e) {
        console.error(e)
      }
    })

    this.state = {
      success: null,
      verbose: '',
    }
  }

  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title={navigation.getParam('title', 'Test result')}
        titleIcon='check-circle'
        backBtn
      />
    ),
  })

  render () {
    let statusMessage = 'Running...'
    let statusColor = colors.black
    let statusIcon = 'more-horizontal'

    if (this.state.success === false) {
      statusMessage = 'Failed'
      statusColor = colors.error
      statusIcon = 'x-circle'
    } else if (this.state.success === true) {
      statusMessage = 'Success'
      statusColor = colors.success
      statusIcon = 'check-circle'
    }

    return (
      <Screen style={[{ backgroundColor: colors.white }, paddingVertical]}>
        <Flex.Rows style={[padding]} align='center'>
          <Button
            icon={statusIcon}
            background={statusColor}
            margin
            padding
            rounded={23}
            height={24}
            medium
            middle
            center
            self='stretch'
          >
            {statusMessage}
          </Button>
          <TextInputMultilineFix
            style={[
              {
                width: 330,
                height: 330,
                backgroundColor: colors.grey7,
                color: colors.black,
                flexWrap: 'wrap',
              },
              textTiny,
              padding,
              marginTop,
              rounded,
            ]}
            multiline
            placeholder='Test results will be displayed here'
            value={this.state.verbose}
            selectTextOnFocus
          />
          <Button
            icon='share'
            background={colors.blue}
            margin
            padding
            rounded={23}
            height={24}
            medium
            middle
            center
            self='stretch'
            onPress={() =>
              RN.Share.share({ message: this.state.verbose }).catch(() => null)
            }
          >
            Export
          </Button>
        </Flex.Rows>
      </Screen>
    )
  }
}
