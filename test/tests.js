// stubs
Redirector.redirect = function() {};
Redirector.enableRedirection();

var options = { 'full' : 'example.com', 'mobile' : 'm.example.com'};

module("Globals");

test('Environment is good',function(){
  expect(3);
  ok( !!window.Redirector, 'Could not find Redirector global');
  ok( !!window.Redirector.init, 'Could not find Redirector init function');
  ok( !!window.Redirector.check, 'Could not find Redirector check function');
});

module('Initialization');
test('Redirector.init() takes options hash, returns false if not valid', function(){
  expect(4);
  equals(false, Redirector.init(), 'Redirector should need options hash');
  equals(false, Redirector.init({ 'mobile' : 'm.example.com'}), 'Redirector should need full host');
  equals(false, Redirector.init({ 'full' : 'example.com'}), 'Redirector should need mobile host');
  equals(true,  Redirector.init(options), 'Redirector should return true');
});

test('Redirector.init() saves current URL and referrer', function(){
  expect(2);
  Redirector.init(options);
  equals(window.location.href, Redirector.meta.current, 'Did not save current URL');
  equals(document.referrer, Redirector.meta.referrer, 'Did not save current URL');
});

module('Redirection');
test('Redirector.check() should redirect to mobile site when user is on full site when conditions are truthy', function(){
  // Override redirection to be able to test it
  Redirector.doRedirect = function(){
    return "did redirect";
  };

  // Override conditions to trigger redirection
  Redirector.conditions = function() { return 1 == 1;};
  Redirector.init(options);
  Redirector.meta.current = 'http://example.com';
  
  equals('did redirect', Redirector.check(), 'Did not redirect user');
});

test('Redirector.check() should not redirect to mobile site when conditions are falsy', function(){
  // Override redirection to be able to test it
  Redirector.doRedirect = function(){ return true;};
  
  // Override conditions to trigger redirection
  Redirector.conditions = function() { return 1 != 1;};
  Redirector.init(options);
  Redirector.meta.current = 'http://example.com';
  
  equals(false, Redirector.check(), 'Did redirect user, but did not expect it to');
});

test('Redirector.check() should not redirect to mobile site when user is on full site but came directly from mobile site', function(){
  // Override redirection to be able to test it
  Redirector.doRedirect = function(){ return true;};
  
  // Override conditions to trigger redirection
  Redirector.conditions = function() { return 1 == 1;};
  Redirector.init(options);
  Redirector.meta.current = 'http://example.com';
  Redirector.meta.referrer = 'http://m.example.com';
  
  equals(false, Redirector.check(), 'Did redirect user, but expected not to');
});

test('Redirector.check() should not redirect after coming to full from mobile until the user goes to mobile by herself', function(){
  expect(4);
  // Override redirection to be able to test it
  Redirector.doRedirect = function(){ return true;};

  // Override conditions to trigger redirection
  Redirector.conditions = function() { return 1 == 1;};
  Redirector.init(options);
  
  // Mobile to full
  Redirector.meta.current = 'http://example.com';
  Redirector.meta.referrer = 'http://m.example.com';
  equals(false, Redirector.check(), 'Did redirect user, but expected not to');

  // Full to full
  Redirector.meta.current = 'http://example.com/about/us';
  Redirector.meta.referrer = 'http://example.com';
  equals(false, Redirector.check(), 'Did redirect user on subsequent page load, but expected not to');
  
  // Full to full
  Redirector.meta.current = 'http://example.com/contact';
  Redirector.meta.referrer = 'http://example.com/about/us';
  equals(false, Redirector.check(), 'Did redirect user on subsequent page load, but expected not to');
  
  // Full to mobile
  Redirector.meta.current = 'http://m.example.com';
  Redirector.meta.referrer = 'http://example.com';
  Redirector.check();
  equals(true, Redirector.canRedirect(), 'Should have deleted the cookie by now');
});

module('URL mapper');
test('It knows what version we are currently on', function(){
  expect(2);
  Redirector.init(options);

  Redirector.meta.current = 'http://example.com/some_page';
  equals('full', Redirector.currentVersion(), 'Did not determine correct version');
  
  Redirector.meta.current = 'http://m.example.com/some_other_page';
  equals('mobile', Redirector.currentVersion(), 'Did not determine correct version');
});

test('It always resolves to root host when no maps are available', function(){
  expect(2);
  Redirector.init(options);
  
  Redirector.meta.current = 'http://example.com/some_page';
  equals('http://m.example.com', Redirector.mapURL(), 'Did not map URL correctly');
  
  Redirector.meta.current = 'http://m.example.com/some_page';
  equals('http://example.com', Redirector.mapURL(), 'Did not map URL correctly');
});

test('Maps URLs between full site and mobile site based on URL map', function(){
  expect(2);
  Redirector.init(options);
  
  Redirector.routeMap = {
    '/profile\\/(\\d+)' : '/user/$1',
    '/musikk\\/artikkel\\.php\\?artid=(\\d+)' : '/mobileart/$1'
  };
  
  Redirector.meta.current = 'http://example.com/profile/29';
  equals('http://m.example.com/user/29', Redirector.mapURL(), 'Did not map URL correctly');
  
  Redirector.meta.current = 'http://example.com/musikk/artikkel.php?artid=292929';
  equals('http://m.example.com/mobileart/292929', Redirector.mapURL(), 'Did not map URL correctly');
});

test('URLMap defaults to base URL when URL not found in map', function(){
  Redirector.init(options);
  
  Redirector.routeMap = {
    '/profile\\/(\\d+)' : '/user/$1',
    '/musikk\\/artikkel\\.php\\?artid=(\\d+)' : '/mobileart/$1'
  };
  
  Redirector.meta.current = 'http://example.com/about/us';
  equals('http://m.example.com', Redirector.mapURL(), 'Did not fall back to default base URL');
});