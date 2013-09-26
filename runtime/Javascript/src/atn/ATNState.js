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

var ATNState = function () {
  this.atn = null;
	this.stateNumber = ATNState.INVALID_STATE_NUMBER;
	this.ruleIndex = 0; // at runtime, we don't have Rule objects
	this.epsilonOnlyTransitions = false;
	this.transitions = [];
  this.nextTokenWithinRule = null;
};

ATNState.__prototype__ = function() {

	this.hashCode = function() {
		return this.stateNumber;
	};

	this.equals = function(o) {
		if ( o instanceof ATNState ) return this.stateNumber === o.stateNumber;
		return false;
	};

	this.isNonGreedyExitState = function() {
		return false;
	};

	this.toString = function() {
		return ""+this.stateNumber;
	};

	this.getTransitions = function() {
		return _.clone(this.transitions);
	};

	this.getNumberOfTransitions = function() {
		return this.transitions.length;
	};

	this.addTransition = function(e) {
		this.addTransition(this.transitions.length, e);
	};

	this.addTransition = function(index, e) {
		if (this.transitions.length === 0) {
			this.epsilonOnlyTransitions = e.isEpsilon();
		}
		else if (this.epsilonOnlyTransitions !== e.isEpsilon()) {
			console.error("ATN state ", this.stateNumber, " has both epsilon and non-epsilon transitions.");
			this.epsilonOnlyTransitions = false;
		}

		this.transitions[index] = e;
	};

	this.transition = function(i) {
		return this.transitions[i];
	};

	this.setTransition = function(i, e) {
		this.transitions[i] = e;
	};

	this.removeTransition = function(index) {
		var old = this.transitions[index];
		this.transitions.splice(index, 1);
		return old;
	};

	this.getStateType = function() {
		throw new Error("Abstract.");
	};

	this.onlyHasEpsilonTransitions = function() {
		return this.epsilonOnlyTransitions;
	};

	this.setRuleIndex = function(ruleIndex) {
		this.ruleIndex = ruleIndex;
	};

};
ATNState.prototype = new ATNState.__prototype__();

ATNState.INITIAL_NUM_TRANSITIONS = 4;

ATNState.INVALID_TYPE = 0;
ATNState.BASIC = 1;
ATNState.RULE_START = 2;
ATNState.BLOCK_START = 3;
ATNState.PLUS_BLOCK_START = 4;
ATNState.STAR_BLOCK_START = 5;
ATNState.TOKEN_START = 6;
ATNState.RULE_STOP = 7;
ATNState.BLOCK_END = 8;
ATNState.STAR_LOOP_BACK = 9;
ATNState.STAR_LOOP_ENTRY = 10;
ATNState.PLUS_LOOP_BACK = 11;
ATNState.LOOP_END = 12;

ATNState.serializationNames = [
			"INVALID",
			"BASIC",
			"RULE_START",
			"BLOCK_START",
			"PLUS_BLOCK_START",
			"STAR_BLOCK_START",
			"TOKEN_START",
			"RULE_STOP",
			"BLOCK_END",
			"STAR_LOOP_BACK",
			"STAR_LOOP_ENTRY",
			"PLUS_LOOP_BACK",
			"LOOP_END"
];

ATNState.INVALID_STATE_NUMBER = -1;

module.exports = ATNState;
