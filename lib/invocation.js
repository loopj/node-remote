var Invocation, exports;

Invocation = (function() {

  function Invocation(command, opts, cb) {
    this.command = command;
    this.opts = opts;
    this.cb = cb;
  }

  return Invocation;

})();

module.exports = exports = Invocation;
