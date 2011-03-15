(function() {
  var Redirector;
  Redirector = {
    init: function(options) {
      if (!options || !options.full || !options.mobile) {
        return false;
      }
      Redirector.meta = {
        'mobile': options.mobile,
        'full': options.full,
        'current': window.location.href,
        'referrer': document.referrer
      };
      return true;
    },
    conditions: function() {
      return screen.width < 700;
    },
    doRedirect: function() {
      return window.location = Redirector.mapURL();
    },
    disableRedirection: function() {
      var date;
      date = new Date();
      date.setTime(date.getTime() + (604800 * 1000));
      document.cookie = "nomob=1; expires=" + (date.toGMTString()) + "; path=/";
      return true;
    },
    enableRedirection: function() {
      var date;
      date = new Date();
      date.setTime(date.getTime() - 1);
      document.cookie = "nomob=0; expires=" + (date.toGMTString()) + "; path=/";
      return true;
    },
    canRedirect: function() {
      return !document.cookie.match(/nomob=1/);
    },
    check: function() {
      if (Redirector.currentVersion() === 'full') {
        if (Redirector.conditions() && Redirector.canRedirect()) {
          if (Redirector.meta.referrer.match(new RegExp("https?://" + Redirector.meta.mobile))) {
            Redirector.disableRedirection();
          } else {
            return Redirector.doRedirect();
          }
        }
      } else if (Redirector.currentVersion() === 'mobile') {
        Redirector.enableRedirection();
      }
      return false;
    },
    currentVersion: function() {
      if (Redirector.meta.current.match(new RegExp("https?://" + Redirector.meta.full))) {
        return 'full';
      }
      if (Redirector.meta.current.match(new RegExp("https?://" + Redirector.meta.mobile))) {
        return 'mobile';
      }
      return null;
    },
    mapURL: function() {
      var baseURL, host, mapping, newPath, path, regexStr, regexp, scheme, _ref;
      scheme = "http://";
      if (Redirector.currentVersion() === 'full') {
        host = Redirector.meta.mobile;
        path = Redirector.meta.current.split("http://" + Redirector.meta.full)[1];
      } else if (Redirector.currentVersion() === 'mobile') {
        host = Redirector.meta.full;
        path = Redirector.meta.current.split("http://" + Redirector.meta.mobile)[1];
      }
      baseURL = "" + scheme + host;
      if (Redirector.routeMap) {
        _ref = Redirector.routeMap;
        for (regexStr in _ref) {
          mapping = _ref[regexStr];
          regexp = new RegExp(regexStr);
          if (path.match(regexp)) {
            newPath = path.replace(regexp, mapping);
            return "" + baseURL + newPath;
          }
        }
      }
      return baseURL;
    }
  };
  window['Redirector'] = Redirector;
  Redirector['init'] = Redirector.init;
  Redirector['check'] = Redirector.check;
  Redirector['conditions'] = Redirector.conditions;
  Redirector['routeMap'] = Redirector.routeMap;
}).call(this);
