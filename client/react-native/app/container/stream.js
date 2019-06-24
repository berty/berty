import { Mutex } from 'async-mutex'
import { debounce, throttle } from 'throttle-debounce'
import { Component } from 'react'
import objectHash from 'object-hash'
import { deepFilterEqual, deepEqual } from './helper'
import Case from 'case'

export class Stream extends Component {
  get method () {
    return this.props.method || function () {}
  }

  get request () {
    return this.props.request
  }

  get response () {
    return this.props.response
  }

  static defaultProps = {
    request: {},
    response: (queue, data) => {
      queue.length = 0
      queue.push(data)
    },
    fallback: null,
    children: (data, index) => null,
  }

  state = {
    queue: null,
  }

  componentDidMount () {
    this.invoke()
  }

  componentWillUnmount () {}

  invoke = async () => {
    const stream = await this.method(this.request)
    const queue = []

    stream.on('data', response => {
      this.props.response(queue, response)
      this.setStateDebounce({ queue })
    })
  }

  setStateDebounce = debounce(50, this.setState)

  setStateDebounce = throttle(50, this.setState)

  render () {
    if (this.state.queue == null) {
      return this.props.fallback
    }
    return this.state.queue.map(this.props.children)
  }
}

export class StreamPagination extends Stream {
  queue = []

  cursor = ''

  count = 0

  loading = true

  componentWillReceiveProps (props) {
    if (!deepEqual(props, this.props)) {
      this.retry()
    }
  }

  retry = () => {
    this.loading = true
    this.cursor = ''
    this.queue = []
    this.invokeHashTable = {}
    this.forceUpdate(this.invoke)
  }

  cursorExtractor = item =>
    this.props.cursorExtractor
      ? this.props.cursorExtractor(item)
      : item[Case.camel(this.paginate.orderBy || 'id')]

  compareInf = (a, b) => (this.paginate.orderDesc ? a >= b : a <= b)

  compareSup = (a, b) => (this.paginate.orderDesc ? a < b : a > b)

  add = change => {
    const { newValue } = change

    // delete item from list if not equal with filter
    if (!deepFilterEqual(this.filter, newValue)) {
      this.delete({ ...change, oldValue: newValue })
      return
    }

    // find where to put the new item
    const cursor = this.cursorExtractor(newValue)

    // if item exist, update it
    const index = this.queue.findIndex(item => newValue.id === item.id)
    if (index !== -1) {
      // if cursor has not changed, just update item
      if (cursor === this.cursorExtractor(this.queue[index])) {
        this.queue.splice(index, 1, newValue)
        return
      } else {
        // else, update his position
      }
    }

    for (let topIndex in this.queue) {
      let itemTop = this.queue[topIndex]
      let infTop = this.compareInf(cursor, this.cursorExtractor(itemTop))
      if (infTop) {
        // if item exist, update his position
        if (index !== -1 && index >= topIndex) {
          this.queue.splice(
            // remove all items from top
            topIndex,
            // delete items from top to index (included)
            index + 1 - topIndex,
            // replace first by index updated
            newValue,
            // add the all items from top to index (not included)
            ...this.queue.slice(topIndex, index)
          )
        } else {
          this.queue.splice(topIndex, 0, newValue)
        }
        return
      }
      let bottomIndex = this.queue.length - topIndex - 1
      let itemBottom = this.queue[bottomIndex]
      let supBottom = this.compareSup(cursor, this.cursorExtractor(itemBottom))
      if (supBottom) {
        // if item exist, update his position
        if (index !== -1 && index < bottomIndex) {
          this.queue.splice(
            // remove all items from index
            index,
            // delete items from index (included) to bottom
            bottomIndex - (index + 1),
            // add all items from index (not included) to bottom
            ...this.queue.slice(index + 1, bottomIndex + 1),
            // replace last by index updated
            newValue
          )
        } else {
          if (bottomIndex + 1 < this.queue.length || change.force) {
            this.queue.splice(bottomIndex + 1, 0, newValue)
          }
        }
        return
      }
    }

    // if forced to add, push it
    if (this.queue.length === 0 && change.force) {
      this.queue.push(newValue)
      return
    }

    if (this.queue.length < this.paginate.first) {
      this.invoke()
    }
  }

  update = change => {
    this.add(change)
  }

  delete = change => {
    const { oldValue } = change

    const index = this.queue.findIndex(item => item.id === oldValue.id)
    if (index === -1) {
      return
    }
    this.queue.splice(index, 1)
  }

  observeMutex = new Mutex()
  observe = async change => {
    this.observeMutex.acquire().then(unlock => {
      this[change.type](change)
      unlock()
    })
    this.smartForceUpdate()
  }

  smartForceUpdateMutex = new Mutex()

  smartForceUpdate = async () => {
    if (this.smartForceUpdateMutex.isLocked()) {
      return
    }
    const release = await this.smartForceUpdateMutex.acquire()
    this.forceUpdateDebounced(release)
  }

  forceUpdateDebounced = debounce(16, this.forceUpdate)

  get request () {
    const {
      fallback,
      children,
      context,
      request,
      response,
      filter,
      paginate,
      ...props
    } = this.props
    return { filter: this.filter, paginate: this.paginate, ...props }
  }

  get filter () {
    if (this.props.filter) {
      return this.props.filter
    }
    return {}
  }

  get paginate () {
    if (this.props.paginate) {
      return this.props.paginate({
        cursor: this.cursor,
        count: this.queue.length,
      })
    }
    return {
      first: 10,
      after: this.cursor,
    }
  }

  invokeHashTable = {}

  invoke = async () => {
    const queue = []

    const request = this.request
    const requestHash = objectHash(request)
    if (this.invokeHashTable[requestHash]) {
      return
    }
    this.invokeHashTable[requestHash] = true

    this.loading = true
    const stream = await this.method(request)

    stream.on('data', response => {
      queue.push(response)
      this.observe({
        type: 'add',
        newValue: response,
        name: response.id,
        force: true,
      })
    })

    stream.on('end', () => {
      this.loading = false

      if (queue.length !== 0) {
        this.cursor =
          queue[queue.length - 1][Case.camel(this.paginate.orderBy || 'id')]
      }

      this.smartForceUpdate()

      this.invokeHashTable[requestHash] = false
    })
  }

  render () {
    if (this.props.fallback && this.loading && this.queue.length === 0) {
      return this.props.fallback
    }
    return this.props.children({
      queue: this.queue,
      paginate: this.invoke,
      count: this.queue.length,
      cursor: this.cursor,
      loading: this.loading,
      retry: this.retry,
    })
  }
}

export default Stream
