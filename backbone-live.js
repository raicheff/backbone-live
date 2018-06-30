/*
 * Backbone.Live
 *
 * Copyright (C) 2016 Boris Raicheff
 * All rights reserved
 */

(function(global, factory) {

  if (typeof exports === "object") {
    module.exports = factory(require("underscore"), require("backbone"));
  } else if (typeof define === "function" && define.amd) {
    define(["underscore", "backbone"], factory);
  } else {
    factory(global._, global.Backbone);
  }

})(this, function(_, Backbone) {

  "use strict";

  var LiveCollection = {

    onChannelMessage: function(message) {

      if (this._type !== message.resource)
        return;

      console.info("[!]", this._type, message);

      switch (message.event) {
        case "create":
        case "update":
          if (_(message).has("id")) {
            var model = new this.model({ id: message.id });
            model.fetch().done(function() { this.add(model, { merge: true }); }.bind(this));
          } else {
            this.fetch();
          }
          break;
        case "delete":
          this.remove(message.id);
          break;
        default:
          break;
      }

    }

  };

  var Live = Backbone.Live = {

    register: function(object, type) {

      if (!(object instanceof Backbone.Collection || object instanceof Backbone.Model)) {
        throw new Error("The host object is undefined or not an object.");
      }

      if (object instanceof Backbone.Collection) {
        _.extend(object, { _type: type }, LiveCollection);
        object.model.prototype.urlRoot = object.model.prototype.urlRoot || object.url;
      }

      object.listenTo(Backbone, {
        "push": object.onChannelMessage
      });

    }

  };

  _.extend(Live, Backbone.Events);

});

/* EOF */
