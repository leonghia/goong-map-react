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
const TOKEN_DOC_URL = 'https://visgl.github.io/react-map-gl/docs/get-started/mapbox-tokens';
const NO_TOKEN_WARNING = 'A valid API access token is required to use Mapbox data';
function noop() {}
export function getViewport(_ref) {
  let {
    map,
    props,
    width,
    height
  } = _ref;
  const viewportProps = {
    ...props,
    ...props.viewState,
    width,
    height
  };
  viewportProps.position = [0, 0, getTerrainElevation(map, viewportProps)];
  return new WebMercatorViewport(viewportProps);
}
const UNAUTHORIZED_ERROR_CODE = 401;
const CONTAINER_STYLE = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  overflow: 'hidden'
};
const propTypes = Object.assign({}, Mapbox.propTypes, {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onResize: PropTypes.func,
  disableTokenWarning: PropTypes.bool,
  visible: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  visibilityConstraints: PropTypes.object
});
const defaultProps = Object.assign({}, Mapbox.defaultProps, {
  disableTokenWarning: false,
  visible: true,
  onResize: noop,
  className: '',
  style: null,
  visibilityConstraints: MAPBOX_LIMITS
});
function NoTokenWarning() {
  const style = {
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
    getMap: () => mapboxRef.current && mapboxRef.current.getMap(),
    queryRenderedFeatures: function (geometry) {
      let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      const map = mapboxRef.current && mapboxRef.current.getMap();
      return map && map.queryRenderedFeatures(geometry, options);
    }
  };
}
const StaticMap = forwardRef((props, ref) => {
  const [accessTokenValid, setTokenState] = useState(true);
  const [size, setSize] = useState({
    width: 0,
    height: 0
  });
  const mapboxRef = useRef(null);
  const mapDivRef = useRef(null);
  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const context = useContext(MapContext);
  useIsomorphicLayoutEffect(() => {
    if (!StaticMap.supported()) {
      return undefined;
    }
    const mapbox = new Mapbox({
      ...props,
      ...size,
      mapboxgl,
      container: mapDivRef.current,
      onError: evt => {
        const statusCode = evt.error && evt.error.status || evt.status;
        if (statusCode === UNAUTHORIZED_ERROR_CODE && accessTokenValid) {
          console.error(NO_TOKEN_WARNING);
          setTokenState(false);
        }
        props.onError(evt);
      }
    });
    mapboxRef.current = mapbox;
    if (context && context.setMap) {
      context.setMap(mapbox.getMap());
    }
    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0].contentRect) {
        const {
          width,
          height
        } = entries[0].contentRect;
        setSize({
          width,
          height
        });
        props.onResize({
          width,
          height
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => {
      mapbox.finalize();
      mapboxRef.current = null;
      resizeObserver.disconnect();
    };
  }, []);
  useIsomorphicLayoutEffect(() => {
    if (mapboxRef.current) {
      mapboxRef.current.setProps({
        ...props,
        ...size
      });
    }
  });
  const map = mapboxRef.current && mapboxRef.current.getMap();
  useImperativeHandle(ref, () => getRefHandles(mapboxRef), []);
  const preventScroll = useCallback(_ref2 => {
    let {
      target
    } = _ref2;
    if (target === overlayRef.current) {
      target.scrollTo(0, 0);
    }
  }, []);
  const overlays = map && React.createElement(MapContextProvider, {
    value: {
      ...context,
      viewport: context.viewport || getViewport({
        map,
        props,
        ...size
      }),
      map,
      container: context.container || containerRef.current
    }
  }, React.createElement("div", {
    key: "map-overlays",
    className: "overlays",
    ref: overlayRef,
    style: CONTAINER_STYLE,
    onScroll: preventScroll
  }, props.children));
  const {
    className,
    width,
    height,
    style,
    visibilityConstraints
  } = props;
  const mapContainerStyle = Object.assign({
    position: 'relative'
  }, style, {
    width,
    height
  });
  const visible = props.visible && checkVisibilityConstraints(props.viewState || props, visibilityConstraints);
  const mapStyle = Object.assign({}, CONTAINER_STYLE, {
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
StaticMap.supported = () => mapboxgl && mapboxgl.supported();
StaticMap.propTypes = propTypes;
StaticMap.defaultProps = defaultProps;
export default StaticMap;
//# sourceMappingURL=static-map.js.map