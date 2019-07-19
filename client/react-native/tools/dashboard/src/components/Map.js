import React, { Component, Fragment } from 'react'
import { Map as LeafletMap, TileLayer, Marker } from 'react-leaflet'
import { observer, inject } from 'mobx-react'
import wu from 'wu'
import HeatmapLayer from 'react-leaflet-heatmap-layer'

import { COUNTRIES_INFO } from '../countriesPositions'

const HEAT_GAIN = 100.0

export default
@inject('locations')
@observer
class extends Component {
  render () {
    const { locations, showHeat = true, showMarkers } = this.props

    const markers = wu(locations.entries()).reduce((m, [key, value]) => {
      const llStr = JSON.stringify(
        COUNTRIES_INFO.get(JSON.parse(key).country).ll
      ) // Map does === comparison so we need to use a string key
      const v = m.get(llStr) || 0
      return m.set(llStr, v + value)
    }, new Map())
    if (!markers || markers.size < 1) return null

    const heatPoints = showHeat && [
      ...wu(markers.entries()).map(([llStr, value]) => [
        ...JSON.parse(llStr),
        value,
      ]),
    ]

    return (
      <Fragment>
        <h1 style={{ textAlign: 'center' }}>Connected peers heatmap</h1>
        <LeafletMap center={[0, 0]} zoom={1}>
          <TileLayer
            // TileLayer skins: https://leaflet-extras.github.io/leaflet-providers/preview/
            url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {showHeat &&
          heatPoints.length > 1 && ( // can crash if only one point, TODO: check if this comes from wu, otherwise open issue at react-leaflet-heatmap-layer
            <HeatmapLayer
              fitBoundsOnLoad // TODO: fit bounds even when only showMarkers is on
              // fitBoundsOnUpdate
              radius={10}
              blur={5}
              points={heatPoints}
              longitudeExtractor={m => m[1]}
              latitudeExtractor={m => m[0]}
              intensityExtractor={m => m[2] * HEAT_GAIN}
            />
          )}
          {showMarkers && [
            ...wu(markers.keys()).map(llStr => (
              <Marker key={llStr} position={JSON.parse(llStr)} />
            )),
          ]}
        </LeafletMap>
      </Fragment>
    )
  }
}
