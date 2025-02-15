"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = useDraggableControl;
exports.draggableControlPropTypes = exports.draggableControlDefaultProps = void 0;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var PropTypes = _interopRequireWildcard(require("prop-types"));
var _react = require("react");
var _useMapControl = _interopRequireWildcard(require("./use-map-control"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var draggableControlPropTypes = Object.assign({}, _useMapControl.mapControlPropTypes, {
  draggable: PropTypes.bool,
  onDrag: PropTypes.func,
  onDragEnd: PropTypes.func,
  onDragStart: PropTypes.func,
  offsetLeft: PropTypes.number,
  offsetTop: PropTypes.number
});
exports.draggableControlPropTypes = draggableControlPropTypes;
var draggableControlDefaultProps = Object.assign({}, _useMapControl.mapControlDefaultProps, {
  draggable: false,
  offsetLeft: 0,
  offsetTop: 0
});
exports.draggableControlDefaultProps = draggableControlDefaultProps;
function getDragEventPosition(event) {
  var _event$offsetCenter = event.offsetCenter,
    x = _event$offsetCenter.x,
    y = _event$offsetCenter.y;
  return [x, y];
}
function getDragEventOffset(event, container) {
  var _event$center = event.center,
    x = _event$center.x,
    y = _event$center.y;
  if (container) {
    var rect = container.getBoundingClientRect();
    return [rect.left - x, rect.top - y];
  }
  return null;
}
function getDragLngLat(dragPos, dragOffset, props, context) {
  var x = dragPos[0] + dragOffset[0] - props.offsetLeft;
  var y = dragPos[1] + dragOffset[1] - props.offsetTop;
  return context.viewport.unproject([x, y]);
}
function onDragStart(event, _ref) {
  var props = _ref.props,
    callbacks = _ref.callbacks,
    state = _ref.state,
    context = _ref.context,
    containerRef = _ref.containerRef;
  var draggable = props.draggable;
  if (!draggable) {
    return;
  }
  event.stopPropagation();
  var dragPos = getDragEventPosition(event);
  var dragOffset = getDragEventOffset(event, containerRef.current);
  state.setDragPos(dragPos);
  state.setDragOffset(dragOffset);
  if (callbacks.onDragStart && dragOffset) {
    var callbackEvent = Object.assign({}, event);
    callbackEvent.lngLat = getDragLngLat(dragPos, dragOffset, props, context);
    callbacks.onDragStart(callbackEvent);
  }
}
function onDrag(event, _ref2) {
  var props = _ref2.props,
    callbacks = _ref2.callbacks,
    state = _ref2.state,
    context = _ref2.context;
  event.stopPropagation();
  var dragPos = getDragEventPosition(event);
  state.setDragPos(dragPos);
  var dragOffset = state.dragOffset;
  if (callbacks.onDrag && dragOffset) {
    var callbackEvent = Object.assign({}, event);
    callbackEvent.lngLat = getDragLngLat(dragPos, dragOffset, props, context);
    callbacks.onDrag(callbackEvent);
  }
}
function onDragEnd(event, _ref3) {
  var props = _ref3.props,
    callbacks = _ref3.callbacks,
    state = _ref3.state,
    context = _ref3.context;
  event.stopPropagation();
  var dragPos = state.dragPos,
    dragOffset = state.dragOffset;
  state.setDragPos(null);
  state.setDragOffset(null);
  if (callbacks.onDragEnd && dragPos && dragOffset) {
    var callbackEvent = Object.assign({}, event);
    callbackEvent.lngLat = getDragLngLat(dragPos, dragOffset, props, context);
    callbacks.onDragEnd(callbackEvent);
  }
}
function onDragCancel(event, _ref4) {
  var state = _ref4.state;
  event.stopPropagation();
  state.setDragPos(null);
  state.setDragOffset(null);
}
function registerEvents(thisRef) {
  var eventManager = thisRef.context.eventManager;
  if (!eventManager || !thisRef.state.dragPos) {
    return undefined;
  }
  var events = {
    panmove: function panmove(evt) {
      return onDrag(evt, thisRef);
    },
    panend: function panend(evt) {
      return onDragEnd(evt, thisRef);
    },
    pancancel: function pancancel(evt) {
      return onDragCancel(evt, thisRef);
    }
  };
  eventManager.watch(events);
  return function () {
    eventManager.off(events);
  };
}
function useDraggableControl(props) {
  var _useState = (0, _react.useState)(null),
    _useState2 = (0, _slicedToArray2["default"])(_useState, 2),
    dragPos = _useState2[0],
    setDragPos = _useState2[1];
  var _useState3 = (0, _react.useState)(null),
    _useState4 = (0, _slicedToArray2["default"])(_useState3, 2),
    dragOffset = _useState4[0],
    setDragOffset = _useState4[1];
  var thisRef = (0, _useMapControl["default"])(_objectSpread(_objectSpread({}, props), {}, {
    onDragStart: onDragStart
  }));
  thisRef.callbacks = props;
  thisRef.state.dragPos = dragPos;
  thisRef.state.setDragPos = setDragPos;
  thisRef.state.dragOffset = dragOffset;
  thisRef.state.setDragOffset = setDragOffset;
  (0, _react.useEffect)(function () {
    return registerEvents(thisRef);
  }, [thisRef.context.eventManager, Boolean(dragPos)]);
  return thisRef;
}
//# sourceMappingURL=draggable-control.js.map