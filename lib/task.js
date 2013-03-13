var ConnectionManager, Namespace, Role, Task, async, exports,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

async = require("async");

Namespace = require("./namespace");

Role = require("./role");

ConnectionManager = require("./connection_manager");

Task = (function(_super) {

  __extends(Task, _super);

  Task.tasks = {};

  function Task(parent, name, opts) {
    var _ref;
    this.parent = parent;
    this.name = name;
    this.opts = opts;
    this.invocations = [];
    console.log("defining task " + this.name + ", parent=" + ((_ref = this.parent) != null ? _ref.name : void 0));
  }

  Task.prototype.addInvocation = function(action) {
    var container, idx, parent, s, stack, _i, _len, _name, _results;
    console.log("defining a 'run' action, parent=" + this.name);
    this.invocations.push(action);
    stack = [this];
    parent = this.parent;
    while (parent) {
      stack.unshift(parent);
      parent = parent.parent;
    }
    container = this.constructor.tasks;
    _results = [];
    for (idx = _i = 0, _len = stack.length; _i < _len; idx = ++_i) {
      s = stack[idx];
      if (idx === stack.length - 1) {
        _results.push(container[s.name] = s);
      } else {
        _results.push(container = container[_name = s.name] || (container[_name] = {}));
      }
    }
    return _results;
  };

  Task.prototype.run = function() {
    var hostTasks, matchingRoles, matchingServers, _ref,
      _this = this;
    console.log("running task " + this.name);
    matchingRoles = Role.getRoles((_ref = this.opts) != null ? _ref.roles : void 0);
    matchingServers = matchingRoles.reduce(function(servers, role) {
      return servers.concat(role.getServers());
    }, []);
    hostTasks = matchingServers.map(function(host) {
      return function(callback) {
        return _this.invocations.forEach(function(inv) {
          return ConnectionManager.getConnection(host).runCommand(inv.command).out(function(data) {
            return console.log("**  [out " + host + "] " + data);
          }).err(function(data) {
            return console.log("*** [err " + host + "] " + data);
          }).done(function(returnCode, time) {
            console.log("    command finished in " + time + "ms");
            return callback();
          });
        });
      };
    });
    async.parallel(hostTasks, function() {
      return console.log("Finished executing task \"" + _this.name + "\" on servers " + matchingServers + "\n");
    });
    return this.invocations.forEach(function(i) {
      if (i.opts) {
        return console.log("- invocation " + i.command + ", " + i.opts.roles);
      }
    });
  };

  return Task;

})(Namespace);

module.exports = exports = Task;
