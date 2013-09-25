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

var Interval = function(a, b) {
  this.a = a;
  this.b = b;
};

Interval.__prototype__ = function() {

  this.length = function() {
    if (this.b < this.a) return 0;
    return this.b - this.a + 1;
  };

  this.startsBeforeDisjoint = function(other) {
    return this.a < other.a && this.b < other.a;
  };

  this.startsBeforeNonDisjoint = function(other) {
    return this.a <= other.a && this.b >= other.a;
  };

  this.startsAfter = function(other) {
    return this.a > other.a;
  };

  this.startsAfterDisjoint = function(other) {
    return this.a > other.b;
  };

  this.startsAfterNonDisjoint = function(other) {
    return this.a > other.a && this.a <= other.b;
  };

  this.disjoint = function(other) {
    return this.startsBeforeDisjoint(other) || this.startsAfterDisjoint(other);
  };

  this.adjacent = function(other) {
    return this.a === other.b + 1 || this.b === other.a - 1;
  };

  this.properlyContains = function(other) {
    return other.a >= this.a && other.b <= this.b;
  };

  this.union = function(other) {
    return Interval.of(Math.min(this.a, other.a), Math.max(this.b, other.b));
  };

  this.intersection = function(other) {
    return Interval.of(Math.max(this.a, other.a), Math.min(this.b, other.b));
  };

  this.differenceNotProperlyContained = function(other) {
    var diff = null;
    // other.a to left of this.a (or same)
    if (other.startsBeforeNonDisjoint(this)) {
      diff = Interval.of(Math.max(this.a, other.b + 1), this.b);
    }
    // other.a to right of this.a
    else if (other.startsAfterNonDisjoint(this)) {
      diff = Interval.of(this.a, other.a - 1);
    }
    return diff;
  };

  this.toString = function() {
    return this.a + ".." + this.b;
  };

};
Interval.prototype = new Interval.__prototype__();

Interval.INTERVAL_POOL_MAX_VALUE = 1000;
Interval.INVALID = new Interval(-1, -2);
Interval.cache = new Array(Interval.INTERVAL_POOL_MAX_VALUE + 1);

Interval.creates = 0;
Interval.misses = 0;
Interval.hits = 0;
Interval.outOfRange = 0;

Interval.of = function(a, b) {
  if (a !== b || a < 0 || a > Interval.INTERVAL_POOL_MAX_VALUE) {
    return new Interval(a, b);
  }
  if (!Interval.cache[a]) {
    Interval.cache[a] = new Interval(a, a);
  }
  return Interval.cache[a];
};

module.exports = Interval;
