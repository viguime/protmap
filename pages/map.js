import React, { useState, useRef, useCallback } from "react";

import { LoadScript, GoogleMap, Polygon } from "@react-google-maps/api";


// This example presents a way to handle editing a Polygon
// The objective is to get the new path on every editing event :
// - on dragging the whole Polygon
// - on moving one of the existing points (vertex)
// - on adding a new point by dragging an edge point (midway between two vertices)

// We achieve it by defining refs for the google maps API Polygon instances and listeners with `useRef`
// Then we bind those refs to the currents instances with the help of `onLoad`
// Then we get the new path value with the `onEdit` `useCallback` and pass it to `setPath`
// Finally we clean up the refs with `onUnmount`

const map = () => {
  // Store Polygon path in state
  const [path, setPath] = useState([
    { lat: 52.52549080781086, lng: 13.398118538856465 },
    { lat: 52.48578559055679, lng: 13.36653284549709 },
    { lat: 52.48871246221608, lng: 13.44618372440334 }
  ]);

  // Define refs for Polygon instance and listeners
  const polygonRef = useRef(null);
  const listenersRef = useRef([]);

  // Call setPath with new edited path
  const onEdit = useCallback(() => {
    if (polygonRef.current) {
      const nextPath = polygonRef.current
        .getPath()
        .getArray()
        .map(latLng => {
          return { lat: latLng.lat(), lng: latLng.lng() };
        });
      setPath(nextPath);
    }
  }, [setPath]);

  // Bind refs to current Polygon and listeners
  const onLoad = useCallback(
    polygon => {
      polygonRef.current = polygon;
      const path = polygon.getPath();
      listenersRef.current.push(
        path.addListener("set_at", onEdit),
        path.addListener("insert_at", onEdit),
        path.addListener("remove_at", onEdit)
      );
    },
    [onEdit]
  );

  // Clean up refs
  const onUnmount = useCallback(() => {
    listenersRef.current.forEach(lis => lis.remove());
    polygonRef.current = null;
  }, []);

  console.log("The path state is", path);

  return (
    <div className="App">
      <LoadScript
        id="script-loader"
        googleMapsApiKey=""
        language="en"
        region="us"
      >
        <GoogleMap
          mapContainerClassName="App-map"
          center={{ lat: 52.52047739093263, lng: 13.36653284549709 }}
          zoom={12}
          version="weekly"
          on
        >
          <Polygon
            // Make the Polygon editable / draggable
            editable
            draggable
            path={path}
            // Event used when manipulating and adding points
            onMouseUp={onEdit}
            // Event used when dragging the whole Polygon
            onDragEnd={onEdit}
            onLoad={onLoad}
            onUnmount={onUnmount}
          />
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

export default map