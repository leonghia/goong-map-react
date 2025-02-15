import WebMercatorViewport, { normalizeViewportProps } from 'viewport-mercator-project';
import { clamp } from './math-utils';
import assert from './assert';
export const MAPBOX_LIMITS = {
  minZoom: 0,
  maxZoom: 24,
  minPitch: 0,
  maxPitch: 85
};
const DEFAULT_STATE = {
  pitch: 0,
  bearing: 0,
  altitude: 1.5
};
const PITCH_MOUSE_THRESHOLD = 5;
const PITCH_ACCEL = 1.2;
export default class MapState {
  constructor(_ref) {
    let {
      width,
      height,
      latitude,
      longitude,
      zoom,
      bearing = DEFAULT_STATE.bearing,
      pitch = DEFAULT_STATE.pitch,
      altitude = DEFAULT_STATE.altitude,
      maxZoom = MAPBOX_LIMITS.maxZoom,
      minZoom = MAPBOX_LIMITS.minZoom,
      maxPitch = MAPBOX_LIMITS.maxPitch,
      minPitch = MAPBOX_LIMITS.minPitch,
      transitionDuration,
      transitionEasing,
      transitionInterpolator,
      transitionInterruption,
      startPanLngLat,
      startZoomLngLat,
      startRotatePos,
      startBearing,
      startPitch,
      startZoom
    } = _ref;
    assert(Number.isFinite(width), '`width` must be supplied');
    assert(Number.isFinite(height), '`height` must be supplied');
    assert(Number.isFinite(longitude), '`longitude` must be supplied');
    assert(Number.isFinite(latitude), '`latitude` must be supplied');
    assert(Number.isFinite(zoom), '`zoom` must be supplied');
    this._viewportProps = this._applyConstraints({
      width,
      height,
      latitude,
      longitude,
      zoom,
      bearing,
      pitch,
      altitude,
      maxZoom,
      minZoom,
      maxPitch,
      minPitch,
      transitionDuration,
      transitionEasing,
      transitionInterpolator,
      transitionInterruption
    });
    this._state = {
      startPanLngLat,
      startZoomLngLat,
      startRotatePos,
      startBearing,
      startPitch,
      startZoom
    };
  }
  getViewportProps() {
    return this._viewportProps;
  }
  getState() {
    return this._state;
  }
  panStart(_ref2) {
    let {
      pos
    } = _ref2;
    return this._getUpdatedMapState({
      startPanLngLat: this._unproject(pos)
    });
  }
  pan(_ref3) {
    let {
      pos,
      startPos
    } = _ref3;
    const startPanLngLat = this._state.startPanLngLat || this._unproject(startPos);
    if (!startPanLngLat) {
      return this;
    }
    const [longitude, latitude] = this._calculateNewLngLat({
      startPanLngLat,
      pos
    });
    return this._getUpdatedMapState({
      longitude,
      latitude
    });
  }
  panEnd() {
    return this._getUpdatedMapState({
      startPanLngLat: null
    });
  }
  rotateStart(_ref4) {
    let {
      pos
    } = _ref4;
    return this._getUpdatedMapState({
      startRotatePos: pos,
      startBearing: this._viewportProps.bearing,
      startPitch: this._viewportProps.pitch
    });
  }
  rotate(_ref5) {
    let {
      pos,
      deltaAngleX = 0,
      deltaAngleY = 0
    } = _ref5;
    const {
      startRotatePos,
      startBearing,
      startPitch
    } = this._state;
    if (!Number.isFinite(startBearing) || !Number.isFinite(startPitch)) {
      return this;
    }
    let newRotation;
    if (pos) {
      newRotation = this._calculateNewPitchAndBearing({
        ...this._getRotationParams(pos, startRotatePos),
        startBearing,
        startPitch
      });
    } else {
      newRotation = {
        bearing: startBearing + deltaAngleX,
        pitch: startPitch + deltaAngleY
      };
    }
    return this._getUpdatedMapState(newRotation);
  }
  rotateEnd() {
    return this._getUpdatedMapState({
      startBearing: null,
      startPitch: null
    });
  }
  zoomStart(_ref6) {
    let {
      pos
    } = _ref6;
    return this._getUpdatedMapState({
      startZoomLngLat: this._unproject(pos),
      startZoom: this._viewportProps.zoom
    });
  }
  zoom(_ref7) {
    let {
      pos,
      startPos,
      scale
    } = _ref7;
    assert(scale > 0, '`scale` must be a positive number');
    let {
      startZoom,
      startZoomLngLat
    } = this._state;
    if (!Number.isFinite(startZoom)) {
      startZoom = this._viewportProps.zoom;
      startZoomLngLat = this._unproject(startPos) || this._unproject(pos);
    }
    assert(startZoomLngLat, '`startZoomLngLat` prop is required ' + 'for zoom behavior to calculate where to position the map.');
    const zoom = this._calculateNewZoom({
      scale,
      startZoom: startZoom || 0
    });
    const zoomedViewport = new WebMercatorViewport(Object.assign({}, this._viewportProps, {
      zoom
    }));
    const [longitude, latitude] = zoomedViewport.getMapCenterByLngLatPosition({
      lngLat: startZoomLngLat,
      pos
    });
    return this._getUpdatedMapState({
      zoom,
      longitude,
      latitude
    });
  }
  zoomEnd() {
    return this._getUpdatedMapState({
      startZoomLngLat: null,
      startZoom: null
    });
  }
  _getUpdatedMapState(newProps) {
    return new MapState(Object.assign({}, this._viewportProps, this._state, newProps));
  }
  _applyConstraints(props) {
    const {
      maxZoom,
      minZoom,
      zoom
    } = props;
    props.zoom = clamp(zoom, minZoom, maxZoom);
    const {
      maxPitch,
      minPitch,
      pitch
    } = props;
    props.pitch = clamp(pitch, minPitch, maxPitch);
    Object.assign(props, normalizeViewportProps(props));
    return props;
  }
  _unproject(pos) {
    const viewport = new WebMercatorViewport(this._viewportProps);
    return pos && viewport.unproject(pos);
  }
  _calculateNewLngLat(_ref8) {
    let {
      startPanLngLat,
      pos
    } = _ref8;
    const viewport = new WebMercatorViewport(this._viewportProps);
    return viewport.getMapCenterByLngLatPosition({
      lngLat: startPanLngLat,
      pos
    });
  }
  _calculateNewZoom(_ref9) {
    let {
      scale,
      startZoom
    } = _ref9;
    const {
      maxZoom,
      minZoom
    } = this._viewportProps;
    const zoom = startZoom + Math.log2(scale);
    return clamp(zoom, minZoom, maxZoom);
  }
  _calculateNewPitchAndBearing(_ref10) {
    let {
      deltaScaleX,
      deltaScaleY,
      startBearing,
      startPitch
    } = _ref10;
    deltaScaleY = clamp(deltaScaleY, -1, 1);
    const {
      minPitch,
      maxPitch
    } = this._viewportProps;
    const bearing = startBearing + 180 * deltaScaleX;
    let pitch = startPitch;
    if (deltaScaleY > 0) {
      pitch = startPitch + deltaScaleY * (maxPitch - startPitch);
    } else if (deltaScaleY < 0) {
      pitch = startPitch - deltaScaleY * (minPitch - startPitch);
    }
    return {
      pitch,
      bearing
    };
  }
  _getRotationParams(pos, startPos) {
    const deltaX = pos[0] - startPos[0];
    const deltaY = pos[1] - startPos[1];
    const centerY = pos[1];
    const startY = startPos[1];
    const {
      width,
      height
    } = this._viewportProps;
    const deltaScaleX = deltaX / width;
    let deltaScaleY = 0;
    if (deltaY > 0) {
      if (Math.abs(height - startY) > PITCH_MOUSE_THRESHOLD) {
        deltaScaleY = deltaY / (startY - height) * PITCH_ACCEL;
      }
    } else if (deltaY < 0) {
      if (startY > PITCH_MOUSE_THRESHOLD) {
        deltaScaleY = 1 - centerY / startY;
      }
    }
    deltaScaleY = Math.min(1, Math.max(-1, deltaScaleY));
    return {
      deltaScaleX,
      deltaScaleY
    };
  }
}
//# sourceMappingURL=map-state.js.map