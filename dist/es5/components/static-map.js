"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
exports.getViewport = getViewport;
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var React = _interopRequireWildcard(require("react"));
var PropTypes = _interopRequireWildcard(require("prop-types"));
var _viewportMercatorProject = _interopRequireDefault(require("viewport-mercator-project"));
var _resizeObserverPolyfill = _interopRequireDefault(require("resize-observer-polyfill"));
var _goong = _interopRequireDefault(require("../goong/goong"));
var _goongmap = _interopRequireDefault(require("../utils/goongmap"));
var _mapConstraints = require("../utils/map-constraints");
var _mapState = require("../utils/map-state");
var _mapContext = _interopRequireWildcard(require("./map-context"));
var _useIsomorphicLayoutEffect = _interopRequireDefault(require("../utils/use-isomorphic-layout-effect"));
var _terrain = require("../utils/terrain");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var TOKEN_DOC_URL = 'https://visgl.github.io/react-map-gl/docs/get-started/mapbox-tokens';
var NO_TOKEN_WARNING = 'A valid API access token is required to use Mapbox data';
function noop() {}
function getViewport(_ref) {
  var map = _ref.map,
    props = _ref.props,
    width = _ref.width,
    height = _ref.height;
  var viewportProps = _objectSpread(_objectSpread(_objectSpread({}, props), props.viewState), {}, {
    width: width,
    height: height
  });
  viewportProps.position = [0, 0, (0, _terrain.getTerrainElevation)(map, viewportProps)];
  return new _viewportMercatorProject["default"](viewportProps);
}
var UNAUTHORIZED_ERROR_CODE = 401;
var CONTAINER_STYLE = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  overflow: 'hidden'
};
var propTypes = Object.assign({}, _goong["default"].propTypes, {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onResize: PropTypes.func,
  disableTokenWarning: PropTypes.bool,
  visible: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  visibilityConstraints: PropTypes.object
});
var defaultProps = Object.assign({}, _goong["default"].defaultProps, {
  disableTokenWarning: false,
  visible: true,
  onResize: noop,
  className: '',
  style: null,
  visibilityConstraints: _mapState.MAPBOX_LIMITS
});
function NoTokenWarning() {
  var style = {
    position: 'absolute',
    left: 0,
    top: 0
  };
  return React.createElement("div", {
    key: "warning",
    id: "no-token-warning",
    style: style
  }, React.createElement("h3", {
    key: "header"
  }, NO_TOKEN_WARNING), React.createElement("div", {
    key: "text"
  }, "For information on setting up your basemap, read"), React.createElement("a", {
    key: "link",
    href: TOKEN_DOC_URL
  }, "Note on Map Tokens"));
}
function getRefHandles(mapboxRef) {
  return {
    getMap: function getMap() {
      return mapboxRef.current && mapboxRef.current.getMap();
    },
    queryRenderedFeatures: function queryRenderedFeatures(geometry) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var map = mapboxRef.current && mapboxRef.current.getMap();
      return map && map.queryRenderedFeatures(geometry, options);
    }
  };
}
var StaticMap = (0, React.forwardRef)(function (props, ref) {
  var _useState = (0, React.useState)(true),
    _useState2 = (0, _slicedToArray2["default"])(_useState, 2),
    accessTokenValid = _useState2[0],
    setTokenState = _useState2[1];
  var _useState3 = (0, React.useState)({
      width: 0,
      height: 0
    }),
    _useState4 = (0, _slicedToArray2["default"])(_useState3, 2),
    size = _useState4[0],
    setSize = _useState4[1];
  var mapboxRef = (0, React.useRef)(null);
  var mapDivRef = (0, React.useRef)(null);
  var containerRef = (0, React.useRef)(null);
  var overlayRef = (0, React.useRef)(null);
  var context = (0, React.useContext)(_mapContext["default"]);
  (0, _useIsomorphicLayoutEffect["default"])(function () {
    if (!StaticMap.supported()) {
      return undefined;
    }
    var mapbox = new _goong["default"](_objectSpread(_objectSpread(_objectSpread({}, props), size), {}, {
      mapboxgl: _goongmap["default"],
      container: mapDivRef.current,
      onError: function onError(evt) {
        var statusCode = evt.error && evt.error.status || evt.status;
        if (statusCode === UNAUTHORIZED_ERROR_CODE && accessTokenValid) {
          console.error(NO_TOKEN_WARNING);
          setTokenState(false);
        }
        props.onError(evt);
      }
    }));
    mapboxRef.current = mapbox;
    if (context && context.setMap) {
      context.setMap(mapbox.getMap());
    }
    var resizeObserver = new _resizeObserverPolyfill["default"](function (entries) {
      if (entries[0].contentRect) {
        var _entries$0$contentRec = entries[0].contentRect,
          _width = _entries$0$contentRec.width,
          _height = _entries$0$contentRec.height;
        setSize({
          width: _width,
          height: _height
        });
        props.onResize({
          width: _width,
          height: _height
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return function () {
      mapbox.finalize();
      mapboxRef.current = null;
      resizeObserver.disconnect();
    };
  }, []);
  (0, _useIsomorphicLayoutEffect["default"])(function () {
    if (mapboxRef.current) {
      mapboxRef.current.setProps(_objectSpread(_objectSpread({}, props), size));
    }
  });
  var map = mapboxRef.current && mapboxRef.current.getMap();
  (0, React.useImperativeHandle)(ref, function () {
    return getRefHandles(mapboxRef);
  }, []);
  var preventScroll = (0, React.useCallback)(function (_ref2) {
    var target = _ref2.target;
    if (target === overlayRef.current) {
      target.scrollTo(0, 0);
    }
  }, []);
  var overlays = map && React.createElement(_mapContext.MapContextProvider, {
    value: _objectSpread(_objectSpread({}, context), {}, {
      viewport: context.viewport || getViewport(_objectSpread({
        map: map,
        props: props
      }, size)),
      map: map,
      container: context.container || containerRef.current
    })
  }, React.createElement("div", {
    key: "map-overlays",
    className: "overlays",
    ref: overlayRef,
    style: CONTAINER_STYLE,
    onScroll: preventScroll
  }, props.children));
  var className = props.className,
    width = props.width,
    height = props.height,
    style = props.style,
    visibilityConstraints = props.visibilityConstraints;
  var mapContainerStyle = Object.assign({
    position: 'relative'
  }, style, {
    width: width,
    height: height
  });
  var visible = props.visible && (0, _mapConstraints.checkVisibilityConstraints)(props.viewState || props, visibilityConstraints);
  var mapStyle = Object.assign({}, CONTAINER_STYLE, {
    visibility: visible ? 'inherit' : 'hidden'
  });
  return React.createElement("div", {
    key: "map-container",
    ref: containerRef,
    style: mapContainerStyle
  }, React.createElement("div", {
    key: "map-mapbox",
    ref: mapDivRef,
    style: mapStyle,
    className: className
  }), overlays, !accessTokenValid && !props.disableTokenWarning && React.createElement(NoTokenWarning, null));
});
StaticMap.supported = function () {
  return _goongmap["default"] && _goongmap["default"].supported();
};
StaticMap.propTypes = propTypes;
StaticMap.defaultProps = defaultProps;
var _default = StaticMap;
exports["default"] = _default;
//# sourceMappingURL=static-map.js.map