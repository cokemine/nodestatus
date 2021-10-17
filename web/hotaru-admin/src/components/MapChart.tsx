import React, { FC } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography, Marker
} from 'react-simple-maps';

import isEqual from 'fast-deep-equal/es6/react';

const geoUrl = 'https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json';

interface Props {
  count: Record<string, number>,
}

const MapChart: FC<Props> = props => (
  <div>
    <ComposableMap
      style={{ width: '100%', height: 280 }}
      projection="geoMercator"
      projectionConfig={{ center: [0, 40] }}
    >
      <Geographies geography={geoUrl}>
        {({ geographies }) => geographies.filter(d => d.properties.REGION_UN !== 'Antarctica').map(geo => {
          const region = geo.properties.ISO_A2;
          const { coordinates } = geo.geometry;
          if (props.count[region]) {
            console.log(region, coordinates);
          }
          return (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              fill="#f9fafb"
              style={{
                default: { outline: 'none' },
                hover: { outline: 'none' },
                pressed: { outline: 'none' }
              }}
            />
          );
        })}
      </Geographies>
      <Marker
        coordinates={[116, 39.91]}
      >
        <circle r={10} fill="#8B5CF6" stroke="#fff" strokeWidth={2} />

      </Marker>
    </ComposableMap>
  </div>
);

export default React.memo(MapChart, isEqual);
