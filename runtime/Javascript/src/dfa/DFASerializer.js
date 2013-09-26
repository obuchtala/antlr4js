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

var Arrays = require("../misc/Arrays");

var DFASerializer = function(dfa, tokenNames) {
	this.dfa = dfa;
	this.tokenNames = tokenNames;
};

DFASerializer.__prototype__ = function() {

	this.toString = function() {
		if (this.dfa.s0 === null) return null;
		var buf = [];
		var states = this.dfa.getStates();
		var s, n, t;
		for (var idx = 0; idx < states.length; idx++) {
			s = states[idx];
			n = 0;
			if (s.edges !== null) n = s.edges.length;
			for (var i = 0; i < n; i++) {
				t = s.edges[i];
				if (t !== null && t.stateNumber !== Number.MAX_VALUE) {
					buf.push(this.getStateString(s));
					var label = this.getEdgeLabel(i);
					buf.push("-", label, "->", this.getStateString(t), '\n');
				}
			}
		}

		var output = buf.join("");
		if (output.length === 0) return null;

		return output;
	};

	this.getEdgeLabel = function(i) {
		var label;
		if (i === 0) return "EOF";
		if (this.tokenNames !== null) label = this.tokenNames[i - 1];
		// TODO: is this correct?
		// originally: else label = String.valueOf(i-1);
		else label = "" + i - 1;
		return label;
	};

	this.getStateString = function(s) {
		var n = s.stateNumber;
		var baseStateStr = [(s.isAcceptState ? ":" : ""), "s", n, (s.requiresFullContext ? "^" : "")].join("");
		if (s.isAcceptState) {
			if (s.predicates !== null) {
				return baseStateStr + "=>" + Arrays.toString(s.predicates);
			} else {
				return baseStateStr + "=>" + s.prediction;
			}
		} else {
			return baseStateStr;
		}
	};
};
DFASerializer.prototype = new DFASerializer.__prototype__();

module.exports = DFASerializer;
