Pet = (function() {
  // LOL, this is a great idea!

  function NOT_READY_YET() {
    throw new Error('You are an idiot.');
  };

  function CallMeMaybe() {
  };

  function Pet() {
    this.cache = {}; // never reset this you idiot
  };

  Pet.prototype.run = function(body, cb, eb) {
    if (this.body) {
      throw new Error('Pet already running');
    }
    this.body = body;
    this.cb = cb;
    this.eb = eb
    this.retry();
  };

  Pet.prototype.callback = function() {
    var id = this.callbackCounter++;
    var invokeID = this.invokeCounter;

    return function() {
      var value = Array.prototype.slice.call(arguments);
      if (value.length === 1) {
        // right call?
        value = value[0];
      }
      if (!this.cache[invokeID] || this.cache[invokeID][id] !== NOT_READY_YET) {
        throw new Error('Error during invoke: ' + invokeID + ' for callback '+ id + '. This should not happen.');
      }
      this.cache[invokeID][id] = value;
      // Check if this step is done, if it is then retry!
      for (var key in this.cache[invokeID]) {
        if (!this.cache[invokeID].hasOwnProperty(key)) {
          continue;
        }
        if (this.cache[invokeID][key] === NOT_READY_YET) {
          return;
        }
      }
      // if we get here we're done!
      this.retry();
    }.bind(this);
  };

  Pet.prototype.invokeMany = function(calls) {
    var id = this.invokeCounter++;
    var totalCallbacks = this.callbackCounter;
    this.callbackCounter = 0;
    if (this.cache[id]) {
      return this.cache[id];
    }
    this.cache[id] = [];
    for (var i = 0; i < totalCallbacks; i++) {
      this.cache[id].push(NOT_READY_YET);
    }
    // Now invoke the fetches and bail out
    for (var i = 0; i < calls.length; i++) {
      var call = calls[i];
      var func = call[0];
      var args = call.slice(1);
      func.apply(null, args);
    }
    throw new CallMeMaybe();
  };

  Pet.prototype.invoke = function(func) {
    var args = Array.prototype.slice.call(arguments).slice(1);
    return this.invokeMany([[func].concat(args)])[0];
  };

  Pet.prototype.retry = function() {
    this.callbackCounter = 0;
    this.invokeCounter = 0;
    try {
      var result = this.body();
      if (this.cb) {
        this.cb(result);
      }
    } catch (e) {
      if (!(e instanceof CallMeMaybe)) {
        throw(e);
      }
      if (this.eb) {
        this.eb(e);
      }
    }
  };

  return Pet;
})();