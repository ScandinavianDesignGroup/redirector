require "net/http"

task :default => [:compile, :minify, :test]

task :release do
  version = ENV['VERSION']
  if version
    puts "Writing version #{version} from current state"
    Rake::Task[:compile].invoke()
    Rake::Task[:minify].invoke()
    FileUtils.cp('js/redirector.min.js', 'release/redirector-' + version + '.min.js')
  else
    puts "Specify VERSION with an env variable"
  end
end

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
