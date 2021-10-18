import React, { FC } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography, Marker
} from 'react-simple-maps';

import isEqual from 'fast-deep-equal/es6/react';
/* https://simplemaps.com/data/world-cities */
import coordinates from '../utils/coordinates.json';
/* https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json */
import geoMaps from '../utils/world-110m.json';

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
      <Geographies geography={geoMaps}>
        {({ geographies }) => geographies.filter(d => d.properties.REGION_UN !== 'Antarctica').map(geo => (
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
        ))}
      </Geographies>
      {
        Object.keys(props.count).map(key => {
          const count = props.count[key];
          const K = key as keyof typeof coordinates;
          if (!coordinates[K]) return;
          return (
            <Marker
              coordinates={[coordinates[K].lng, coordinates[K].lat]}
            >
              <circle r={8 + count} fill="#8B5CF6" stroke="#fff" strokeWidth={2} />
            </Marker>
          );
        })
      }
    </ComposableMap>
  </div>
);

export default React.memo(MapChart, isEqual);
