var Namespace, exports;

Namespace = (function() {

  function Namespace(parent, name) {
    var _ref;
    this.parent = parent;
    this.name = name;
    console.log("defining namespace " + this.name + ", parent=" + ((_ref = this.parent) != null ? _ref.name : void 0));
  }

  return Namespace;

})();

module.exports = exports = Namespace;
