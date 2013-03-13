var Role, exports;

Role = (function() {

  Role._roles = {};

  Role.getRole = function(name) {
    var _base;
    return (_base = this._roles)[name] || (_base[name] = new Role(name));
  };

  Role.getRoles = function(names) {
    var name, _i, _len, _results;
    if (!names) {
      return [];
    }
    _results = [];
    for (_i = 0, _len = names.length; _i < _len; _i++) {
      name = names[_i];
      _results.push(this._roles[name]);
    }
    return _results;
  };

  function Role(name) {
    this.name = name;
    console.log("created new role " + this.name);
    this._servers = [];
  }

  Role.prototype.addServer = function(server) {
    console.log("added server " + server + " to role " + this.name);
    return this._servers.push(server);
  };

  Role.prototype.getServers = function() {
    return this._servers;
  };

  return Role;

})();

module.exports = exports = Role;
