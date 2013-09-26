"use strict";
/*
 * [The "BSD license"]
 *  Copyright (c) 2013 Oliver Buchtala
 *  Copyright (c) 2012 Terence Parr
 *  Copyright (c) 2012 Sam Harwell
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
var Token = require("./Token");
var ConsoleErrorListener = require("./ConsoleErrorListener");
var ProxyErrorListener = require("./ProxyErrorListener");

var Recognizer = function() {

  this._listeners = [];
  this._listeners.push(ConsoleErrorListener.INSTANCE);

  //protected ATNInterpreter _interp;
  this._interp = null;

  this._stateNumber = -1;
};

Recognizer.__prototype__ = function() {

  this.getTokenNames = function() {
    throw new Error("Abstract.");
  };

  this.getRuleNames = function() {
    throw new Error("Abstract.");
  };

  this.getGrammarFileName = function() {
    throw new Error("Abstract.");
  };

  this.getATN = function() {
    throw new Error("Abstract.");
  };

  this.getInterpreter = function() {
    return this._interp;
  };

  this.setInterpreter = function(interpreter) {
    this._interp = interpreter;
  };

  this.getErrorHeader = function(e) {
    var line = e.getOffendingToken().getLine();
    var charPositionInLine = e.getOffendingToken().getCharPositionInLine();
    return "line " + line + ":" + charPositionInLine;
  };

  this.getTokenErrorDisplay = function(t) {
    if (t === null) return "<no token>";
    var s = t.getText();
    if (s === null) {
      if (t.getType() === Token.EOF) {
        s = "<EOF>";
      } else {
        s = "<" + t.getType() + ">";
      }
    }
    s = s.replace("\n", "\\n");
    s = s.replace("\r", "\\r");
    s = s.replace("\t", "\\t");
    return "'" + s + "'";
  };

  this.addErrorListener = function(listener) {
    if (listener === null) {
      throw new Error("NullPointerException: listener cannot be null.");
    }
    this._listeners.push(listener);
  };

  this.removeErrorListener = function(listener) {
    this._listeners = _.without(this._listeners, listener);
  };

  this.removeErrorListeners = function() {
    this._listeners = [];
  };

  this.getErrorListeners = function() {
    return this._listeners;
  };

  this.getErrorListenerDispatch = function() {
    return new ProxyErrorListener(this.getErrorListeners());
  };

  this.sempred = function() {
    return true;
  };

  this.action = function() {};

  this.getState = function() {
    return this._stateNumber;
  };

  this.setState = function(atnState) {
    this._stateNumber = atnState;
  };

  this.getInputStream = function() {
    throw new Error("Abstract.");
  };

  this.setInputStream = function() {
    throw new Error("Abstract.");
  };

  this.getTokenFactory = function() {
    throw new Error("Abstract.");
  };

  this.setTokenFactory = function() {
    throw new Error("Abstract.");
  };

};
Recognizer.prototype = new Recognizer.__prototype__();

Recognizer.EOF = -1;

module.exports = Recognizer;
