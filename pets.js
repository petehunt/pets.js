(function() {
  // LOL, this is a great idea!

  function NOT_READY_YET() {
    throw new Error('You are an idiot.');
  };

  function CallMeMaybe() {
  };

  function Manager() {
    this.cache = {}; // never reset this you idiot
  };

  Manager.prototype.run = function(body) {
    this.body = body;
    this.retry();
  };

  Manager.prototype.callback = function() {
    var id = this.callbackCounter++;
    var invokeID = this.invokeCounter;

    return function() {
      var value = Array.prototype.slice.call(arguments);
      if (value.length === 1) {
        // right call?
        value = value[0];
      }
      if (!this.cache[invokeID] || this.cache[invokeID][id] !== NOT_READY_YET) {
        throw new Error(JSON.stringify(['Oh shit: ', invokeID, id, this.cache]));
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

  Manager.prototype.invokeMany = function(calls) {
    var id = this.invokeCounter++;
    //var args = Array.prototype.slice.call(arguments).slice(1);
    if (this.cache[id]) {
      return this.cache[id];
    }
    this.cache[id] = [];
    for (var i = 0; i < this.callbackCounter; i++) {
      this.cache[id].push(NOT_READY_YET);
    }
    this.callbackCounter = 0;
    // Now invoke the fetches and bail out
    for (var i = 0; i < calls.length; i++) {
      var func = calls[0];
      var args = calls.slice(1);
      func.apply(null, args);
    }
    throw new CallMeMaybe();
  };

  Manager.prototype.invoke = function(func) {
    var args = Array.prototype.slice.call(arguments).slice(1);
    return this.invokeMany([func].concat(args))[0];
  };

  Manager.prototype.retry = function() {
    this.callbackCounter = 0;
    this.invokeCounter = 0;
    try {
      this.body();
    } catch (e) {
      if (!(e instanceof CallMeMaybe)) {
        throw(e);
      }
    }
  };

  this.Manager = Manager;
}).bind(this)();

// test

function magic(v, cb) {
  setTimeout(function() { cb(v); }, 0);
};

var manager = new this.Manager();
manager.run(function() {
  var x = manager.invoke(magic, 10, manager.callback());
  console.log('got', x);
});