"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
exports.getAccessToken = getAccessToken;
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var PropTypes = _interopRequireWildcard(require("prop-types"));
var _globals = require("../utils/globals");
var _styleUtils = require("../utils/style-utils");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function noop() {}
function defaultOnError(event) {
  if (event) {
    console.error(event.error);
  }
}
var propTypes = {
  container: PropTypes.object,
  gl: PropTypes.object,
  goongApiAccessToken: PropTypes.string,
  goongApiUrl: PropTypes.string,
  attributionControl: PropTypes.bool,
  preserveDrawingBuffer: PropTypes.bool,
  reuseMaps: PropTypes.bool,
  transformRequest: PropTypes.func,
  mapOptions: PropTypes.object,
  mapStyle: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  preventStyleDiffing: PropTypes.bool,
  visible: PropTypes.bool,
  asyncRender: PropTypes.bool,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  width: PropTypes.number,
  height: PropTypes.number,
  viewState: PropTypes.object,
  longitude: PropTypes.number,
  latitude: PropTypes.number,
  zoom: PropTypes.number,
  bearing: PropTypes.number,
  pitch: PropTypes.number,
  altitude: PropTypes.number
};
var defaultProps = {
  container: _globals.document.body,
  goongApiAccessToken: getAccessToken(),
  goongApiUrl: 'https://tiles.goong.io',
  preserveDrawingBuffer: false,
  attributionControl: true,
  reuseMaps: false,
  mapOptions: {},
  mapStyle: 'https://tiles.goong.io/assets/goong_map_web.json',
  preventStyleDiffing: false,
  visible: true,
  asyncRender: false,
  onLoad: noop,
  onError: defaultOnError,
  width: 0,
  height: 0,
  longitude: 0,
  latitude: 0,
  zoom: 0,
  bearing: 0,
  pitch: 0,
  altitude: 1.5
};
function getAccessToken() {
  var accessToken = null;
  if (typeof window !== 'undefined' && window.location) {
    var match = window.location.search.match(/api_key=([^&\/]*)/);
    accessToken = match && match[1];
  }
  if (!accessToken && typeof process !== 'undefined') {
    accessToken = accessToken || process.env.GoongAccessToken || process.env.REACT_APP_GOONG_ACCESS_TOKEN;
  }
  return accessToken || 'no-token';
}
function checkPropTypes(props) {
  var component = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'component';
  if (props.debug) {
    PropTypes.checkPropTypes(propTypes, props, 'prop', component);
  }
}
var Goong = function () {
  function Goong(props) {
    var _this = this;
    (0, _classCallCheck2["default"])(this, Goong);
    (0, _defineProperty2["default"])(this, "props", defaultProps);
    (0, _defineProperty2["default"])(this, "width", 0);
    (0, _defineProperty2["default"])(this, "height", 0);
    (0, _defineProperty2["default"])(this, "_fireLoadEvent", function () {
      _this.props.onLoad({
        type: 'load',
        target: _this._map
      });
    });
    if (!props.mapboxgl) {
      throw new Error('Goong JS not available');
    }
    this.mapboxgl = props.mapboxgl;
    if (!Goong.initialized) {
      Goong.initialized = true;
      this._checkStyleSheet(this.mapboxgl.version);
    }
    this._initialize(props);
  }
  (0, _createClass2["default"])(Goong, [{
    key: "finalize",
    value: function finalize() {
      this._destroy();
      return this;
    }
  }, {
    key: "setProps",
    value: function setProps(props) {
      this._update(this.props, props);
      return this;
    }
  }, {
    key: "redraw",
    value: function redraw() {
      var map = this._map;
      if (map.style) {
        if (map._frame) {
          map._frame.cancel();
          map._frame = null;
        }
        map._render();
      }
    }
  }, {
    key: "getMap",
    value: function getMap() {
      return this._map;
    }
  }, {
    key: "_reuse",
    value: function _reuse(props) {
      this._map = Goong.savedMap;
      var oldContainer = this._map.getContainer();
      var newContainer = props.container;
      newContainer.classList.add('mapboxgl-map');
      if (oldContainer !== newContainer) {
        while (oldContainer.childNodes.length > 0) {
          newContainer.appendChild(oldContainer.childNodes[0]);
        }
      }
      this._map._container = newContainer;
      Goong.savedMap = null;
      if (props.mapStyle) {
        this._map.setStyle((0, _styleUtils.normalizeStyle)(props.mapStyle), {
          diff: false
        });
      }
      if (this._map.isStyleLoaded()) {
        this._fireLoadEvent();
      } else {
        this._map.once('styledata', this._fireLoadEvent);
      }
    }
  }, {
    key: "_create",
    value: function _create(props) {
      if (props.reuseMaps && Goong.savedMap) {
        this._reuse(props);
      } else {
        if (props.gl) {
          var getContext = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function () {
            HTMLCanvasElement.prototype.getContext = getContext;
            return props.gl;
          };
        }
        var mapOptions = {
          container: props.container,
          center: [0, 0],
          zoom: 8,
          pitch: 0,
          bearing: 0,
          maxZoom: 24,
          style: (0, _styleUtils.normalizeStyle)(props.mapStyle),
          interactive: false,
          trackResize: false,
          attributionControl: props.attributionControl,
          preserveDrawingBuffer: props.preserveDrawingBuffer
        };
        if (props.transformRequest) {
          mapOptions.transformRequest = props.transformRequest;
        }
        this._map = new this.mapboxgl.Map(Object.assign({}, mapOptions, props.mapOptions));
        this._map.once('load', props.onLoad);
        this._map.on('error', props.onError);
      }
      return this;
    }
  }, {
    key: "_destroy",
    value: function _destroy() {
      if (!this._map) {
        return;
      }
      if (this.props.reuseMaps && !Goong.savedMap) {
        Goong.savedMap = this._map;
        this._map.off('load', this.props.onLoad);
        this._map.off('error', this.props.onError);
        this._map.off('styledata', this._fireLoadEvent);
      } else {
        this._map.remove();
      }
      this._map = null;
    }
  }, {
    key: "_initialize",
    value: function _initialize(props) {
      var _this2 = this;
      props = Object.assign({}, defaultProps, props);
      checkPropTypes(props, 'Goong');
      this.mapboxgl.accessToken = props.goongApiAccessToken || defaultProps.goongApiAccessToken;
      this.mapboxgl.baseApiUrl = props.goongApiUrl;
      this._create(props);
      var _props = props,
        container = _props.container;
      Object.defineProperty(container, 'offsetWidth', {
        configurable: true,
        get: function get() {
          return _this2.width;
        }
      });
      Object.defineProperty(container, 'clientWidth', {
        configurable: true,
        get: function get() {
          return _this2.width;
        }
      });
      Object.defineProperty(container, 'offsetHeight', {
        configurable: true,
        get: function get() {
          return _this2.height;
        }
      });
      Object.defineProperty(container, 'clientHeight', {
        configurable: true,
        get: function get() {
          return _this2.height;
        }
      });
      var canvas = this._map.getCanvas();
      if (canvas) {
        canvas.style.outline = 'none';
      }
      this._updateMapViewport({}, props);
      this._updateMapSize({}, props);
      this.props = props;
    }
  }, {
    key: "_update",
    value: function _update(oldProps, newProps) {
      if (!this._map) {
        return;
      }
      newProps = Object.assign({}, this.props, newProps);
      checkPropTypes(newProps, 'Goong');
      var viewportChanged = this._updateMapViewport(oldProps, newProps);
      var sizeChanged = this._updateMapSize(oldProps, newProps);
      this._updateMapStyle(oldProps, newProps);
      if (!newProps.asyncRender && (viewportChanged || sizeChanged)) {
        this.redraw();
      }
      this.props = newProps;
    }
  }, {
    key: "_updateMapStyle",
    value: function _updateMapStyle(oldProps, newProps) {
      var styleChanged = oldProps.mapStyle !== newProps.mapStyle;
      if (styleChanged) {
        this._map.setStyle((0, _styleUtils.normalizeStyle)(newProps.mapStyle), {
          diff: !newProps.preventStyleDiffing
        });
      }
    }
  }, {
    key: "_updateMapSize",
    value: function _updateMapSize(oldProps, newProps) {
      var sizeChanged = oldProps.width !== newProps.width || oldProps.height !== newProps.height;
      if (sizeChanged) {
        this.width = newProps.width;
        this.height = newProps.height;
        this._map.resize();
      }
      return sizeChanged;
    }
  }, {
    key: "_updateMapViewport",
    value: function _updateMapViewport(oldProps, newProps) {
      var oldViewState = this._getViewState(oldProps);
      var newViewState = this._getViewState(newProps);
      var viewportChanged = newViewState.latitude !== oldViewState.latitude || newViewState.longitude !== oldViewState.longitude || newViewState.zoom !== oldViewState.zoom || newViewState.pitch !== oldViewState.pitch || newViewState.bearing !== oldViewState.bearing || newViewState.altitude !== oldViewState.altitude;
      if (viewportChanged) {
        this._map.jumpTo(this._viewStateToMapboxProps(newViewState));
        if (newViewState.altitude !== oldViewState.altitude) {
          this._map.transform.altitude = newViewState.altitude;
        }
      }
      return viewportChanged;
    }
  }, {
    key: "_getViewState",
    value: function _getViewState(props) {
      var _ref = props.viewState || props,
        longitude = _ref.longitude,
        latitude = _ref.latitude,
        zoom = _ref.zoom,
        _ref$pitch = _ref.pitch,
        pitch = _ref$pitch === void 0 ? 0 : _ref$pitch,
        _ref$bearing = _ref.bearing,
        bearing = _ref$bearing === void 0 ? 0 : _ref$bearing,
        _ref$altitude = _ref.altitude,
        altitude = _ref$altitude === void 0 ? 1.5 : _ref$altitude;
      return {
        longitude: longitude,
        latitude: latitude,
        zoom: zoom,
        pitch: pitch,
        bearing: bearing,
        altitude: altitude
      };
    }
  }, {
    key: "_checkStyleSheet",
    value: function _checkStyleSheet() {
      var goongVersion = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '1.0.6';
      if (typeof _globals.document === 'undefined') {
        return;
      }
      try {
        var testElement = _globals.document.createElement('div');
        testElement.className = 'mapboxgl-map';
        testElement.style.display = 'none';
        _globals.document.body.appendChild(testElement);
        var isCssLoaded = window.getComputedStyle(testElement).position !== 'static';
        if (!isCssLoaded) {
          var link = _globals.document.createElement('link');
          link.setAttribute('rel', 'stylesheet');
          link.setAttribute('type', 'text/css');
          link.setAttribute('href', "https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@".concat(goongVersion, "/dist/goong-js.css"));
          _globals.document.head.appendChild(link);
        }
      } catch (error) {}
    }
  }, {
    key: "_viewStateToMapboxProps",
    value: function _viewStateToMapboxProps(viewState) {
      return {
        center: [viewState.longitude, viewState.latitude],
        zoom: viewState.zoom,
        bearing: viewState.bearing,
        pitch: viewState.pitch
      };
    }
  }]);
  return Goong;
}();
exports["default"] = Goong;
(0, _defineProperty2["default"])(Goong, "initialized", false);
(0, _defineProperty2["default"])(Goong, "propTypes", propTypes);
(0, _defineProperty2["default"])(Goong, "defaultProps", defaultProps);
(0, _defineProperty2["default"])(Goong, "savedMap", null);
//# sourceMappingURL=goong.js.map