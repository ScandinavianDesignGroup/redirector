Redirector =
  init : (options) ->
    if !options or !options.full or !options.mobile
      return false
    Redirector.meta =
      'mobile'  : options.mobile
      'full'    : options.full
      'current' : window.location.href
      'referrer': document.referrer
    true

  # Default mobile redirection condition.
  # Override this to change conditions
  conditions : () ->
    screen.width < 700

  doRedirect : () ->
    window.location = Redirector.mapURL()

  # Set a cookie to stop from redirecting
  disableRedirection : () ->
    date = new Date()
    date.setTime(date.getTime() + (604800 * 1000))
    document.cookie = "nomob=1; expires=#{date.toGMTString()}; path=/"
    return true

  # Remove the cookie so we can redirect again
  enableRedirection : ()->
    date = new Date()
    date.setTime(date.getTime() - 1)
    document.cookie = "nomob=0; expires=#{date.toGMTString()}; path=/"
    return true

  # Check if redirects are enabled
  canRedirect : () ->
    !document.cookie.match(/nomob=1/)

  check : ()->
    if Redirector.currentVersion() is 'full'
      # We are on full site
      if Redirector.conditions() && Redirector.canRedirect()
        if(Redirector.meta.referrer.match(new RegExp("https?://" + (Redirector.meta.mobile))))
          # Came from mobile, dont redirect
          Redirector.disableRedirection()
        else
          return Redirector.doRedirect()
    else if Redirector.currentVersion() is 'mobile'
      Redirector.enableRedirection()
    return false

  currentVersion : ()->
    if Redirector.meta.current.match(new RegExp("https?://" + (Redirector.meta.full)))
      return 'full'
    if Redirector.meta.current.match(new RegExp("https?://" + (Redirector.meta.mobile)))
      return 'mobile'
    return null

  mapURL : () ->
    scheme = "http://"
    if Redirector.currentVersion() is 'full'
      host = Redirector.meta.mobile
      path = Redirector.meta.current.split("http://#{Redirector.meta.full}")[1]
    else if Redirector.currentVersion() is 'mobile'
      host = Redirector.meta.full
      path = Redirector.meta.current.split("http://#{Redirector.meta.mobile}")[1]
    
    baseURL = "#{scheme}#{host}"

    if Redirector.routeMap
      for regexStr, mapping of Redirector.routeMap
        regexp = new RegExp(regexStr)
        if path.match regexp
          newPath = path.replace(regexp, mapping)
          return "#{baseURL}#{newPath}"
    return baseURL

window['Redirector'] = Redirector
Redirector['init'] = Redirector.init
Redirector['check'] = Redirector.check
Redirector['conditions'] = Redirector.conditions
Redirector['routeMap'] = Redirector.routeMap
