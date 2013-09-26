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
var Arrays = require("../misc/Arrays");
var HashSet = require("../misc/HashSet");
var StringBuilder = require("../misc/StringBuilder");
var MurmurHash = require("./misc/MurmurHash");

var DFAState = function() {

  this.stateNumber = -1;
  this.configs = new ATNConfigSet();
  this.edges = null;
  this.isAcceptState = false;
  this.prediction = 0;
  this.lexerRuleIndex = -1; // if accept, exec action in what rule?
  this.lexerActionIndex = -1; // if accept, exec what action?
  this.requiresFullContext = false;
  this.predicates = null;

  if (arguments.length === 1) {
    var arg = arguments[0];
    if (_.isNumber(arg)) {
      this.stateNumber = arg;
    } else if (arg instanceof ATNConfigSet) {
      this.configs = arg;
    } else {
      throw new Error("Illegal argument.");
    }
  }
};

DFAState.__prototype__ = function() {

  this.getAltSet = function() {
    var alts = new HashSet();
    if (this.configs !== null) {
      this.configs.forEach(function(c) {
        alts.add(c.alt);
      });
    }
    if (alts.isEmpty()) return null;
    return alts;
  };

  this.hashCode = function() {
    var hash = MurmurHash.initialize(7);
    hash = MurmurHash.update(hash, this.configs.hashCode());
    hash = MurmurHash.finish(hash, 1);
    return hash;
  };

  this.equals = function(o) {
    if (this === o) return true;
    if (!(o instanceof DFAState)) {
      return false;
    }
    var sameSet = this.configs.equals(o.configs);
    return sameSet;
  };

  this.toString = function() {
    var buf = new StringBuilder();
    buf.append(this.stateNumber).append(":").append(this.configs);
    if (this.isAcceptState) {
      buf.append("=>");
      if (this.predicates !== null) {
        buf.append(Arrays.toString(this.predicates));
      } else {
        buf.append(this.prediction);
      }
    }
    return buf.toString();
  };
};
DFAState.prototype = new DFAState.__prototype__();

DFAState.PredPrediction = function(pred, alt) {
  this.alt = alt;
  this.pred = pred;
};

DFAState.PredPrediction.prototype = {
  toString: function() {
    return ["(", this.pred, ", ", this.alt, ")"].join("");
  }
};
