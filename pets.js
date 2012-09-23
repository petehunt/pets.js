Manager = (function() {
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
    if (this.body) {
      throw new Error('Manager already running');
    }
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

  Manager.prototype.invokeMany = function(calls) {
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

  Manager.prototype.invoke = function(func) {
    var args = Array.prototype.slice.call(arguments).slice(1);
    return this.invokeMany([[func].concat(args)])[0];
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

  return Manager;
})();

// test

function simulate_fetch(v, cb) {
  console.log('simulate_fetch called for', v);
  setTimeout(function() { cb(v); }, 0);
};

var manager = new Manager();
manager.run(function() {
  var x = manager.invokeMany([
    [simulate_fetch, 10, manager.callback()],
    [simulate_fetch, 11, manager.callback()]
  ]);
  // lol, dood, you can branch and loop and shit without giving a crap!!!
  if (x[0] + x[1] == 21) {
    console.log('good branch', manager.invoke(simulate_fetch, 'hello world', manager.callback()));
  } else {
    console.log('bad branch', manager.invoke(simulate_fetch, 'bye world', manager.callback()));
  }
});