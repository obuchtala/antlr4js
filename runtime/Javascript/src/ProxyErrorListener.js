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

var ProxyErrorListener = function(delegates) {
  if (delegates === null) {
    throw new Error("NullPointerException: delegates");
  }
  this.delegates = delegates;
};

ProxyErrorListener.__prototype__ = function() {

  this.syntaxError = function(recognizer, offendingSymbol, line, charPositionInLine, msg, e) {
    for (var i = 0; i < this.delegates.length; i++) {
      var listener = this.delegates[i];
      listener.syntaxError(recognizer, offendingSymbol, line, charPositionInLine, msg, e);
    }
  };

  this.reportAmbiguity = function(recognizer, dfa, startIndex, stopIndex, exact, ambigAlts, configs) {
    for (var i = 0; i < this.delegates.length; i++) {
      var listener = this.delegates[i];
      listener.reportAmbiguity(recognizer, dfa, startIndex, stopIndex, exact, ambigAlts, configs);
    }
  };

  this.reportAttemptingFullContext = function(recognizer, dfa, startIndex, stopIndex, conflictingAlts, configs) {
    for (var i = 0; i < this.delegates.length; i++) {
      var listener = this.delegates[i];
      listener.reportAttemptingFullContext(recognizer, dfa, startIndex, stopIndex, conflictingAlts, configs);
    }
  };

  this.reportContextSensitivity = function(recognizer, dfa, startIndex, stopIndex, prediction, configs) {
    for (var i = 0; i < this.delegates.length; i++) {
      var listener = this.delegates[i];
      listener.reportContextSensitivity(recognizer, dfa, startIndex, stopIndex, prediction, configs);
    }
  };

};
ProxyErrorListener.prototype = new ProxyErrorListener.__prototype__();

module.exports = ProxyErrorListener;
