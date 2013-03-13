var Invocation, Namespace, Role, Task, namespace, namespaces, role, run, runTask, server, task,
  __slice = [].slice;

Namespace = require("./namespace");

Task = require("./task");

Role = require("./role");

Invocation = require("./invocation");

namespaces = [];

exports.namespace = namespace = function(name, fn) {
  var ns;
  ns = new Namespace(namespaces[0], name);
  namespaces.unshift(ns);
  fn.call(ns);
  namespaces.shift();
  return ns;
};

exports.task = task = function(name, opts, fn) {
  var t;
  if (typeof opts === "function") {
    fn = opts;
    opts = null;
  }
  t = new Task(namespaces[0], name, opts);
  namespaces.unshift(t);
  fn.call(t);
  namespaces.shift();
  return t;
};

exports.run = run = function(command, opts, cb) {
  return namespaces[0].addInvocation(new Invocation(command, opts, cb));
};

exports.server = server = function() {
  var roles, server;
  server = arguments[0], roles = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  return roles.forEach(function(role) {
    return Role.getRole(role).addServer(server);
  });
};

exports.role = role = function() {
  var role, servers;
  role = arguments[0], servers = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  role = Role.getRole(role);
  return servers.forEach(function(server) {
    return role.addServer(server);
  });
};

exports.runTask = runTask = function(taskName) {
  task = taskName.split(":").reduce((function(obj, el) {
    return obj != null ? obj[el] : void 0;
  }), Task.tasks);
  if (task) {
    return task.run();
  }
};

role("app", "doppler.io", "bugsnag.com");

namespace("deploy", function() {
  return task("herp", {
    roles: ["app"]
  }, function() {
    run("pwd");
    run("hostname");
    return run("whoami");
  });
});

runTask("deploy:herp");
