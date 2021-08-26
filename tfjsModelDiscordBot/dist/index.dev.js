"use strict";

var _open = _interopRequireDefault(require("open"));

var _discord = _interopRequireDefault(require("discord.js"));

var _words = require("./words.js");

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

function _readOnlyError(name) { throw new Error("\"" + name + "\" is read-only"); }

var createCanvas = _canvas2["default"].createCanvas,
    loadImage = _canvas2["default"].loadImage;

_dotenv["default"].config();

var wordPairArr = (0, _words.initArray)(); // array for message pair

var bot = new _discord["default"].Client();
var prefix = "&";
var myId = process.env.myId;
var botId = process.env.botId;
var model;
var modelSSD;
var modelMobile;
modelInit(); // Load in model

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
}); // Open page function

function pageOpen(msg) {
  var message = "HA, you are not my master.";

  if (msg.author.id == myId) {
    message = (_readOnlyError("message"), "done");
    var arg = msg.content.split(" ");
    (0, _open["default"])(arg[1]); // open that url in google chrome 
  }

  msg.channel.send(message);
} // Helper get string


function getString(arg) {
  var longStr = "";

  for (var i = 2; i < arg.length; i++) {
    // add afterwards word
    longStr += i + 1 == arg.length ? arg[i] : arg[i] + " ";
  }

  return longStr;
}

bot.on('message', function _callee2(msg) {
  var sayCond, chatInOut, playMusic, addMessage, adjustMessage, helpMsg, imgRec, predictions, voilate, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, i;

  return regeneratorRuntime.async(function _callee2$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          imgRec = function _ref6(msg, method) {
            var att, _canvas, ctx, img, imgPred, color, i, sendStr, _i;

            return regeneratorRuntime.async(function imgRec$(_context6) {
              while (1) {
                switch (_context6.prev = _context6.next) {
                  case 0:
                    att = msg.attachments;

                    if (!(att.array().length > 0)) {
                      _context6.next = 26;
                      break;
                    }

                    _canvas = createCanvas(224, 224);
                    ctx = _canvas.getContext('2d'); // load in the imahe from discord url

                    _context6.next = 6;
                    return regeneratorRuntime.awrap(loadImage(att.array()[0].url));

                  case 6:
                    img = _context6.sent;
                    ctx.drawImage(img, 0, 0); // Predicting using cocoSSD

                    if (!(method == "ssd")) {
                      _context6.next = 14;
                      break;
                    }

                    _context6.next = 11;
                    return regeneratorRuntime.awrap(modelSSD.detect(_canvas));

                  case 11:
                    _context6.t0 = _context6.sent;
                    _context6.next = 17;
                    break;

                  case 14:
                    _context6.next = 16;
                    return regeneratorRuntime.awrap(modelMobile.classify(_canvas));

                  case 16:
                    _context6.t0 = _context6.sent;

                  case 17:
                    imgPred = _context6.t0;

                    if (!(method == "mobile")) {
                      _context6.next = 22;
                      break;
                    }

                    console.log(imgPred);
                    msg.channel.send("Is this a ".concat(imgPred[0].className, "? (Prob = ").concat((imgPred[0].probability * 100).toFixed(2), ")%"));
                    return _context6.abrupt("return");

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
                      ctx.fillText(imgPred[i].score.toFixed(3) + ' ' + imgPred[i]["class"], imgPred[i].bbox[0], imgPred[i].bbox[1] - 5);
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
                    return _context6.stop();
                }
              }
            });
          };

          helpMsg = function _ref5(msg) {
            var text = "open: Open a page in my Chrome. \n\n      come : Enter current channel. \n\n      leave: Leave current channel. \n\n      play <musicName>: Play regarding music. \n\n      add <key> <value>: Add text to DB. \n\n      adjust <key> <value>: Adjust regarding key to other value. \n\n      whatS: With attachments of image, it using cocoSSD for object detection. \n\n      whatM : With attachments of image, it using mobileNet for classification. \n\n      help: Get help.";
            msg.channel.send(m.text);
          };

          adjustMessage = function _ref4(msg) {
            var arg, longStr, found;
            return regeneratorRuntime.async(function adjustMessage$(_context5) {
              while (1) {
                switch (_context5.prev = _context5.next) {
                  case 0:
                    arg = msg.content.split(" ");
                    longStr = getString(arg);
                    console.log(longStr);
                    found = wordPairArr.findIndex(function (v) {
                      return v.key === arg[1];
                    }); // Dup word on array with index

                    if (!(found >= 0 && longStr)) {
                      _context5.next = 9;
                      break;
                    }

                    wordPairArr[found].value = longStr;
                    (0, _words.jsonWriteFile)(wordPairArr);
                    msg.channel.send("Text adjusted");
                    return _context5.abrupt("return");

                  case 9:
                    msg.channel.send("Font word don't existed or invalid arguments");
                    return _context5.abrupt("return");

                  case 11:
                  case "end":
                    return _context5.stop();
                }
              }
            });
          };

          addMessage = function _ref3(msg) {
            var arg = msg.content.split(" "); // [1] = key, [n] = value

            var longStr = getString(arg);
            var found = wordPairArr.find(function (v) {
              return v.key === arg[1];
            }); // Dup word on array

            if (found) {
              msg.channel.send("word existed.");
              return;
            } // have args 1 and longStr exist


            if (arg[1] && longStr) {
              wordPairArr.push(new _words.Pair(arg[1], longStr));
              (0, _words.jsonWriteFile)(wordPairArr);
              msg.channel.send("Text added");
            }
          };

          playMusic = function _ref2(msg) {
            var arg, channelNew, connection;
            return regeneratorRuntime.async(function playMusic$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    if (!msg.member.voiceChannelID) {
                      _context4.next = 9;
                      break;
                    }

                    arg = msg.content.split(" ");
                    _context4.next = 4;
                    return regeneratorRuntime.awrap(bot.channels.get(msg.member.voiceChannelID));

                  case 4:
                    channelNew = _context4.sent;
                    _context4.next = 7;
                    return regeneratorRuntime.awrap(channelNew.join());

                  case 7:
                    connection = _context4.sent;
                    connection.playFile('./music/' + arg[1]);

                  case 9:
                  case "end":
                    return _context4.stop();
                }
              }
            });
          };

          chatInOut = function _ref(msg, toIn) {
            var channel;
            return regeneratorRuntime.async(function chatInOut$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    if (!msg.member.voiceChannelID) {
                      _context3.next = 5;
                      break;
                    }

                    _context3.next = 3;
                    return regeneratorRuntime.awrap(bot.channels.get(msg.member.voiceChannelID));

                  case 3:
                    channel = _context3.sent;
                    toIn ? channel.join() : channel.leave();

                  case 5:
                  case "end":
                    return _context3.stop();
                }
              }
            });
          };

          sayCond = wordPairArr.find(function (v) {
            return v.key === msg.content;
          }); // Join or leave the chat room

          if (!sayCond) {
            _context7.next = 19;
            break;
          }

          _context7.prev = 8;

          if (!(msg.author.id == botId)) {
            _context7.next = 11;
            break;
          }

          return _context7.abrupt("return");

        case 11:
          msg.channel.send(sayCond.value); // Normal send

          _context7.next = 17;
          break;

        case 14:
          _context7.prev = 14;
          _context7.t0 = _context7["catch"](8);
          console.log(_context7.t0);

        case 17:
          _context7.next = 20;
          break;

        case 19:
          if (msg.content.startsWith(prefix + 'open')) {
            // &open
            pageOpen(msg);
          } else if (msg.content.startsWith(prefix + 'come')) {
            // &come
            chatInOut(msg, true);
          } else if (msg.content.startsWith(prefix + 'leave')) {
            // &leave
            chatInOut(msg, false);
          } else if (msg.content.startsWith(prefix + 'play')) {
            // &play xxx.mp3
            playMusic(msg);
          } else if (msg.content.startsWith(prefix + 'add')) {
            //&add key Message...
            addMessage(msg);
          } else if (msg.content.startsWith(prefix + 'adjust')) {
            //&adjust key newMessage...
            adjustMessage(msg);
          } else if (msg.content.startsWith(prefix + 'whatS')) {
            //&adjust key newMessage...
            imgRec(msg, "ssd");
          } else if (msg.content.startsWith(prefix + 'whatM')) {
            //&adjust key newMessage...
            imgRec(msg, "mobile");
          } else if (msg.content.startsWith(prefix + 'help')) {
            //&adjust key newMessage...
            helpMsg();
          }

        case 20:
          // Text type checker
          console.log(msg.content);
          _context7.next = 23;
          return regeneratorRuntime.awrap(model.classify([msg.content]));

        case 23:
          predictions = _context7.sent;
          voilate = [];
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context7.prev = 28;

          for (_iterator = predictions[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            i = _step.value;

            if (i.results[0].match) {
              console.log(i.label);
              voilate.push(i.label);
            }
          }

          _context7.next = 36;
          break;

        case 32:
          _context7.prev = 32;
          _context7.t1 = _context7["catch"](28);
          _didIteratorError = true;
          _iteratorError = _context7.t1;

        case 36:
          _context7.prev = 36;
          _context7.prev = 37;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 39:
          _context7.prev = 39;

          if (!_didIteratorError) {
            _context7.next = 42;
            break;
          }

          throw _iteratorError;

        case 42:
          return _context7.finish(39);

        case 43:
          return _context7.finish(36);

        case 44:
          voilate.length > 0 && msg.channel.send("You have violate the ".concat(voilate.join(", "), "!!"));

        case 45:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[8, 14], [28, 32, 36, 44], [37,, 39, 43]]);
});