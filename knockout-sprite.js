// knockout-sprite.js
// Copyright (C) 2015 Digisfera

(function (root, factory) {
  if (typeof module === 'object' && typeof require === 'function') {
    // CommonJS
    module.exports = factory(require('knockout'));
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(['knockout'], function(knockout) {
      return (root.knockoutSprite = factory(knockout));
    });
  } else {
    // Global variable
    root.knockoutSprite = factory(root.ko);
  }
}(this, function(ko) {

  // CSS class and style to adjust sprite size to the parent dimensions.
  var cssClass = '__kosprite';
  var cssStyle = '.' + cssClass + '>*{display:block;width:100%;height:100%;}';

  // Test for SVG support.
  var svg = document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image", "1.1");

  // Parse JSON string or return null on error.
  function parseJSON(str) {
    try {
      return JSON.parse(str);
    } catch (err) {
      return null;
    }
  }

  // Grab a URL and parse as JSON.
  function getUrlAsJSON(url, done) {

    var req = new XMLHttpRequest();
    req.open('get', url);

    req.onerror = function() {
      done(new Error('Network error: ' + url));
    };

    req.onreadystatechange = function() {
      if (req.readyState != 4) {
        return;
      }
      if (req.status != 200) {
        done(new Error('Network error: ' + url));
        return;
      }
      var obj = parseJSON(req.responseText);
      if (!obj) {
        done(new Error('Parse error: ' + url));
        return;
      }
      done(null, obj);
    };

    req.send();

  }

  // Global sprite object.
  // Maps keys to the corresponding PNG data URL or SVG markup.
  var map = {};

  // Get the image with the specified key from the global sprite object.
  function get(key) {
    if (!(key in map)) {
      map[key] = ko.observable('');
    }
    return map[key];
  }

  // Set the image with the specified key into the global sprite object.
  function set(key, val) {
    if (!(key in map)) {
      map[key] = ko.observable('');
    }
    map[key](val);
  }

  // Load a sprite into the global sprite object.
  function load(sprite, done) {
    if (!done) {
      done = function() {};
    }
    var url = svg ? sprite.svg : sprite.png;
    getUrlAsJSON(url, function(err, obj) {
      if (err) {
        done(err);
        return;
      }
      for (var key in obj) {
        var val = obj[key];
        set(key, val);
      }
    });
  }

  // Dump the current global sprite object.
  function dump() {
    return JSON.stringify(map);
  }

  // Set up a DOM element to display an image from the sprite.
  function setupElement(element, valueAccessor) {

    var markup = ko.computed(function() {
      var key = ko.unwrap(valueAccessor());
      var val = get(key);
      if (svg) {
        return val();
      } else {
        return '<img src="' + val() + '">';
      }
    });

    ko.utils.toggleDomNodeCssClass(element, cssClass, true);
    ko.applyBindingAccessorsToNode(element, { html: markup });

  }

  // Inject style for sprite elements.
  var head = document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.setAttribute('type', 'text/css');
  if (style.styleSheet) {
    style.styleSheet.cssText = cssStyle;
  } else {
    style.appendChild(document.createTextNode(cssStyle));
  }
  head.appendChild(style);

  // Register the knockout binding.
  ko.bindingHandlers.sprite = {
    init: setupElement
  };

  // Export the public interface.
  return {
    get: get,
    set: set,
    load: load,
    dump: dump
  };

}));
