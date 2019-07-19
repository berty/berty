import { observable, computed, action, reaction, flow } from 'mobx'
import { get } from 'lodash'
import { rpc, service } from '@berty/bridge'

import routing from '../store/routing'
import peers from '../store/peers'

// [{key: "someKey", value: "someValue"}] => {someKey: someValue}
const convertListMap = l => l.reduce((m, e) => m.set(e.key, e.value), new Map())

class Node {
  @observable rateInOverTime = []
  @observable rateOutOverTime = []
  @observable rateIn = 0
  @observable maxRateIn = 42
  @observable maxRateOut = 42
  @observable rateOut = 0
  @observable id = null
  @observable deviceInfos = null
  @observable appVersion = null
  watchdog = undefined
  resetTimeout = undefined

  @computed get infos() {
    const raw = get(this, 'deviceInfos.infos')
    if (!raw) return null
    return convertListMap(raw)
  }

  @computed get prettyVersion() {
    const { infos } = this

    if (!infos) return null
    const versions = JSON.parse(infos.get('versions'))
    const { BuildMode, GitBranch, GitSha, Version } = versions.Core
    return `Version: ${Version}, BuildMode: ${BuildMode}, Branch: ${GitBranch}, Commit: ${GitSha}`
  }

  @computed get prettyDeviceInfos() {
    const { infos } = this

    if (!infos) return null
    const system = JSON.parse(infos.get('system'))
    const { OS, Arch, NumCPU, Hostname } = system
    return `Host: ${Hostname}, OS: ${OS}, Arch: ${Arch}, NumCPU: ${NumCPU}`
  }

  @computed get url() {
    const hash = routing.location.hash
    if (!hash || typeof hash != 'string') return null
    return hash.substring(1)
  }

  @action.bound async handleBandwidthData(data) {
    const { rateIn, rateOut } = data

    this.rateIn = rateIn
    if (this.maxRateIn < rateIn) this.maxRateIn = rateIn

    this.rateOut = rateOut
    if (this.maxRateOut < rateOut) this.maxRateOut = rateOut

    const TIME_SECONDS = 1800

    this.rateInOverTime.push(rateIn)
    if (this.rateInOverTime.length > TIME_SECONDS) this.rateInOverTime.shift()

    this.rateOutOverTime.push(rateOut)
    if (this.rateOutOverTime.length > TIME_SECONDS) this.rateOutOverTime.shift()
  }

  @action.bound reset = flow(function* resetFlow() {
    if (this.watchdog !== undefined) {
      this.watchdog = clearInterval(this.watchdog)
    }
    if (this.resetTimeout !== undefined) {
      this.resetTimeout = clearTimeout(this.resetTimeout)
    }

    if (this.id !== null) {
      this.id = null
      this.deviceInfos = null
      this.appVersion = null
      this.rateInOverTime.clear()
      this.rateOutOverTime.clear()
      this.rateIn = 0
      this.rateOut = 0
      this.maxRateIn = 42
      this.maxRateOut = 42
    }

    const rpcCl = rpc.grpcWebWithHostname(this.url)
    const api = service.create(service.NodeService, rpcCl)

    let idObj
    try {
      idObj = yield api.iD({})
    } catch (e) {
      console.error(e)
    }

    if (!idObj) {
      this.resetTimeout = setTimeout(this.reset, 2000)
      return
    } else {
      this.watchdog = setInterval(() => api.iD({}).catch(this.reset), 2000)
    }

    this.deviceInfos = yield api.deviceInfos({})
    this.appVersion = yield api.appVersion({})
    ;(yield api.monitorBandwidth({})).on('data', this.handleBandwidthData)

    yield peers.reset(api)

    this.id = idObj.id
  })
}

const node = new Node()

reaction(() => node.url, node.reset, { fireImmediately: true })

export default node
