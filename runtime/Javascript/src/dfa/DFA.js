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

var HashMap = require("../misc/HashMap");
var DFASerializer = require("./DFASerializer");
var LexerDFASerializer = require("./LexerDFASerializer");

var DFA = function() {

  this.states = new HashMap();
  this.s0 = null;

  this.decision = 0;
  this.atnStartState = null;

  switch (arguments.length) {
    case 1:
      this.decision = 0;
      this.atnStartState = arguments[0];
      break;
    case 2:
      this.atnStartState = arguments[0];
      this.decision = arguments[1];
  }

  if (this.atnStartState === null) {
    throw new Error("IllegalArgument");
  }
};

DFA.__prototype__ = function() {

  this.getStates = function() {
    var result = this.states.keys();
    result.sort(function(o1, o2) {
      return o1.stateNumber - o2.stateNumber;
    });
    return result;
  };

  this.toString = function(tokenNames) {
    if (tokenNames === undefined) {
      tokenNames = null;
    }
    if (this.s0 === null) return "";
    var serializer = new DFASerializer(this, tokenNames);
    return serializer.toString();
  };

  this.toLexerString = function() {
    if (this.s0 === null) return "";
    var serializer = new LexerDFASerializer(this);
    return serializer.toString();
  };
};
DFA.prototype = new DFA.__prototype__();

module.exports = DFA;
