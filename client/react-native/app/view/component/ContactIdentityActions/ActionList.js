import React, { PureComponent } from 'react'
import { withNavigation } from 'react-navigation'
import ActionButton from './ActionButton'
import colors from '@berty/common/constants/colors'
import Flex from '../Flex'
import { showMessage } from 'react-native-flash-message'
import { withGoBack } from '../BackActionProvider'

class ActionList extends PureComponent {
  render = () => {
    let { children, inModal } = this.props
    children = React.Children.toArray(children).filter(c => c !== null)

    const count = children.length

    if (count > 4) {
      children = children.slice(0, 4)
    }

    const large = count < 3

    return (
      <Flex.Cols>
        {React.Children.map(children, action => (
          <action.type
            {...action.props}
            large={large}
            dismissOnSuccess={inModal && action.props.dismissOnSuccess}
          />
        ))}
      </Flex.Cols>
    )
  }
}

class Action extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      loading: false,
    }

    this._mounted = false
  }

  componentWillUnmount () {
    this._mounted = false
  }

  componentDidMount () {
    this._mounted = true
  }

  render = () => {
    const {
      large,
      icon,
      title,
      color = colors.blue,
      action,
      dismissOnSuccess,
      goBack,
      successMessage,
      successType,
    } = this.props
    const ButtonClass = large ? ActionButton.Large : ActionButton

    return (
      <ButtonClass
        icon={icon}
        title={title}
        color={color}
        onPress={
          !this.state.loading &&
          (async () => {
            await new Promise(resolve =>
              this.setState({ loading: true }, resolve)
            )

            try {
              await action()

              if (successMessage) {
                showMessage({
                  message: successMessage,
                  type: successType || 'info',
                  icon: successType || 'info',
                  position: 'top',
                })
              }

              if (dismissOnSuccess) {
                goBack(null)
              }

              if (this._mounted) {
                await new Promise(resolve =>
                  this.setState({ loading: false }, resolve)
                )
              }
            } catch (e) {
              showMessage({
                message: String(e),
                type: 'danger',
                icon: 'danger',
                position: 'top',
              })

              await new Promise(resolve =>
                this.setState({ loading: false }, resolve)
              )
            }
          })
        }
      />
    )
  }
}

export default ActionList
ActionList.Action = withGoBack(withNavigation(Action))
