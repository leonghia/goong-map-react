import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
import * as React from 'react';
import { useState, useRef, useCallback, useContext, useImperativeHandle, forwardRef } from 'react';
import * as PropTypes from 'prop-types';
import WebMercatorViewport from 'viewport-mercator-project';
import ResizeObserver from 'resize-observer-polyfill';
import Mapbox from '../goong/goong';
import mapboxgl from '../utils/goongmap';
import { checkVisibilityConstraints } from '../utils/map-constraints';
import { MAPBOX_LIMITS } from '../utils/map-state';
import MapContext, { MapContextProvider } from './map-context';
import useIsomorphicLayoutEffect from '../utils/use-isomorphic-layout-effect';
import { getTerrainElevation } from '../utils/terrain';
var TOKEN_DOC_URL = 'https://visgl.github.io/react-map-gl/docs/get-started/mapbox-tokens';
var NO_TOKEN_WARNING = 'A valid API access token is required to use Mapbox data';
function noop() {}
export function getViewport(_ref) {
  var map = _ref.map,
    props = _ref.props,
    width = _ref.width,
    height = _ref.height;
  var viewportProps = _objectSpread(_objectSpread(_objectSpread({}, props), props.viewState), {}, {
    width: width,
    height: height
  });
  viewportProps.position = [0, 0, getTerrainElevation(map, viewportProps)];
  return new WebMercatorViewport(viewportProps);
}
var UNAUTHORIZED_ERROR_CODE = 401;
var CONTAINER_STYLE = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  overflow: 'hidden'
};
var propTypes = Object.assign({}, Mapbox.propTypes, {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onResize: PropTypes.func,
  disableTokenWarning: PropTypes.bool,
  visible: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  visibilityConstraints: PropTypes.object
});
var defaultProps = Object.assign({}, Mapbox.defaultProps, {
  disableTokenWarning: false,
  visible: true,
  onResize: noop,
  className: '',
  style: null,
  visibilityConstraints: MAPBOX_LIMITS
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
var StaticMap = forwardRef(function (props, ref) {
  var _useState = useState(true),
    _useState2 = _slicedToArray(_useState, 2),
    accessTokenValid = _useState2[0],
    setTokenState = _useState2[1];
  var _useState3 = useState({
      width: 0,
      height: 0
    }),
    _useState4 = _slicedToArray(_useState3, 2),
    size = _useState4[0],
    setSize = _useState4[1];
  var mapboxRef = useRef(null);
  var mapDivRef = useRef(null);
  var containerRef = useRef(null);
  var overlayRef = useRef(null);
  var context = useContext(MapContext);
  useIsomorphicLayoutEffect(function () {
    if (!StaticMap.supported()) {
      return undefined;
    }
    var mapbox = new Mapbox(_objectSpread(_objectSpread(_objectSpread({}, props), size), {}, {
      mapboxgl: mapboxgl,
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
    var resizeObserver = new ResizeObserver(function (entries) {
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
  useIsomorphicLayoutEffect(function () {
    if (mapboxRef.current) {
      mapboxRef.current.setProps(_objectSpread(_objectSpread({}, props), size));
    }
  });
  var map = mapboxRef.current && mapboxRef.current.getMap();
  useImperativeHandle(ref, function () {
    return getRefHandles(mapboxRef);
  }, []);
  var preventScroll = useCallback(function (_ref2) {
    var target = _ref2.target;
    if (target === overlayRef.current) {
      target.scrollTo(0, 0);
    }
  }, []);
  var overlays = map && React.createElement(MapContextProvider, {
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
  var visible = props.visible && checkVisibilityConstraints(props.viewState || props, visibilityConstraints);
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
  return mapboxgl && mapboxgl.supported();
};
StaticMap.propTypes = propTypes;
StaticMap.defaultProps = defaultProps;
export default StaticMap;
//# sourceMappingURL=static-map.js.map