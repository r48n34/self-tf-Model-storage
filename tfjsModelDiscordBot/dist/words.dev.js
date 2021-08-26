"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.jsonWriteFile = jsonWriteFile;
exports.initArray = initArray;
exports.Pair = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _asyncMutex = require("async-mutex");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var filePath = 'textP.txt';
var semaphore = new _asyncMutex.Semaphore(1);

var Pair = function Pair(key, value) {
  _classCallCheck(this, Pair);

  this.key = key;
  this.value = value;
};

exports.Pair = Pair;

function initArray() {
  var wordPairArr = [];

  try {
    var data = _fs["default"].readFileSync(filePath, 'UTF-8');

    wordPairArr = JSON.parse(data);
    return wordPairArr;
  } catch (err) {
    console.log(err);
  }
}

function jsonWriteFile(arr) {
  var _ref, _ref2, value, release;

  return regeneratorRuntime.async(function jsonWriteFile$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(semaphore.acquire());

        case 2:
          _ref = _context.sent;
          _ref2 = _slicedToArray(_ref, 2);
          value = _ref2[0];
          release = _ref2[1];

          try {
            _fs["default"].writeFile(filePath, JSON.stringify(arr), 'UTF-8', function (err) {
              err ? console.log(err) : console.log('Append operation complete.');
            });
          } finally {
            release();
          }

        case 7:
        case "end":
          return _context.stop();
      }
    }
  });
}