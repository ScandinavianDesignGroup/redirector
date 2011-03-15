require "net/http"

task :default => [:compile, :minify, :test]

task :compile do
  puts "Compiling CoffeeScript to JavaScript..."
  `coffee -o js/ --compile redirector.coffee`
end

task :minify do
  puts "Minifying JavaScript with Google Closure Compiler Service..."
  http = Net::HTTP.new("closure-compiler.appspot.com")

  request = Net::HTTP::Post.new("/compile")
  request.set_form_data({
    "js_code" => File.read('js/redirector.js'),
    'compilation_level' => 'SIMPLE_OPTIMIZATIONS',
    'output_format' => 'text',
    'output_info' => 'compiled_code'
    })
  response = http.request(request)
  
  File.open('js/redirector.min.js', 'w') do |f|
    f.puts response.body
  end
end

task :test do
  puts "Running tests in browser..."
  `open test/index.html`
end
