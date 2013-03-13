var Client, Command, exports, spawn;

spawn = require("child_process").spawn;

Command = (function() {
  var cleanData;

  Command.commandCount = 0;

  cleanData = function(data) {
    return data.toString().replace(/\n$/, "");
  };

  function Command(connection, command) {
    this.connection = connection;
    this.command = command;
    this.id = this.constructor.commandCount++;
    this._outListeners = [];
    this._errListeners = [];
  }

  Command.prototype.doneString = function() {
    return "--DONE-" + this.id + "-$?--";
  };

  Command.prototype.doneStringPattern = function() {
    return new RegExp("--DONE-" + this.id + "-([0-9]+)--$");
  };

  Command.prototype.run = function() {
    this._startTime = new Date().getTime();
    this.connection.ssh.stdin.write(this.command + ("; echo \"" + (this.doneString()) + "\"\n"));
    return this;
  };

  Command.prototype.out = function(cb) {
    var _this = this;
    this.connection.ssh.stdout.on("data", function(data) {
      _this._outListeners.push(arguments.callee);
      return cleanData(data).split("\n").forEach(function(line) {
        if (!line.match(_this.doneStringPattern())) {
          return cb(line);
        }
      });
    });
    return this;
  };

  Command.prototype.err = function(cb) {
    var _this = this;
    this.connection.ssh.stderr.on("data", function(data) {
      _this._errListeners.push(arguments.callee);
      return cleanData(data).split("\n").forEach(function(line) {
        return cb(line);
      });
    });
    return this;
  };

  Command.prototype.done = function(cb) {
    var _this = this;
    this.connection.ssh.stdout.on("data", function(data) {
      var match;
      match = cleanData(data).match(_this.doneStringPattern());
      if (match) {
        while (_this._outListeners.length > 0) {
          _this.connection.ssh.stdout.removeListener("data", _this._outListeners.pop());
        }
        while (_this._errListeners.length > 0) {
          _this.connection.ssh.stderr.removeListener("data", _this._errListeners.pop());
        }
        _this.connection.ssh.stdout.removeListener("data", arguments.callee);
        return typeof cb === "function" ? cb(match[1], new Date().getTime() - _this._startTime) : void 0;
      }
    });
    return this;
  };

  return Command;

})();

Client = (function() {

  Client.clientCount = 0;

  function Client(host, opts) {
    this.host = host;
    this.opts = opts;
    this.id = this.constructor.clientCount++;
  }

  Client.prototype.buildSSHCommand = function() {
    var flags, host;
    host = this.host;
    if (this.opts.user) {
      host = this.opts.user + "@" + host;
    }
    flags = "";
    if (this.opts.port) {
      flags += "-p " + this.opts.port;
    }
    return [flags, host];
  };

  Client.prototype.connect = function() {
    var params;
    params = this.buildSSHCommand();
    params.push("sh");
    return this.ssh = spawn("ssh", params);
  };

  Client.prototype.close = function() {
    return this.ssh.stdin.end();
  };

  Client.prototype.runCommand = function(command, done) {
    command = new Command(this, command);
    return command.run();
  };

  return Client;

})();

exports = module.exports = {
  Client: Client,
  Command: Command
};
