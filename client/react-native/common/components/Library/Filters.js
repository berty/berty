import React from 'react'
import { StackActions } from 'react-navigation'
import ModalScreen from './ModalScreen'
import { Switch, Text } from 'react-native'
import { Rows, Cols } from './Flex'
import { Text as FlexText } from './Text'
import Button from './Button'
import { padding } from '../../styles'
import { colors } from '../../constants'

export class FilterModal extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      ...this.props.defaultData,
    }
  }

  onDismiss = () => {
    this.close()
  }

  onFilter = () => {
    const onSave = this.props.navigation.getParam('onSave')

    if (!onSave) {
      console.error('onSave is not defined')
    }

    onSave(this.state)

    this.close()
  }

  close = () => {
    this.props.navigation.dispatch(
      StackActions.pop({
        n: 1,
      })
    )
  }

  render () {
    return (
      <ModalScreen navigation={this.props.navigation}>
        <Rows style={[padding]} align='center'>
          {this.props.title ? <Text>{this.props.title}</Text> : null}
          {React.Children.map(this.props.children, child =>
            React.cloneElement(child, {
              onChange: value => this.setState({ [child.props.name]: value }),
              value: this.state[child.props.name],
            })
          )}
          <Cols>
            <Button
              onPress={() => this.onDismiss()}
              icon={'x-circle'}
              style={{ backgroundColor: colors.red }}
            >
              Cancel
            </Button>
            <Button onPress={() => this.onFilter()} icon={'filter'}>
              Filter
            </Button>
          </Cols>
        </Rows>
      </ModalScreen>
    )
  }
}

// Impl for this is really bad, move to radio buttons instead
export const PickerFilter = ({ value, onChange, choices }) => (
  <Rows style={{ flex: 1, width: '100%' }}>
    {choices.map(({ value: choiceValue, label }) => (
      <Cols size={1} key={choiceValue}>
        <Switch
          value={value === choiceValue}
          onValueChange={() => onChange(choiceValue)}
          style={{ width: 50 }}
        />
        <FlexText>{label}</FlexText>
      </Cols>
    ))}
  </Rows>
)
