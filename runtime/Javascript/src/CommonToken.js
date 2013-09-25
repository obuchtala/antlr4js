"use strict";
/*
 * [The "BSD license"]
 *  Copyright (c) 2013 Oliver Buchtala
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *
 *  1. Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *  2. Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *  3. The name of the author may not be used to endorse or promote products
 *     derived from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 *  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 *  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 *  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 *  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var _ = require("underscore");
var Pair = require("./misc/Pair");
var Interval = require("./misc/Interval");
var Token = require("./Token");

var CommonToken = function() {
  this.type = null;
  this.line = 0;
  this.charPositionInLine = -1; // set to invalid position
  this.channel = Token.DEFAULT_CHANNEL;
  this.source = null;
  this.text = null;
  this.index = -1;
  this.start = 0;
  this.stop = 0;

  var type;
  if (arguments.length === 1) {
    var arg = arguments[0];
    if (_.isBoolean(arg)) {
      this.type = arg;
    } else {
      var oldToken = arg;
      this.text = oldToken.getText();
      this.type = oldToken.getType();
      this.line = oldToken.getLine();
      this.index = oldToken.getTokenIndex();
      this.charPositionInLine = oldToken.getCharPositionInLine();
      this.channel = oldToken.getChannel();
      this.start = oldToken.getStartIndex();
      this.stop = oldToken.getStopIndex();
      if (oldToken instanceof CommonToken) {
        this.source = oldToken.source;
      } else {
        this.source = new Pair(oldToken.getTokenSource(), oldToken.getInputStream());
      }
    }
  } else if (arguments.length === 2) {
    type = arguments[0];
    var text = arguments[1];

    this.type = type;
    this.channel = Token.DEFAULT_CHANNEL;
    this.text = text;
    this.source = CommonToken.EMPTY_SOURCE;
  } else if (arguments.length === 5) {
    var source = arguments[0];
    type = arguments[1];
    var channel = arguments[2];
    var start = arguments[3];
    var stop = arguments[4];

    this.source = source;
    this.type = type;
    this.channel = channel;
    this.start = start;
    this.stop = stop;
    if (source.a !== null) {
      this.line = source.a.getLine();
      this.charPositionInLine = source.a.getCharPositionInLine();
    }
  }
};

CommonToken.__prototype__ = function() {

  this.getType = function() {
    return this.type;
  };

  this.setLine = function(line) {
    this.line = line;
  };

  this.getText = function() {
    if (this.text !== null) {
      return this.text;
    }

    var input = this.getInputStream();
    if (input === null) return null;
    var n = input.size();
    if (this.start < n && this.stop < n) {
      return input.getText(Interval.of(this.start, this.stop));
    } else {
      return "<EOF>";
    }
  };

  this.setText = function(text) {
    this.text = text;
  };

  this.getLine = function() {
    return this.line;
  };

  this.getCharPositionInLine = function() {
    return this.charPositionInLine;
  };

  this.setCharPositionInLine = function(charPositionInLine) {
    this.charPositionInLine = charPositionInLine;
  };

  this.getChannel = function() {
    return this.channel;
  };

  this.setChannel = function(channel) {
    this.channel = channel;
  };

  this.setType = function(type) {
    this.type = type;
  };

  this.getStartIndex = function() {
    return this.start;
  };

  this.setStartIndex = function(start) {
    this.start = start;
  };

  this.getStopIndex = function() {
    return this.stop;
  };

  this.setStopIndex = function(stop) {
    this.stop = stop;
  };

  this.getTokenIndex = function() {
    return this.index;
  };

  this.setTokenIndex = function(index) {
    this.index = index;
  };

  this.getTokenSource = function() {
    return this.source.a;
  };

  this.getInputStream = function() {
    return this.source.b;
  };

  this.toString = function() {
    var channelStr = "";
    if (this.channel > 0) {
      channelStr = ",channel=" + this.channel;
    }
    var txt = this.getText();
    if (txt !== null) {
      txt = txt.replace("\n", "\\n");
      txt = txt.replace("\r", "\\r");
      txt = txt.replace("\t", "\\t");
    } else {
      txt = "<no text>";
    }
    return ["[@", this.getTokenIndex(), ",", this.start, ":", this.stop, "='", txt, "',<", this.type, ">",
      channelStr, ",", this.line, ":", this.getCharPositionInLine(), "]"].join("");
  };
};
CommonToken.__prototype__.prototype = Token.prototype;
CommonToken.prototype = new CommonToken.__prototype__();

CommonToken.EMPTY_SOURCE = new Pair(null, null);

module.exports = CommonToken;
