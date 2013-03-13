var ConnectionManager, exports, ssh;

ssh = require("./ssh");

ConnectionManager = (function() {

  function ConnectionManager() {}

  ConnectionManager._connections = {};

  ConnectionManager.getConnection = function(host) {
    if (!this._connections[host]) {
      this._connections[host] = new ssh.Client(host, {
        port: 9022
      });
      this._connections[host].connect();
    }
    return this._connections[host];
  };

  ConnectionManager.closeConnections = function() {
    var c, host, _ref, _results;
    _ref = this._connections;
    _results = [];
    for (host in _ref) {
      c = _ref[host];
      _results.push(c.close());
    }
    return _results;
  };

  return ConnectionManager;

})();

module.exports = exports = ConnectionManager;
