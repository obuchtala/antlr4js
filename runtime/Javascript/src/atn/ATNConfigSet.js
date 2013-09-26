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
var BitSet = require("../misc/BitSet");
var HashSet = require("../misc/HashSet");
var StringBuilder = require("../misc/StringBuilder");


var ConfigHashSet = {};

ConfigHashSet.hashCode = function() {
  var hashCode = 7;
  hashCode = 31 * hashCode + this.state.stateNumber;
  hashCode = 31 * hashCode + this.alt;
  hashCode = 31 * hashCode + this.semanticContext.hashCode();
  return hashCode;
};

ConfigHashSet.equals = function(o) {
  if (this === o) return true;
  if (o === null) return false;
  return this.state.stateNumber == o.state.stateNumber && this.alt == o.alt && this.semanticContext.equals(o.semanticContext);
};


var ATNConfigSet = function() {

  this.readonly = false;

  this.configLookup = null;

  this.configs = [];

  this.uniqueAlt = 0;
  this.conflictingAlts = new BitSet();

  this.hasSemanticContext = false;
  this.dipsIntoOuterContext = false;

  this.fullCtx = false;

  this.cachedHashCode = -1;

  this.configLookup = HashSet.create(ConfigHashSet.hashCode, ConfigHashSet.equals);

  if (arguments.length === 0) {
    this.fullCtx = true;
  } else if (arguments.length === 1) {
    var arg;
    if (_.isBoolean(arg)) {
      this.fullCtx = arg;
    } else if (arg instanceof ATNConfigSet) {
      var old = arg;
      this.fullCtx = old.fullCtx;
      this.addAll(old);
      this.uniqueAlt = old.uniqueAlt;
      this.conflictingAlts = old.conflictingAlts;
      this.hasSemanticContext = old.hasSemanticContext;
      this.dipsIntoOuterContext = old.dipsIntoOuterContext;
    }
  }
};

ATNConfigSet.__prototype__ = function() {

  this.add = function(config, mergeCache) {
    if (this.readonly) throw new Error("IllegalStateException: This set is readonly");
    if (config.semanticContext !== SemanticContext.NONE) {
      this.hasSemanticContext = true;
    }
    if (config.reachesIntoOuterContext > 0) {
      this.dipsIntoOuterContext = true;
    }
    var existing = this.configLookup.getOrAdd(config);
    if (existing === config) { // we added this new one
      this.cachedHashCode = -1;
      this.configs.add(config); // track order here
      return true;
    }
    var rootIsWildcard = !this.fullCtx;
    var merged = PredictionContext.merge(existing.context, config.context, rootIsWildcard, mergeCache);
    existing.reachesIntoOuterContext =
      Math.max(existing.reachesIntoOuterContext, config.reachesIntoOuterContext);
    existing.context = merged; // replace context; no need to alt mapping
    return true;
  };

  this.elements = function() {
    return this.configs;
  };

  this.getStates = function() {
    var states = new HashSet();
    for (var i = 0; i < this.configs.length; i++) {
      var c = this.configs[i];
      states.add(c.state);
    }
    return states;
  };

  this.getPredicates = function() {
    var preds = [];
    for (var i = 0; i < this.configs.length; i++) {
      var c = this.configs[i];
      if (c.semanticContext !== SemanticContext.NONE) {
        preds.push(c.semanticContext);
      }
    }
    return preds;
  };

  this.get = function(i) {
    return this.configs[i];
  };

  this.optimizeConfigs = function(interpreter) {
    if (this.readonly) throw new Error("IllegalStateException: This set is readonly");
    if (this.configLookup.isEmpty()) return;

    for (var i = 0; i < this.configs.length; i++) {
      var c = this.configs[i];
      c.context = interpreter.getCachedContext(c.context);
    }
  };

  this.addAll = function(coll) {
    if (coll instanceof ATNConfigSet) {
      coll = coll.configs;
    }
    for (var i = 0; i < coll.length; i++) {
      var c = coll[i];
      this.add(c);
    }
    return false;
  };

  this.equals = function(o) {
    if (o === this) {
      return true;
    } else if (!(o instanceof ATNConfigSet)) {
      return false;
    }

    var other = o;
    var same = this.configs !== null &&
      _.equals(this.configs, other.configs) && // includes stack context
    this.fullCtx === other.fullCtx &&
      this.uniqueAlt === other.uniqueAlt &&
      this.conflictingAlts.equals(other.conflictingAlts) &&
      this.hasSemanticContext === other.hasSemanticContext &&
      this.dipsIntoOuterContext === other.dipsIntoOuterContext;

    return same;
  };

  this.hashCode = function() {
    if (this.isReadonly()) {
      if (this.cachedHashCode === -1) {
        this.cachedHashCode = this.configs.hashCode();
      }

      return this.cachedHashCode;
    }

    return this.configs.hashCode();
  };

  this.size = function() {
    return this.configs.length;
  };

  this.isEmpty = function() {
    return this.configs.length === 0;
  };

  this.contains = function(o) {
    if (this.configLookup === null) {
      throw new Error("UnsupportedOperationException: This method is not implemented for readonly sets.");
    }
    return this.configLookup.contains(o);
  };

  this.clear = function() {
    if (this.readonly) throw new Error("IllegalStateException: This set is readonly");
    this.configs = [];
    this.cachedHashCode = -1;
    this.configLookup.clear();
  };

  this.isReadonly = function() {
    return this.readonly;
  };

  this.setReadonly = function(readonly) {
    this.readonly = readonly;
    this.configLookup = null; // can't mod, no need for lookup cache
  };

  this.toString = function() {
    var buf = new StringBuilder();
    buf.append(this.elements().toString());
    if (this.hasSemanticContext) buf.append(",hasSemanticContext=").append(this.hasSemanticContext);
    if (this.uniqueAlt !== ATN.INVALID_ALT_NUMBER) buf.append(",uniqueAlt=").append(this.uniqueAlt);
    if (this.conflictingAlts !== null) buf.append(",conflictingAlts=").append(this.conflictingAlts);
    if (this.dipsIntoOuterContext) buf.append(",dipsIntoOuterContext");
    return buf.toString();
  };

  this.toArray = function() {
    return this.configLookup.toArray();
  };

};
ATNConfigSet.prototype = new ATNConfigSet.__prototype__();

module.exports = ATNConfigSet;
