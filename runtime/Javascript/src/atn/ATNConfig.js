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
var MurmurHash = require("../misc/MurmurHash");
var StringBuilder = require("../misc/StringBuilder");
var ATNState = require("./ATNState");

var _ATNConfig_old = function(old) { // dup
  this.state = old.state;
  this.alt = old.alt;
  this.context = old.context;
  this.semanticContext = old.semanticContext;
  this.reachesIntoOuterContext = old.reachesIntoOuterContext;
};

var _ATNConfig_state_alt_context_sem = function(state, alt, context, semanticContext) {
  this.state = state;
  this.alt = alt;
  this.context = context;
  this.semanticContext = semanticContext;
};

var _ATNConfig_config_state_context_sem = function(c, state, context, semanticContext) {
  this.state = state;
  this.alt = c.alt;
  this.context = context;
  this.semanticContext = semanticContext;
  this.reachesIntoOuterContext = c.reachesIntoOuterContext;
};

var ATNConfig = function() {

  this.state = null;
  this.alt = 0;
  this.context = null;
  this.reachesIntoOuterContext = 0;
  this.semanticContext = null;

  var a = arguments;
  switch (a.length) {
    case 1:
      if (a[0] instanceof ATNConfig) {
        _ATNConfig_old.call(this, a[0]);
      }
      break;
    case 2:
      if ((a[0] instanceof ATNConfig) && (a[1] instanceof ATNState)) {
        _ATNConfig_config_state_context_sem.call(this, a[0], a[1], a[0].context, SemanticContext.NONE);
      } else if ((a[0] instanceof ATNConfig) && (a[1] instanceof SemanticContext)) {
        _ATNConfig_config_state_context_sem.call(this, a[0], a[0].state, a[0].context, a[1]);
      }
      break;
    case 3:
      if ((a[0] instanceof ATNState) && _.isNumber(a[1])) {
        _ATNConfig_state_alt_context_sem.call(this, a[0], a[1], a[2], SemanticContext.NONE);
      } else if ((a[0] instanceof ATNConfig) && (a[1] instanceof ATNState) && (a[2] instanceof SemanticContext)) {
        _ATNConfig_config_state_context_sem.call(this, a[0], a[1], a[0].context, a[2]);
      } else if ((a[0] instanceof ATNConfig) && (a[1] instanceof ATNState) && (a[2] instanceof PredictionContext)) {
        _ATNConfig_config_state_context_sem.call(this, a[0], a[1], a[2], a[0].semanticContext);
      }
      break;
    case 4:
      if ((a[0] instanceof ATNState) && _.isNumber(a[1])) {
        _ATNConfig_state_alt_context_sem.apply(this, a);
      } else {
        _ATNConfig_config_state_context_sem.apply(this, a);
      }
      break;
  }
};

ATNConfig.__prototype__ = function() {

  this.equals = function(other) {
    if (this === other) {
      return true;
    }

    if (other === null || !(other instanceof ATNConfig)) {
      return false;
    }

    return this.state.stateNumber === other.state.stateNumber &&
      this.alt === other.alt &&
      (this.context === other.context || (this.context !== null && this.context.equals(other.context))) &&
      this.semanticContext.equals(other.semanticContext);
  };

  this.hashCode = function() {
    var hashCode = MurmurHash.initialize(7);
    hashCode = MurmurHash.update(hashCode, this.state.stateNumber);
    hashCode = MurmurHash.update(hashCode, this.alt);
    hashCode = MurmurHash.update(hashCode, this.context);
    hashCode = MurmurHash.update(hashCode, this.semanticContext);
    hashCode = MurmurHash.finish(hashCode, 4);
    return hashCode;
  };

  this.toString = function(recog, showAlt) {
    if (arguments.length === 0) {
      recog = null;
      showAlt = true;
    }

    var buf = new StringBuilder();
    buf.append('(');
    buf.append(this.state);
    if (showAlt) {
      buf.append(",");
      buf.append(this.alt);
    }
    if (this.context !== null) {
      buf.append(",[");
      buf.append(this.context.toString());
      buf.append("]");
    }
    if (this.semanticContext !== null && this.semanticContext != SemanticContext.NONE) {
      buf.append(",");
      buf.append(this.semanticContext);
    }
    if (this.reachesIntoOuterContext > 0) {
      buf.append(",up=").append(this.reachesIntoOuterContext);
    }
    buf.append(')');
    return buf.toString();
  };
};

ATNConfig.prototype = new ATNConfig.__prototype__();

module.exports = ATNConfig;
