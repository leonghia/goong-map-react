import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
import WebMercatorViewport, { normalizeViewportProps } from 'viewport-mercator-project';
import { clamp } from './math-utils';
import assert from './assert';
export var MAPBOX_LIMITS = {
  minZoom: 0,
  maxZoom: 24,
  minPitch: 0,
  maxPitch: 85
};
var DEFAULT_STATE = {
  pitch: 0,
  bearing: 0,
  altitude: 1.5
};
var PITCH_MOUSE_THRESHOLD = 5;
var PITCH_ACCEL = 1.2;
var MapState = function () {
  function MapState(_ref) {
    var width = _ref.width,
      height = _ref.height,
      latitude = _ref.latitude,
      longitude = _ref.longitude,
      zoom = _ref.zoom,
      _ref$bearing = _ref.bearing,
      bearing = _ref$bearing === void 0 ? DEFAULT_STATE.bearing : _ref$bearing,
      _ref$pitch = _ref.pitch,
      pitch = _ref$pitch === void 0 ? DEFAULT_STATE.pitch : _ref$pitch,
      _ref$altitude = _ref.altitude,
      altitude = _ref$altitude === void 0 ? DEFAULT_STATE.altitude : _ref$altitude,
      _ref$maxZoom = _ref.maxZoom,
      maxZoom = _ref$maxZoom === void 0 ? MAPBOX_LIMITS.maxZoom : _ref$maxZoom,
      _ref$minZoom = _ref.minZoom,
      minZoom = _ref$minZoom === void 0 ? MAPBOX_LIMITS.minZoom : _ref$minZoom,
      _ref$maxPitch = _ref.maxPitch,
      maxPitch = _ref$maxPitch === void 0 ? MAPBOX_LIMITS.maxPitch : _ref$maxPitch,
      _ref$minPitch = _ref.minPitch,
      minPitch = _ref$minPitch === void 0 ? MAPBOX_LIMITS.minPitch : _ref$minPitch,
      transitionDuration = _ref.transitionDuration,
      transitionEasing = _ref.transitionEasing,
      transitionInterpolator = _ref.transitionInterpolator,
      transitionInterruption = _ref.transitionInterruption,
      startPanLngLat = _ref.startPanLngLat,
      startZoomLngLat = _ref.startZoomLngLat,
      startRotatePos = _ref.startRotatePos,
      startBearing = _ref.startBearing,
      startPitch = _ref.startPitch,
      startZoom = _ref.startZoom;
    _classCallCheck(this, MapState);
    assert(Number.isFinite(width), '`width` must be supplied');
    assert(Number.isFinite(height), '`height` must be supplied');
    assert(Number.isFinite(longitude), '`longitude` must be supplied');
    assert(Number.isFinite(latitude), '`latitude` must be supplied');
    assert(Number.isFinite(zoom), '`zoom` must be supplied');
    this._viewportProps = this._applyConstraints({
      width: width,
      height: height,
      latitude: latitude,
      longitude: longitude,
      zoom: zoom,
      bearing: bearing,
      pitch: pitch,
      altitude: altitude,
      maxZoom: maxZoom,
      minZoom: minZoom,
      maxPitch: maxPitch,
      minPitch: minPitch,
      transitionDuration: transitionDuration,
      transitionEasing: transitionEasing,
      transitionInterpolator: transitionInterpolator,
      transitionInterruption: transitionInterruption
    });
    this._state = {
      startPanLngLat: startPanLngLat,
      startZoomLngLat: startZoomLngLat,
      startRotatePos: startRotatePos,
      startBearing: startBearing,
      startPitch: startPitch,
      startZoom: startZoom
    };
  }
  _createClass(MapState, [{
    key: "getViewportProps",
    value: function getViewportProps() {
      return this._viewportProps;
    }
  }, {
    key: "getState",
    value: function getState() {
      return this._state;
    }
  }, {
    key: "panStart",
    value: function panStart(_ref2) {
      var pos = _ref2.pos;
      return this._getUpdatedMapState({
        startPanLngLat: this._unproject(pos)
      });
    }
  }, {
    key: "pan",
    value: function pan(_ref3) {
      var pos = _ref3.pos,
        startPos = _ref3.startPos;
      var startPanLngLat = this._state.startPanLngLat || this._unproject(startPos);
      if (!startPanLngLat) {
        return this;
      }
      var _this$_calculateNewLn = this._calculateNewLngLat({
          startPanLngLat: startPanLngLat,
          pos: pos
        }),
        _this$_calculateNewLn2 = _slicedToArray(_this$_calculateNewLn, 2),
        longitude = _this$_calculateNewLn2[0],
        latitude = _this$_calculateNewLn2[1];
      return this._getUpdatedMapState({
        longitude: longitude,
        latitude: latitude
      });
    }
  }, {
    key: "panEnd",
    value: function panEnd() {
      return this._getUpdatedMapState({
        startPanLngLat: null
      });
    }
  }, {
    key: "rotateStart",
    value: function rotateStart(_ref4) {
      var pos = _ref4.pos;
      return this._getUpdatedMapState({
        startRotatePos: pos,
        startBearing: this._viewportProps.bearing,
        startPitch: this._viewportProps.pitch
      });
    }
  }, {
    key: "rotate",
    value: function rotate(_ref5) {
      var pos = _ref5.pos,
        _ref5$deltaAngleX = _ref5.deltaAngleX,
        deltaAngleX = _ref5$deltaAngleX === void 0 ? 0 : _ref5$deltaAngleX,
        _ref5$deltaAngleY = _ref5.deltaAngleY,
        deltaAngleY = _ref5$deltaAngleY === void 0 ? 0 : _ref5$deltaAngleY;
      var _this$_state = this._state,
        startRotatePos = _this$_state.startRotatePos,
        startBearing = _this$_state.startBearing,
        startPitch = _this$_state.startPitch;
      if (!Number.isFinite(startBearing) || !Number.isFinite(startPitch)) {
        return this;
      }
      var newRotation;
      if (pos) {
        newRotation = this._calculateNewPitchAndBearing(_objectSpread(_objectSpread({}, this._getRotationParams(pos, startRotatePos)), {}, {
          startBearing: startBearing,
          startPitch: startPitch
        }));
      } else {
        newRotation = {
          bearing: startBearing + deltaAngleX,
          pitch: startPitch + deltaAngleY
        };
      }
      return this._getUpdatedMapState(newRotation);
    }
  }, {
    key: "rotateEnd",
    value: function rotateEnd() {
      return this._getUpdatedMapState({
        startBearing: null,
        startPitch: null
      });
    }
  }, {
    key: "zoomStart",
    value: function zoomStart(_ref6) {
      var pos = _ref6.pos;
      return this._getUpdatedMapState({
        startZoomLngLat: this._unproject(pos),
        startZoom: this._viewportProps.zoom
      });
    }
  }, {
    key: "zoom",
    value: function zoom(_ref7) {
      var pos = _ref7.pos,
        startPos = _ref7.startPos,
        scale = _ref7.scale;
      assert(scale > 0, '`scale` must be a positive number');
      var _this$_state2 = this._state,
        startZoom = _this$_state2.startZoom,
        startZoomLngLat = _this$_state2.startZoomLngLat;
      if (!Number.isFinite(startZoom)) {
        startZoom = this._viewportProps.zoom;
        startZoomLngLat = this._unproject(startPos) || this._unproject(pos);
      }
      assert(startZoomLngLat, '`startZoomLngLat` prop is required ' + 'for zoom behavior to calculate where to position the map.');
      var zoom = this._calculateNewZoom({
        scale: scale,
        startZoom: startZoom || 0
      });
      var zoomedViewport = new WebMercatorViewport(Object.assign({}, this._viewportProps, {
        zoom: zoom
      }));
      var _zoomedViewport$getMa = zoomedViewport.getMapCenterByLngLatPosition({
          lngLat: startZoomLngLat,
          pos: pos
        }),
        _zoomedViewport$getMa2 = _slicedToArray(_zoomedViewport$getMa, 2),
        longitude = _zoomedViewport$getMa2[0],
        latitude = _zoomedViewport$getMa2[1];
      return this._getUpdatedMapState({
        zoom: zoom,
        longitude: longitude,
        latitude: latitude
      });
    }
  }, {
    key: "zoomEnd",
    value: function zoomEnd() {
      return this._getUpdatedMapState({
        startZoomLngLat: null,
        startZoom: null
      });
    }
  }, {
    key: "_getUpdatedMapState",
    value: function _getUpdatedMapState(newProps) {
      return new MapState(Object.assign({}, this._viewportProps, this._state, newProps));
    }
  }, {
    key: "_applyConstraints",
    value: function _applyConstraints(props) {
      var maxZoom = props.maxZoom,
        minZoom = props.minZoom,
        zoom = props.zoom;
      props.zoom = clamp(zoom, minZoom, maxZoom);
      var maxPitch = props.maxPitch,
        minPitch = props.minPitch,
        pitch = props.pitch;
      props.pitch = clamp(pitch, minPitch, maxPitch);
      Object.assign(props, normalizeViewportProps(props));
      return props;
    }
  }, {
    key: "_unproject",
    value: function _unproject(pos) {
      var viewport = new WebMercatorViewport(this._viewportProps);
      return pos && viewport.unproject(pos);
    }
  }, {
    key: "_calculateNewLngLat",
    value: function _calculateNewLngLat(_ref8) {
      var startPanLngLat = _ref8.startPanLngLat,
        pos = _ref8.pos;
      var viewport = new WebMercatorViewport(this._viewportProps);
      return viewport.getMapCenterByLngLatPosition({
        lngLat: startPanLngLat,
        pos: pos
      });
    }
  }, {
    key: "_calculateNewZoom",
    value: function _calculateNewZoom(_ref9) {
      var scale = _ref9.scale,
        startZoom = _ref9.startZoom;
      var _this$_viewportProps = this._viewportProps,
        maxZoom = _this$_viewportProps.maxZoom,
        minZoom = _this$_viewportProps.minZoom;
      var zoom = startZoom + Math.log2(scale);
      return clamp(zoom, minZoom, maxZoom);
    }
  }, {
    key: "_calculateNewPitchAndBearing",
    value: function _calculateNewPitchAndBearing(_ref10) {
      var deltaScaleX = _ref10.deltaScaleX,
        deltaScaleY = _ref10.deltaScaleY,
        startBearing = _ref10.startBearing,
        startPitch = _ref10.startPitch;
      deltaScaleY = clamp(deltaScaleY, -1, 1);
      var _this$_viewportProps2 = this._viewportProps,
        minPitch = _this$_viewportProps2.minPitch,
        maxPitch = _this$_viewportProps2.maxPitch;
      var bearing = startBearing + 180 * deltaScaleX;
      var pitch = startPitch;
      if (deltaScaleY > 0) {
        pitch = startPitch + deltaScaleY * (maxPitch - startPitch);
      } else if (deltaScaleY < 0) {
        pitch = startPitch - deltaScaleY * (minPitch - startPitch);
      }
      return {
        pitch: pitch,
        bearing: bearing
      };
    }
  }, {
    key: "_getRotationParams",
    value: function _getRotationParams(pos, startPos) {
      var deltaX = pos[0] - startPos[0];
      var deltaY = pos[1] - startPos[1];
      var centerY = pos[1];
      var startY = startPos[1];
      var _this$_viewportProps3 = this._viewportProps,
        width = _this$_viewportProps3.width,
        height = _this$_viewportProps3.height;
      var deltaScaleX = deltaX / width;
      var deltaScaleY = 0;
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
        deltaScaleX: deltaScaleX,
        deltaScaleY: deltaScaleY
      };
    }
  }]);
  return MapState;
}();
export { MapState as default };
//# sourceMappingURL=map-state.js.map