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

var HashMap = function() {
  this._buckets = {};
  this._size = 0;

  // if you want to use a custom hashCode/equals
  this._hashCode = null;
  this._equals = null;
};

HashMap.__prototype__ = function() {

  this.size = function() {
    return this._size;
  };

  this.clear = function() {
    this._buckets = {};
    this._size = 0;
  };

  this.put = function(key, value) {
    var hashCode = this._hashCode || key.hashCode;
    var equals = this._equals || key.equals;

    if (hashCode === undefined || equals === undefined) {
      throw new Error("Keys must provide hashCode and equals functions (as with Java HashMap).");
    }

    var hash = hashCode.call(key);
    var bucket = this._buckets[hash];
    if (bucket === undefined) {
      bucket = [];
      this._buckets[hash] = bucket;
    }

    var oldValue = null;
    for (var i = bucket.length - 1; i >= 0; i--) {
      if (equals.call(key, bucket[i][0])) {
        oldValue = bucket[i][1];
        bucket[i][1] = value;
        break;
      }
    }

    if (oldValue === null) {
      bucket.push([key, value]);
      this._size++;
    }

    return oldValue;
  };

  this.get = function(key) {
    var hashCode = this._hashCode || key.hashCode;
    var equals = this._equals || key.equals;

    if (hashCode === undefined || equals === undefined) {
      throw new Error("Keys must provide hashCode and equals functions (as with Java HashMap).");
    }

    var hash = hashCode.call(key);
    var bucket = this._buckets[hash];
    if (bucket === undefined) {
      return null;
    }

    for (var i = bucket.length - 1; i >= 0; i--) {
      if (equals.call(key, bucket[i][0])) {
        return bucket[i][1];
      }
    }

    return null;
  };

  this.keys = function() {
    var keys = [];
    _.each(this._buckets, function(bucket) {
      for (var i = bucket.length - 1; i >= 0; i--) {
        keys.push(bucket[i][0]);
      }
    });
  };

  this.values = function() {
    var values = [];
    _.each(this._buckets, function(bucket) {
      for (var i = bucket.length - 1; i >= 0; i--) {
        values.push(bucket[i][1]);
      }
    });
  };

  this.entries = function() {
    var entries = [];
    _.each(this._buckets, function(bucket) {
      for (var i = bucket.length - 1; i >= 0; i--) {
        entries.push(bucket[i]);
      }
    });
  };

  this.forEach = function(iterator, ctxt) {
    _.each(this._buckets, function(bucket) {
      for (var i = bucket.length - 1; i >= 0; i--) {
        iterator.call(ctxt, bucket[i]);
      }
    });
  };
};
HashMap.prototype = new HashMap.__prototype__();

HashMap.create = function(hashCode, equals) {
  var map = new HashMap();
  map._hashCode = hashCode;
  map._equals = equals;
  return map;
};

module.exports = HashMap;
