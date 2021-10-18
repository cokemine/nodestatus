import React, { FC } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography, Marker
} from 'react-simple-maps';

import isEqual from 'fast-deep-equal/es6/react';
/* https://simplemaps.com/data/world-cities */
import countries from 'i18n-iso-countries';
import coordinates from '../utils/coordinates.json';
/* https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json */
import geoMaps from '../utils/world-110m.json';

interface Props {
  count: Record<string, number>,
  setTooltipContent: (str: string) => void
}

const MapChart: FC<Props> = props => (
  <div>
    <ComposableMap
      projection="geoMercator"
      projectionConfig={{ center: [0, 45] }}
      data-tip=""
      className="w-full h-52 xl:h-72 lg:64 md:h-60 sm:h-56"
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
              onMouseEnter={() => {
                const country = countries.getName(key, 'en', { select: 'official' });
                props.setTooltipContent(`${country}: ${count}`);
              }}
              onMouseLeave={() => props.setTooltipContent('')}
            >
              <circle r={6 + count} fill="#8B5CF6" stroke="#fff" strokeWidth={2} />
            </Marker>
          );
        })
      }
    </ComposableMap>
  </div>
);

export default React.memo(MapChart, isEqual);
