Redirector
==========

This is a simple library to aid in redirecting from the client side.

### Basic Usage
Put this in your head:

    Redirector.init({
      'full'   : 'www.example.com',
      'mobile' : 'm.example.com'
    });

    Redirector.check()

This will tell the script what your sites are and redirect to the mobile
version if Redirector.condition() returns a truthy value. By default the
condition is that the screen.width is less than 700 pixels. If the user just
came from the mobile site to the full site, the script will set a cookie that
stops redirection. The cookie expires after one week, or will be removed if the
user goes to the mobile site. So you also have to include the script and do the
check() on your mobile site for now.

### Mapping URLs

You can map URLs from the full site to the mobile site if they do not match up
by specifying an object with string regexps as keys and mobile equivalent as
values. Match groups will be replaced in the object values.

    Redirector.init({
      'full'   : 'www.example.com',
      'mobile' : 'm.example.com'
    });

    Redirector.routeMap = {
      '/profile\\/(\\d+)' : '/user/$1'
    };

    Redirector.check()

This will redirect http://www.example.com/profile/29 to http://m.example.com/user/29

### Development

This is an early version and will hopefully be developed further. Patches are
welcome. You will find rake tasks for compiling the CoffeeScript to JS and
compressing the result with Google Closure Compiler Service. The script is
written in CoffeeScript and you need this in your path for the compile Rake
task to work.

    rake

will do all these things and run the QUnit tests.

