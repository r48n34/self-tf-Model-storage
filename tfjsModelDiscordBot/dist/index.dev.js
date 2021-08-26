"use strict";

var _discord = _interopRequireDefault(require("discord.js"));

var _dotenv = _interopRequireDefault(require("dotenv"));

var _canvas2 = _interopRequireDefault(require("canvas"));

require("@tensorflow/tfjs");

var _toxicity = _interopRequireDefault(require("@tensorflow-models/toxicity"));

var _cocoSsd = _interopRequireDefault(require("@tensorflow-models/coco-ssd"));

var _mobilenet = _interopRequireDefault(require("@tensorflow-models/mobilenet"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var createCanvas = _canvas2["default"].createCanvas,
    loadImage = _canvas2["default"].loadImage;

_dotenv["default"].config(); // Remember toccreate a .env for botUID


var bot = new _discord["default"].Client();
var prefix = "&";
var model;
var modelSSD;
var modelMobile; // Load in model

function modelInit() {
  return regeneratorRuntime.async(function modelInit$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log("Loading model...");
          _context.next = 3;
          return regeneratorRuntime.awrap(_toxicity["default"].load(0.8));

        case 3:
          model = _context.sent;
          _context.next = 6;
          return regeneratorRuntime.awrap(_cocoSsd["default"].load());

        case 6:
          modelSSD = _context.sent;
          _context.next = 9;
          return regeneratorRuntime.awrap(_mobilenet["default"].load());

        case 9:
          modelMobile = _context.sent;
          console.log("Done");
          bot.login(process.env.botUID);

        case 12:
        case "end":
          return _context.stop();
      }
    }
  });
}

modelInit();
bot.on('ready', function _callee() {
  return regeneratorRuntime.async(function _callee$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          console.info("Logged in as ".concat(bot.user.tag, "!"));

        case 1:
        case "end":
          return _context2.stop();
      }
    }
  });
});
bot.on('message', function _callee2(msg) {
  var imgRec, predictions, voilate, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, i;

  return regeneratorRuntime.async(function _callee2$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          imgRec = function _ref(msg, method) {
            var att, _canvas, ctx, img, imgPred, color, i, sendStr, _i;

            return regeneratorRuntime.async(function imgRec$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    att = msg.attachments;

                    if (!(att.array().length > 0)) {
                      _context3.next = 26;
                      break;
                    }

                    _canvas = createCanvas(att.array()[0].width, att.array()[0].height);
                    ctx = _canvas.getContext('2d'); // load in the imahe from discord url

                    _context3.next = 6;
                    return regeneratorRuntime.awrap(loadImage(att.array()[0].url));

                  case 6:
                    img = _context3.sent;
                    ctx.drawImage(img, 0, 0); // Predicting using cocoSSD

                    if (!(method == "ssd")) {
                      _context3.next = 14;
                      break;
                    }

                    _context3.next = 11;
                    return regeneratorRuntime.awrap(modelSSD.detect(_canvas));

                  case 11:
                    _context3.t0 = _context3.sent;
                    _context3.next = 17;
                    break;

                  case 14:
                    _context3.next = 16;
                    return regeneratorRuntime.awrap(modelMobile.classify(_canvas));

                  case 16:
                    _context3.t0 = _context3.sent;

                  case 17:
                    imgPred = _context3.t0;

                    if (!(method == "mobile")) {
                      _context3.next = 22;
                      break;
                    }

                    console.log(imgPred);
                    msg.channel.send("Is this a ".concat(imgPred[0].className, "? (Prob = ").concat((imgPred[0].probability * 100).toFixed(2), ")%"));
                    return _context3.abrupt("return");

                  case 22:
                    //Draw box
                    ctx.font = '20px Arial';
                    color = ["blue", "yellow", "red"];

                    for (i = 0; i < imgPred.length; i++) {
                      ctx.beginPath();
                      ctx.rect.apply(ctx, _toConsumableArray(imgPred[i].bbox));
                      ctx.lineWidth = 5;
                      ctx.strokeStyle = ctx.fillStyle = color[i % 3];
                      ctx.stroke();
                      ctx.fillText(imgPred[i].score.toFixed(3) + ' ' + imgPred[i]["class"], imgPred[i].bbox[0], imgPred[i].bbox[1] + 10);
                    } //Return label and boxes


                    if (imgPred.length >= 1) {
                      //found
                      sendStr = "Is that a ";

                      for (_i = 0; _i < imgPred.length; _i++) {
                        sendStr += "".concat(imgPred[_i]["class"], "? (Prob = ").concat((imgPred[_i].score * 100).toFixed(2), "%) ");
                        _i + 1 != imgPred.length && (sendStr += " and ");
                      }

                      msg.channel.send(sendStr, {
                        files: [{
                          attachment: _canvas.toBuffer(),
                          name: 'imageReg.jpg'
                        }]
                      });
                    } else {
                      // Not found
                      msg.channel.send("Sorry, can't find the regarding label.");
                    }

                  case 26:
                  case "end":
                    return _context3.stop();
                }
              }
            });
          };

          if (msg.content.startsWith(prefix + 'whatS')) {
            imgRec(msg, "ssd");
          } else if (msg.content.startsWith(prefix + 'whatM')) {
            imgRec(msg, "mobile");
          } else if (msg.content.startsWith(prefix + 'helpMe')) {
            msg.channel.send("whatS = cocoSSD, whatM = moiblenetv1");
          }

          // Text type checker
          console.log(msg.content);
          _context4.next = 5;
          return regeneratorRuntime.awrap(model.classify([msg.content]));

        case 5:
          predictions = _context4.sent;
          voilate = [];
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context4.prev = 10;

          for (_iterator = predictions[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            i = _step.value;

            if (i.results[0].match) {
              console.log(i.label);
              voilate.push(i.label);
            }
          }

          _context4.next = 18;
          break;

        case 14:
          _context4.prev = 14;
          _context4.t0 = _context4["catch"](10);
          _didIteratorError = true;
          _iteratorError = _context4.t0;

        case 18:
          _context4.prev = 18;
          _context4.prev = 19;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 21:
          _context4.prev = 21;

          if (!_didIteratorError) {
            _context4.next = 24;
            break;
          }

          throw _iteratorError;

        case 24:
          return _context4.finish(21);

        case 25:
          return _context4.finish(18);

        case 26:
          voilate.length > 0 && msg.channel.send("You have violate the ".concat(voilate.join(", "), "!!"));

        case 27:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[10, 14, 18, 26], [19,, 21, 25]]);
});