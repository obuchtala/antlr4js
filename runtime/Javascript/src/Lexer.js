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
var IntegerStack = require("./misc/IntegerStack");
var Interval = require("./misc/Interval");
var Pair = require("./misc/Pair");
var Token = require("./Token");
var CommonTokenFactory = require("./CommonTokenFactory");
var IntStream = require("./IntStream");

var Lexer = function(input) {

  // public CharStream _input;
  this._input = input;
  // protected Pair<TokenSource, CharStream> _tokenFactorySourcePair;
  // this._tokenFactorySourcePair = new Pair<TokenSource, CharStream>(this, input);
  this._tokenFactorySourcePair = new Pair(this, input);
  // protected TokenFactory<?> _factory = CommonTokenFactory.DEFAULT;
  this._factory = CommonTokenFactory.DEFAULT;
  // public Token _token;
  this._token = null;
  // public int _tokenStartCharIndex = -1;
  this._tokenStartCharIndex = -1;
  // public int _tokenStartLine;
  this._tokenStartLine = 0;
  // public int _tokenStartCharPositionInLine;
  this._tokenStartCharPositionInLine = 0;
  // public boolean _hitEOF;
  this._hitEOF = false;
  // public int _channel;
  this._channel = 0;
  // public int _type;
  this._type = 0;
  // public final IntegerStack _modeStack = new IntegerStack();
  this._modeStack = new IntegerStack();
  // public int _mode = Lexer.DEFAULT_MODE;
  this._mode = Lexer.DEFAULT_MODE;
  // public String _text;
  this._text = null;

};

Lexer.__prototype__ = function() {

  this.reset = function() {
    var _input = this._input;

    // wack Lexer state variables
    if (_input !== null) {
      _input.seek(0); // rewind the input
    }
    this._token = null;
    this._type = Token.INVALID_TYPE;
    this._channel = Token.DEFAULT_CHANNEL;
    this._tokenStartCharIndex = -1;
    this._tokenStartCharPositionInLine = -1;
    this._tokenStartLine = -1;
    this._text = null;

    this._hitEOF = false;
    this._mode = Lexer.DEFAULT_MODE;
    this._modeStack.clear();

    this.getInterpreter().reset();
  };

  this.nextToken = function() {

    if (this._input === null) {
      throw new Error("nextToken requires a non-null input stream.");
    }

    // Mark start location in char stream so unbuffered streams are
    // guaranteed at least have text of current token
    var tokenStartMarker = this._input.mark();
    try {
      outer: while (true) {
        if (this._hitEOF) {
          this.emitEOF();
          return this._token;
        }

        this._token = null;
        this._channel = Token.DEFAULT_CHANNEL;
        this._tokenStartCharIndex = this._input.index();
        this._tokenStartCharPositionInLine = this.getInterpreter().getCharPositionInLine();
        this._tokenStartLine = this.getInterpreter().getLine();
        this._text = null;
        do {
          this._type = Token.INVALID_TYPE;
          var ttype;
          try {
            ttype = this.getInterpreter().match(this._input, this._mode);
          } catch (err) {
            this.notifyListeners(err); // report error
            this.recover(err);
            ttype = Lexer.SKIP;
          }
          if (this._input.LA(1) === IntStream.EOF) {
            this._hitEOF = true;
          }
          if (this._type === Token.INVALID_TYPE) this._type = ttype;
          if (this._type === Lexer.SKIP) {
            continue outer;
          }
        } while (this._type === Lexer.MORE);
        if (this._token === null) this.emit();
        return this._token;
      }
    } finally {
      this._input.release(tokenStartMarker);
    }
  };

  this.skip = function() {
    this._type = Lexer.SKIP;
  };

  this.more = function() {
    this._type = Lexer.MORE;
  };

  this.mode = function(m) {
    this._mode = m;
  };

  this.pushMode = function(m) {
    this._modeStack.push(this._mode);
    this.mode(m);
  };

  this.popMode = function() {
    if (this._modeStack.isEmpty()) throw new Error("Empty Stack.");
    this.mode(this._modeStack.pop());
    return this._mode;
  };

  this.setTokenFactory = function(factory) {
    this._factory = factory;
  };

  this.getTokenFactory = function() {
    return this._factory;
  };

  this.setInputStream = function(input) {
    this._input = null;
    this._tokenFactorySourcePair = new Pair(this, this._input);
    this.reset();
    this._input = input;
    this._tokenFactorySourcePair = new Pair(this, this._input);
  };

  this.getSourceName = function() {
    return this._input.getSourceName();
  };

  this.getInputStream = function() {
    return this._input;
  };

  this.emit = function(token) {
    if (arguments.length === 0) {
      token = this._factory.create(this._tokenFactorySourcePair, this._type,
        this._text, this._channel, this._tokenStartCharIndex, this.getCharIndex() - 1,
        this._tokenStartLine, this._tokenStartCharPositionInLine);
    }
    this._token = token;
    return token;
  };

  this.emitEOF = function() {
    var cpos = this.getCharPositionInLine();
    if (this._token !== null) {
      var n = this._token.getStopIndex() - this._token.getStartIndex() + 1;
      cpos = this._token.getCharPositionInLine() + n;
    }
    var eof = this._factory.create(this._tokenFactorySourcePair, Token.EOF, null, Token.DEFAULT_CHANNEL,
      this._input.index(), this._input.index() - 1, this.getLine(), cpos);

    return this.emit(eof);
  };

  this.getLine = function() {
    return this.getInterpreter().getLine();
  };

  this.getCharPositionInLine = function() {
    return this.getInterpreter().getCharPositionInLine();
  };

  this.setLine = function(line) {
    this.getInterpreter().setLine(line);
  };

  this.setCharPositionInLine = function(charPositionInLine) {
    this.getInterpreter().setCharPositionInLine(charPositionInLine);
  };

  this.getCharIndex = function() {
    return this._input.index();
  };

  this.getText = function() {
    if (this._text !== null) {
      return this._text;
    }
    return this.getInterpreter().getText(this._input);
  };

  this.setText = function(text) {
    this._text = text;
  };

  this.getToken = function() {
    return this._token;
  };

  this.setToken = function(token) {
    this._token = token;
  };

  this.getType = function() {
    return this._type;
  };

  this.setType = function(type) {
    this._type = type;
  };

  this.getChannel = function() {
    return this._channel;
  };

  this.setChannel = function(channel) {
    this._channel = channel;
  };

  this.getModeNames = function() {
    return null;
  };

  this.getTokenNames = function() {
    return null;
  };

  this.getAllTokens = function() {
    var tokens = [];
    var t = this.nextToken();
    while (t.getType() !== Token.EOF) {
      tokens.push(t);
      t = this.nextToken();
    }
    return tokens;
  };

  this.recover = function() {
    if (this._input.LA(1) !== IntStream.EOF) {
      this.getInterpreter().consume(this._input);
    }
  };

  this.notifyListeners = function(err) {
    var text = this._input.getText(Interval.of(this._tokenStartCharIndex, this._input.index()));
    var msg = "token recognition error at: '" + this.getErrorDisplay(text) + "'";

    var listener = this.getErrorListenerDispatch();
    listener.syntaxError(this, null, this._tokenStartLine, this._tokenStartCharPositionInLine, msg, err);
  };

  this.getErrorDisplay = function(s) {
    if (_.isString(s)) {
      var buf = [];
      var chars = s.toCharArray();
      for (var i = 0; i < chars.length; i++) {
        buf.push(this.getCharErrorDisplay(chars[i]));
      }
      return buf.join("");
    } else if (_.isNumber(s)) {
      this.getCharErrorDisplay(s);
    }
  };

  this.getCharErrorDisplay = function(c) {
    var s = "<?>";
    switch (c) {
      case Token.EOF:
        s = "<EOF>";
        break;
      case '\n':
        s = "\\n";
        break;
      case '\t':
        s = "\\t";
        break;
      case '\r':
        s = "\\r";
        break;
    }
    return s;
  };

  this.recover = function() {
    this._input.consume();
  };

};
Lexer.__prototype__.prototype = Recognizer.prototype;
Lexer.prototype = new Lexer.__prototype__();

Lexer.DEFAULT_MODE = 0;
Lexer.MORE = -2;
Lexer.SKIP = -3;

Lexer.DEFAULT_TOKEN_CHANNEL = Token.DEFAULT_CHANNEL;
Lexer.HIDDEN = Token.HIDDEN_CHANNEL;
Lexer.MIN_CHAR_VALUE = '\u0000';
Lexer.MAX_CHAR_VALUE = '\uFFFE';

module.exports = Lexer;
