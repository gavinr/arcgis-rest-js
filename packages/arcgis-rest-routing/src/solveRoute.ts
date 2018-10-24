/* Copyright (c) 2017-2018 Environmental Systems Research Institute, Inc.
 * Apache-2.0 */

import { request } from "@esri/arcgis-rest-request";

import {
  ISpatialReference,
  IPoint,
  IFeature
} from "@esri/arcgis-rest-common-types";

import {
  worldRoutingService,
  ILocation,
  IEndpointRequestOptions
} from "./helpers";

export interface ISolveRouteRequestOptions extends IEndpointRequestOptions {
  stops: Array<IPoint | ILocation | [number, number]>;
  travelMode?: string;
  barriers?: string[];
  endpoint?: string;
}

export interface ISolveRouteResponse {
  messages: string[];
  checksum: string;
  routes: {
    fieldAliases: object;
    geometryType: string;
    spatialReference: ISpatialReference;
    features: IFeature[];
  };
  directions?: Array<{
    routeId: number;
    routeName: string;
    summary: object;
    featres: IFeature[];
  }>;
}

function isLocationArray(
  coords: ILocation | IPoint | [number, number]
): coords is [number, number] {
  return (coords as [number, number]).length === 2;
}

function isLocation(
  coords: ILocation | IPoint | [number, number]
): coords is ILocation {
  return (
    (coords as ILocation).latitude !== undefined ||
    (coords as ILocation).lat !== undefined
  );
}

/**
 * todo - doc
 */
export function solveRoute(
  requestOptions: ISolveRouteRequestOptions
): Promise<ISolveRouteResponse> {
  const options: ISolveRouteRequestOptions = {
    endpoint: requestOptions.endpoint || worldRoutingService,
    params: {},
    ...requestOptions
  };

  // the SAS service doesnt support anonymous requests
  if (
    !requestOptions.authentication &&
    options.endpoint === worldRoutingService
  ) {
    return Promise.reject(
      "Routing using the ArcGIS service requires authentication"
    );
  }

  const stops: string[] = requestOptions.stops.map(coords => {
    if (isLocationArray(coords)) {
      return coords.join();
    } else if (isLocation(coords)) {
      if (coords.lat) {
        return coords.long + "," + coords.lat;
      } else if (coords.latitude) {
        return coords.longitude + "," + coords.latitude;
      }
    } else {
      return coords.y + "," + coords.x;
    }
  });
  options.params.stops = stops.join(";");

  return request(options.endpoint + "solve", options);
}

export default {
  solveRoute
};
