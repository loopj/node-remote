var NodeRemote, async, color, commands, r, ssh,
  _this = this;

ssh = require("./ssh");

async = require("async");

color = require("ansi-color").set;

NodeRemote = (function() {

  function NodeRemote() {
    this._connections = {};
  }

  NodeRemote.prototype.getConnection = function(host) {
    if (!this._connections[host]) {
      this._connections[host] = new ssh.Client(host, {
        port: 9022
      });
      this._connections[host].connect();
    }
    return this._connections[host];
  };

  NodeRemote.prototype.closeConnections = function() {
    var c, host, _ref, _results;
    _ref = this._connections;
    _results = [];
    for (host in _ref) {
      c = _ref[host];
      _results.push(c.close());
    }
    return _results;
  };

  NodeRemote.prototype.hostsForTask = function(options) {
    return ["doppler.io", "bugsnag.com"];
  };

  NodeRemote.prototype.run = function(command, options, cb) {
    var hostTasks, hosts,
      _this = this;
    hosts = this.hostsForTask(options);
    console.log(color("Executing \"" + command + "\" on servers [" + (hosts.join(", ")) + "]", "green"));
    hostTasks = hosts.map(function(host) {
      return function(callback) {
        return _this.getConnection(host).runCommand(command).out(function(data) {
          return console.log("**  [out " + host + "] " + data);
        }).err(function(data) {
          return console.log("*** [err " + host + "] " + data);
        }).done(function(returnCode, time) {
          console.log("    command finished in " + time + "ms");
          return callback();
        });
      };
    });
    return async.parallel(hostTasks, function() {
      console.log("Finished executing \"" + command + "\" on servers " + hosts + "\n");
      return cb();
    });
  };

  return NodeRemote;

})();

commands = ["whoami", "hostname", "ls"];

r = new NodeRemote();

async.series(commands.map(function(c) {
  return function(callback) {
    return r.run(c, {}, function() {
      return callback();
    });
  };
}), function() {
  console.log(color("✓ all commands were run", "green"));
  return r.closeConnections();
});
