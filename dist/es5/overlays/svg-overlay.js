"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var React = _interopRequireWildcard(require("react"));
var PropTypes = _interopRequireWildcard(require("prop-types"));
var _useMapControl2 = _interopRequireWildcard(require("../components/use-map-control"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var propTypes = Object.assign({}, _useMapControl2.mapControlPropTypes, {
  redraw: PropTypes.func.isRequired,
  style: PropTypes.object
});
var defaultProps = {
  captureScroll: false,
  captureDrag: false,
  captureClick: false,
  captureDoubleClick: false,
  capturePointerMove: false
};
function SVGOverlay(props) {
  var _useMapControl = (0, _useMapControl2["default"])(props),
    context = _useMapControl.context,
    containerRef = _useMapControl.containerRef;
  var viewport = context.viewport,
    isDragging = context.isDragging;
  var style = _objectSpread({
    position: 'absolute',
    left: 0,
    top: 0
  }, props.style);
  return React.createElement("svg", {
    width: viewport.width,
    height: viewport.height,
    ref: containerRef,
    style: style
  }, props.redraw({
    width: viewport.width,
    height: viewport.height,
    isDragging: isDragging,
    project: viewport.project,
    unproject: viewport.unproject
  }));
}
SVGOverlay.propTypes = propTypes;
SVGOverlay.defaultProps = defaultProps;
var _default = SVGOverlay;
exports["default"] = _default;
//# sourceMappingURL=svg-overlay.js.map