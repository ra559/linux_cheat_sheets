# Ruby Programming Language Cheat Sheet

A practical reference for modern Ruby, aimed at learning Ruby on Debian
13 and building a strong foundation for scripting, automation, and
eventually Ruby on Rails.

> **Version note:** This guide targets modern Ruby 4.x conventions. Ruby
> syntax and standard-library packaging can change between releases.
> Check `ruby -v` and the official Ruby documentation when using
> version-specific features. Most core examples also work on Ruby 3.x
> unless explicitly noted.

## Table of Contents

1.  [Getting Started](#1-getting-started)
2.  [Running Ruby](#2-running-ruby)
3.  [Syntax, Comments, and Output](#3-syntax-comments-and-output)
4.  [Variables, Constants, and Scope](#4-variables-constants-and-scope)
5.  [Core Data Types](#5-core-data-types)
6.  [Type Conversion](#6-type-conversion)
7.  [Operators](#7-operators)
8.  [Strings](#8-strings)
9.  [Numbers and Math](#9-numbers-and-math)
10. [Symbols](#10-symbols)
11. [Ranges](#11-ranges)
12. [Truthiness and `nil`](#12-truthiness-and-nil)
13. [Conditionals](#13-conditionals)
14. [Pattern Matching](#14-pattern-matching)
15. [Loops and Iteration](#15-loops-and-iteration)
16. [Blocks, Procs, and Lambdas](#16-blocks-procs-and-lambdas)
17. [Arrays](#17-arrays)
18. [Hashes](#18-hashes)
19. [Enumerable and Collection
    Processing](#19-enumerable-and-collection-processing)
20. [Sets, Destructuring, and
    Enumerators](#20-sets-destructuring-and-enumerators)
21. [Methods](#21-methods)
22. [Object-Oriented Programming](#22-object-oriented-programming)
23. [Modules, Mixins, and Namespaces](#23-modules-mixins-and-namespaces)
24. [Introspection and
    Metaprogramming](#24-introspection-and-metaprogramming)
25. [Files and Directories](#25-files-and-directories)
26. [Environment, Arguments, and CLI
    Options](#26-environment-arguments-and-cli-options)
27. [Processes and External
    Commands](#27-processes-and-external-commands)
28. [Exceptions and Error Handling](#28-exceptions-and-error-handling)
29. [Regular Expressions and Text
    Processing](#29-regular-expressions-and-text-processing)
30. [CSV, JSON, YAML, and XML](#30-csv-json-yaml-and-xml)
31. [Dates, Times, and Encodings](#31-dates-times-and-encodings)
32. [Networking and HTTP](#32-networking-and-http)
33. [Loading Code, Gems, and Bundler](#33-loading-code-gems-and-bundler)
34. [Project Structure and Rake](#34-project-structure-and-rake)
35. [Testing and Debugging](#35-testing-and-debugging)
36. [Logging and Performance](#36-logging-and-performance)
37. [Concurrency Overview](#37-concurrency-overview)
38. [Modern Ruby Features and
    Compatibility](#38-modern-ruby-features-and-compatibility)
39. [Security and Best Practices](#39-security-and-best-practices)
40. [Ruby Compared with Bash](#40-ruby-compared-with-bash)
41. [Quick Reference Tables](#41-quick-reference-tables)
42. [Common Mistakes](#42-common-mistakes)
43. [Learning Path and
    Mini-Projects](#43-learning-path-and-mini-projects)

------------------------------------------------------------------------

## 1. Getting Started

Ruby is a dynamic, object-oriented programming language designed to make
code expressive and readable. It is commonly used for scripts,
automation, web applications, command-line tools, and data processing.

### Check the installation

``` bash
ruby --version
gem --version
bundle --version
```

On Debian, the distribution package is convenient:

``` bash
sudo apt update
sudo apt install ruby-full
```

The Debian package may not be the newest Ruby release. For projects
requiring a particular version, a version manager such as `rbenv` is
often more suitable. Avoid mixing system Ruby gems with a separately
managed Ruby installation without understanding which executable and gem
paths are active.

``` bash
command -v ruby
command -v gem
ruby -e 'puts RUBY_VERSION'
gem env
```

### Ruby documentation

-   Ruby language and API documentation: <https://docs.ruby-lang.org/>
-   RubyGems: <https://rubygems.org/>
-   Bundler: <https://bundler.io/>

## 2. Running Ruby

### Run a file

``` ruby
# hello.rb
puts "Hello, Ruby!"
```

``` bash
ruby hello.rb
```

### Interactive Ruby

``` bash
irb
```

At the IRB prompt, try expressions and inspect their return values.
Leave with `exit` or Ctrl-D.

### Shebang and executable script

``` ruby
#!/usr/bin/env ruby

puts "Hello from an executable Ruby script"
```

``` bash
chmod +x hello.rb
./hello.rb
```

The shebang uses the `ruby` found in `PATH`. Check that this is the Ruby
version you intended.

### Run a one-liner

``` bash
ruby -e 'puts RUBY_VERSION'
ruby -e 'ARGV.each { |name| puts "Hello, #{name}" }' Ada Grace
```

### Syntax-check a file

``` bash
ruby -c script.rb
```

### Useful runtime flags

  Command                Purpose
  ---------------------- -------------------------------------------
  `ruby file.rb`         Run a script
  `ruby -e 'CODE'`       Execute code supplied on the command line
  `ruby -c file.rb`      Check syntax without running the script
  `ruby -Ilib file.rb`   Add `lib` to the load path
  `ruby -w file.rb`      Enable warnings
  `ruby -v`              Print Ruby version
  `irb`                  Start the interactive Ruby shell

## 3. Syntax, Comments, and Output

Ruby uses newlines to separate statements in ordinary code. Semicolons
can separate statements, but are rarely needed. Indent consistently,
commonly with two spaces.

### Comments

``` ruby
# A single-line comment

=begin
A multiline comment.
Use sparingly; ordinary # comments are usually clearer.
=end
```

### Output methods

  -------------------------------------------------------------------------
  Method                    Behavior                Typical use
  ------------------------- ----------------------- -----------------------
  `puts value`              Prints value and a      Human-readable output
                            newline; arrays are     
                            printed                 
                            element-by-element      

  `print value`             Prints without          Prompts and inline
                            automatically adding a  output
                            newline                 

  `p value`                 Prints an inspect-style Debugging
                            representation and      
                            returns the value       

  `pp value`                Pretty-prints nested    Debugging complex data
                            objects (requires `pp`) 

  `warn message`            Writes to standard      Warnings
                            error, usually with a   
                            newline                 

  `format(template, ...)`   Returns a formatted     Numeric and aligned
                            string                  output
  -------------------------------------------------------------------------

``` ruby
name = "Ada"
puts "Hello, #{name}"
print "Enter your name: "
input = gets
p input
warn "This is a warning"

require "pp"
pp({ user: "Ada", roles: %w[admin editor] })

puts format("Price: $%.2f", 12.5)
```

`puts` is usually the right choice for ordinary messages. `p` is useful
when you need to see quotes, `nil`, or collection structure. Ruby's
`format`/`sprintf` is useful for controlled formatting; shell-style
`printf` is not the usual Ruby output idiom.

### Input

``` ruby
print "What is your name? "
name = gets&.chomp
puts "Hello, #{name || "there"}!"
```

`gets` reads a line from standard input. `chomp` removes the line
ending. When input may be absent, account for `gets` returning `nil`.

## 4. Variables, Constants, and Scope

Ruby variables do not need type declarations. The object assigned
determines the value's type.

``` ruby
name = "Ada"          # local variable
@name = "Ada"         # instance variable
@@count = 0           # class variable; use cautiously
$debug_mode = false   # global variable; usually avoid
MAX_RETRIES = 3       # constant by convention
```

  -----------------------------------------------------------------------
  Form                                Meaning
  ----------------------------------- -----------------------------------
  `local_name`                        Local variable

  `@name`                             Instance variable, associated with
                                      an object

  `@@count`                           Class variable shared through a
                                      class hierarchy; can be surprising

  `$global`                           Global variable

  `CONSTANT`                          Constant; reassignment raises a
                                      warning, not a hard immutability
                                      guarantee

  `:symbol`                           Symbol literal, not a variable
  -----------------------------------------------------------------------

### Multiple assignment

``` ruby
first, second = "Ada", "Grace"
first, second = second, first
head, *tail = [10, 20, 30, 40]
```

### Parallel assignment and return values

``` ruby
def coordinates
  [12, 34]
end

x, y = coordinates
```

### Scope basics

A method has its own local-variable scope. Blocks can access local
variables from the surrounding scope, but a class or module body does
not behave like a normal method closure.

``` ruby
message = "hello"
3.times { puts message }

def example
  local_inside_method = 1
end
# local_inside_method is not available here
```

## 5. Core Data Types

Everything in Ruby is an object, including numbers and `nil`.

``` ruby
integer = 42
float = 3.14
text = "hello"
symbol = :hello
truth = true
falsehood = false
nothing = nil
array = [1, 2, 3]
hash = { name: "Ada" }
```

  -----------------------------------------------------------------------
  Type                    Example                 Notes
  ----------------------- ----------------------- -----------------------
  Integer                 `42`, `1_000_000`       Arbitrary-precision
                                                  integers

  Float                   `3.14`                  Binary floating-point;
                                                  not exact for every
                                                  decimal

  Rational                `Rational(1, 3)`        Exact rational
                                                  arithmetic

  Complex                 `Complex(1, 2)`         Complex number

  String                  `"hello"`               Mutable by default

  Symbol                  `:name`                 Commonly used for
                                                  identifiers and hash
                                                  keys

  Array                   `[1, 2, 3]`             Ordered collection

  Hash                    `{ name: "Ada" }`       Key-value collection

  Range                   `(1..5)`                Sequence or interval

  Set                     `Set[1, 2, 3]`          Unique elements;
                                                  requires `set`

  Boolean                 `true`, `false`         The only falsey values
                                                  are `false` and `nil`

  NilClass                `nil`                   Represents absence of a
                                                  value
  -----------------------------------------------------------------------

Inspect an object's class:

``` ruby
42.class       # Integer
"hello".class  # String
nil.class      # NilClass
```

## 6. Type Conversion

Conversion methods can differ in strictness. Use strict constructors
when invalid input should be rejected.

``` ruby
"42".to_i       # 42
"3.14".to_f     # 3.14
42.to_s         # "42"
"active".to_sym # :active

Integer("42")   # 42
Float("3.14")   # 3.14
Integer("nope") # raises ArgumentError
```

Be careful: `"12cats".to_i` returns `12`, while `Integer("12cats")`
raises an error. For user input, strict conversion is often safer.

``` ruby
print "Enter an integer: "
raw = gets&.chomp

begin
  number = Integer(raw, 10)
  puts "Twice the value is #{number * 2}"
rescue ArgumentError, TypeError
  warn "Please enter a valid integer."
  exit 1
end
```

## 7. Operators

### Arithmetic

  Operator   Meaning                        Example
  ---------- ------------------------------ ---------------------
  `+`        Addition or concatenation      `2 + 3`
  `-`        Subtraction                    `5 - 2`
  `*`        Multiplication or repetition   `3 * 4`, `"ha" * 3`
  `/`        Division                       `7 / 2 # => 3`
  `%`        Remainder                      `7 % 2 # => 1`
  `**`       Exponentiation                 `2 ** 3 # => 8`

Integer divided by integer produces an integer. Use `7.0 / 2`,
`Rational(7, 2)`, or explicit conversion when appropriate.

### Comparison and logical operators

``` ruby
a == b       # value equality
a != b
a < b
a <= b
a <=> b      # -1, 0, 1, or nil
!condition
left && right
left || right
```

`&&` and `||` short-circuit and return one of their operands, not
necessarily `true` or `false`.

### Other useful operators

  Operator                 Meaning
  ------------------------ -----------------------------------------
  `=`                      Assignment
  `+=`, `-=`, `*=`, `/=`   Modify and reassign
  `||=`                    Assign only if current value is falsey
  `&&=`                    Assign only if current value is truthy
  `..`                     Inclusive range
  `...`                    Exclusive upper bound in a range
  `&.`                     Safe navigation
  `::`                     Constant or namespace resolution
  `? :`                    Ternary conditional
  `defined?`               Checks whether an expression is defined

``` ruby
count ||= 0
user_name = user&.name
label = enabled ? "on" : "off"
```

## 8. Strings

### Quotes and interpolation

``` ruby
single = 'No interpolation: #{2 + 2}'
double = "Interpolation: #{2 + 2}"
escaped = "First line\nSecond line"
```

Single-quoted strings only process a small set of escapes, primarily
`\\` and `\'`. Double-quoted strings support interpolation and common
escape sequences.

### Common string methods

``` ruby
text = "  Ruby is fun  "

text.strip           # "Ruby is fun"
text.downcase
text.upcase
text.capitalize
text.include?("Ruby")
text.start_with?("  ")
text.end_with?("  ")
text.sub("fun", "useful")       # replace first match
text.gsub(" ", "_")             # replace all matches
text.split
text.length
text.empty?
text.delete(" ")
text.reverse
```

### Indexing and slicing

``` ruby
word = "Ruby"
word[0]       # "R"
word[-1]      # "y"
word[0, 2]    # "Ru"
word[1..2]    # "ub"
word[0] = "T" # mutates word to "Tuby"
```

### Formatting

``` ruby
name = "Ada"
score = 97.25

puts format("%s scored %.1f", name, score)
puts format("%-12s %05d", "ID", 42)
```

### Multiline strings and heredocs

``` ruby
message = <<~TEXT
  This is a multiline string.
  Indentation common to all lines is removed.
TEXT
```

### Mutability and freezing

``` ruby
text = "mutable"
text << " string"

FROZEN_TEXT = "constant value".freeze
```

A constant binding does not automatically freeze the object. Freezing is
shallow unless nested objects are frozen separately.

## 9. Numbers and Math

``` ruby
-7.abs             # 7
3.14159.round(2)   # 3.14
3.9.floor          # 3
3.1.ceil           # 4
(-7).div(3)        # -3, floor division
(-7).remainder(3)  # -1
7.fdiv(2)          # 3.5
Math.sqrt(81)      # 9.0
Math.log(Math::E)  # 1.0
```

Use `Random` for random values:

``` ruby
rng = Random.new
rng.rand(1..6)       # 1 through 6
rng.rand             # float in [0.0, 1.0)
```

Do not use ordinary pseudorandom numbers for security tokens. Use
`SecureRandom`:

``` ruby
require "securerandom"
token = SecureRandom.hex(32)
```

For financial calculations, understand floating-point rounding. Consider
integer minor units (such as cents) or `BigDecimal` where decimal
arithmetic is required.

``` ruby
require "bigdecimal"
price = BigDecimal("19.99")
tax = price * BigDecimal("0.08")
```

## 10. Symbols

Symbols are commonly used as identifiers and hash keys.

``` ruby
:active
:"needs review"
:"user-name"

status = :active
status == :active
```

Symbols and strings are different types:

``` ruby
"name" == :name       # false
"name".to_sym == :name # true
```

Use symbols for known, internal identifiers. Do not blindly convert
arbitrary untrusted input into symbols when working with old Ruby
versions or APIs with different symbol-lifetime behavior. Modern Ruby
manages dynamic symbols more safely than older releases, but validation
is still good design.

## 11. Ranges

``` ruby
(1..5).to_a   # [1, 2, 3, 4, 5]
(1...5).to_a  # [1, 2, 3, 4]
("a".."d").to_a
(1..10).include?(7)
```

`..` includes the end; `...` excludes the end.

``` ruby
case score
when 0...60 then "Fail"
when 60...80 then "Pass"
when 80..100 then "Excellent"
else "Out of range"
end
```

For numeric ranges, `cover?` checks interval membership efficiently:

``` ruby
(1..1_000_000).cover?(500_000) # true
```

## 12. Truthiness and `nil`

Only `false` and `nil` are falsey. Values such as `0`, `""`, and `[]`
are truthy.

``` ruby
if 0
  puts "This runs"
end

if ""
  puts "This also runs"
end
```

Common checks:

``` ruby
value.nil?
value == false
value.empty?       # only when supported by the value
value.nil? || value.empty?
```

Avoid using `value || default` when `false` is a meaningful value; `||`
falls back for both `nil` and `false`.

``` ruby
enabled = settings.fetch(:enabled, true) # preserves explicit false
```

## 13. Conditionals

### `if`, `elsif`, `else`

``` ruby
if temperature > 30
  puts "Hot"
elsif temperature > 20
  puts "Warm"
else
  puts "Cool"
end
```

### `unless`

``` ruby
unless logged_in
  puts "Please sign in"
end
```

Use `unless` for simple negative conditions. Avoid complicated
`unless ... else` expressions.

### Modifier forms

``` ruby
puts "Ready" if ready
warn "Missing configuration" unless configured
```

### `case`

``` ruby
case command
when "start"
  puts "Starting"
when "stop", "quit"
  puts "Stopping"
else
  warn "Unknown command"
end
```

### Ternary operator

``` ruby
message = valid ? "Accepted" : "Rejected"
```

Prefer a normal `if` expression when the branches are long or nested.

## 14. Pattern Matching

Ruby pattern matching uses `case` with `in`. It is different from a
regular-expression match.

``` ruby
case [200, "OK"]
in [200, message]
  puts "Success: #{message}"
in [404, message]
  puts "Not found: #{message}"
else
  puts "Other response"
end
```

### Match an array or hash shape

``` ruby
case { name: "Ada", role: "admin" }
in { name:, role: "admin" }
  puts "#{name} is an administrator"
else
  puts "Not an administrator"
end
```

### Guards

``` ruby
case number
in Integer => value if value.positive?
  puts "Positive integer: #{value}"
else
  puts "Something else"
end
```

Pattern matching is useful for structured data, but ordinary `if` and
`case/when` are often simpler for basic conditions. Syntax and
refinements to pattern matching vary by Ruby version; test against your
project's target version.

## 15. Loops and Iteration

Ruby often favors collection iterators over manual loops.

### `each`

``` ruby
%w[red green blue].each do |color|
  puts color
end
```

### `times`, `upto`, and `downto`

``` ruby
3.times { |index| puts index }
1.upto(3) { |number| puts number }
3.downto(1) { |number| puts number }
```

### `while` and `until`

``` ruby
count = 0
while count < 3
  puts count
  count += 1
end

until count == 0
  count -= 1
end
```

### `loop`, `break`, `next`, and `redo`

``` ruby
loop do
  input = gets&.chomp
  break if input.nil? || input == "quit"
  next if input.empty?

  puts "You entered: #{input}"
end
```

-   `break`: exit the loop.
-   `next`: skip to the next iteration.
-   `redo`: repeat the current iteration without rechecking the loop
    condition. Use carefully to avoid infinite loops.

### `for`

``` ruby
for item in %w[one two three]
  puts item
end
```

`for` is valid Ruby, but `each` is more idiomatic and has different
variable-scope behavior.

## 16. Blocks, Procs, and Lambdas

A block is a chunk of code passed to a method.

``` ruby
[1, 2, 3].each { |number| puts number }

[1, 2, 3].each do |number|
  puts number
end
```

Braces are common for short, single-expression blocks. `do...end` is
often clearer for multiline blocks.

### Yield to a block

``` ruby
def around
  puts "Before"
  yield if block_given?
  puts "After"
end

around { puts "Inside" }
```

### Capture a block

``` ruby
def run_twice(&block)
  2.times { block.call }
end

run_twice { puts "Hello" }
```

### Proc and lambda

``` ruby
greeter = Proc.new { |name| puts "Hello, #{name}" }
greeter.call("Ada")

strict_greeter = ->(name) { puts "Hello, #{name}" }
strict_greeter.call("Grace")
```

Lambdas enforce argument arity more strictly and handle `return`
differently from ordinary procs. Use `->(...) { ... }` for a lambda
literal.

## 17. Arrays

### Create and access

``` ruby
numbers = [10, 20, 30]
words = %w[ruby bash python]
symbols = %i[read write execute]

numbers[0]      # 10
numbers[-1]     # 30
numbers.first
numbers.last
numbers[0, 2]   # [10, 20]
numbers[1..]    # [20, 30]
```

### Add and remove

``` ruby
items = ["a", "b"]
items << "c"
items.push("d")
items.unshift("start")
items.pop
items.shift
items.insert(1, "new")
items.delete("b")
items.delete_at(0)
```

### Search, sort, and transform

``` ruby
numbers.include?(20)
numbers.index(30)
numbers.reverse
numbers.sort
numbers.uniq
numbers.compact
numbers.flatten
numbers.join(", ")
numbers.sample
```

### Mutation versus non-mutation

Many mutating methods end in `!` by convention, but not every method
ending in `!` simply means "mutates." Read the method documentation.

``` ruby
names = %w[ada grace]
upper = names.map(&:upcase) # new array
names.map!(&:upcase)        # modifies names
```

### Array pitfalls

``` ruby
Array.new(3, [])       # all positions reference the SAME inner array
Array.new(3) { [] }    # each position gets a different array
```

## 18. Hashes

Hashes store key-value pairs.

``` ruby
person = { name: "Ada", age: 36 }
person[:name]
person.fetch(:age)
person.fetch(:email, "not provided")
person.key?(:name)
person.value?("Ada")
```

### Add, update, and remove

``` ruby
person[:role] = "engineer"
person.merge!(active: true)
person.delete(:age)
person.keys
person.values
person.length
```

### Iterate

``` ruby
person.each do |key, value|
  puts "#{key}: #{value}"
end
```

### Default values

``` ruby
counts = Hash.new(0)
counts["ruby"] += 1

groups = Hash.new { |hash, key| hash[key] = [] }
groups["languages"] << "Ruby"
```

Be cautious with mutable shared defaults:

``` ruby
bad = Hash.new([]) # the same array is returned for missing keys
good = Hash.new { |hash, key| hash[key] = [] }
```

### Keyword-style hashes

``` ruby
options = { timeout: 5, retries: 2 }
```

A hash with symbol keys is common in Ruby, but external JSON data
generally uses string keys.

## 19. Enumerable and Collection Processing

`Enumerable` provides powerful methods to classes that implement `each`.

``` ruby
numbers = [1, 2, 3, 4, 5]

numbers.map { |n| n * 2 }          # transform
numbers.select { |n| n.even? }     # keep matching items
numbers.reject { |n| n.even? }     # discard matching items
numbers.find { |n| n > 3 }         # first match
numbers.any?(&:negative?)
numbers.all?(&:positive?)
numbers.none?(&:zero?)
numbers.count(&:odd?)
numbers.sum
numbers.min
numbers.max
numbers.partition(&:even?)
numbers.group_by(&:even?)
```

### `reduce` / `inject`

``` ruby
[1, 2, 3, 4].reduce(0) { |sum, n| sum + n }
[1, 2, 3, 4].reduce(:+)
```

For simple sums, use `sum`. Use `reduce` when building a value that
requires custom accumulation.

### `filter_map`

``` ruby
["12", "bad", "7"].filter_map do |text|
  Integer(text, exception: false)
end
# => [12, 7]
```

### Method references with `&:`

``` ruby
%w[ruby rails].map(&:upcase)
```

This shorthand passes a method as a block. Use an explicit block when
the operation needs arguments or extra logic.

### Chaining

``` ruby
results = [1, 2, 3, 4, 5, 6]
  .select(&:even?)
  .map { |n| n * n }
  .sum
```

Keep pipelines readable. For very large data, avoid building unnecessary
intermediate arrays.

## 20. Sets, Destructuring, and Enumerators

### Sets

``` ruby
require "set"

a = Set[1, 2, 3]
b = Set[3, 4, 5]

a | b  # union
a & b  # intersection
a - b  # difference
a.add(4)
a.include?(2)
```

### Splat and double-splat

``` ruby
def show(first, *rest)
  p first
  p rest
end

show("a", "b", "c")

def configure(**options)
  p options
end

configure(timeout: 5, retries: 3)
```

-   `*` expands or captures positional arguments.
-   `**` expands or captures keyword arguments / hash-like options.
-   `&` converts between a block and a `Proc` in method calls.

### Destructuring

``` ruby
first, second = [10, 20]
name, *roles = ["Ada", "admin", "editor"]
```

### Enumerators and lazy evaluation

``` ruby
enum = [1, 2, 3].each
enum.next # 1
enum.next # 2

result = (1..Float::INFINITY).lazy
  .select(&:even?)
  .first(5)
# => [2, 4, 6, 8, 10]
```

Lazy enumerators can avoid calculating every intermediate value. They
are especially useful for large or potentially infinite sequences.

## 21. Methods

### Define a method

``` ruby
def greet(name)
  "Hello, #{name}!"
end

puts greet("Ada")
```

Ruby returns the last evaluated expression unless `return` is used.

### Default and keyword arguments

``` ruby
def connect(host, port = 443, secure: true, timeout: 5)
  { host: host, port: port, secure: secure, timeout: timeout }
end

connect("example.com")
connect("example.com", 8443, secure: false)
```

### Argument forwarding and validation

``` ruby
def divide(a, b)
  raise ArgumentError, "divisor cannot be zero" if b.zero?
  a.to_f / b
end
```

### Predicate, bang, and setter conventions

``` ruby
valid?
normalize!
name=
```

-   `?` commonly marks a predicate.
-   `!` often signals a more dangerous or mutating variant, but is only
    a naming convention.
-   `=` at the end marks a setter method.

### Visibility

``` ruby
class Account
  def balance
    @balance
  end

  private

  def recalculate
    # internal implementation
  end
end
```

## 22. Object-Oriented Programming

### Class and instance

``` ruby
class User
  attr_reader :name

  def initialize(name)
    @name = name
  end

  def greet
    "Hello, #{@name}"
  end
end

user = User.new("Ada")
puts user.greet
```

`initialize` runs during object construction. `attr_reader`,
`attr_writer`, and `attr_accessor` define accessors.

### Instance and class methods

``` ruby
class Counter
  @@instances = 0 # class variables can have surprising inheritance behavior

  def initialize
    @count = 0
    @@instances += 1
  end

  def increment
    @count += 1
  end

  def self.instances
    @@instances
  end
end
```

Prefer a class-instance variable or another explicit design over class
variables when inheritance behavior could confuse readers.

``` ruby
class Registry
  @items = []

  class << self
    attr_reader :items
  end
end
```

### Inheritance and `super`

``` ruby
class Animal
  def initialize(name)
    @name = name
  end

  def speak
    "#{@name} makes a sound"
  end
end

class Dog < Animal
  def speak
    "#{super} and barks"
  end
end
```

### Composition

Composition means an object uses another object rather than inheriting
all its behavior.

``` ruby
class Report
  def initialize(formatter)
    @formatter = formatter
  end

  def render(data)
    @formatter.call(data)
  end
end
```

### Duck typing

Ruby code often depends on what an object can do rather than its exact
class.

``` ruby
def print_lines(source)
  source.each_line { |line| puts line }
end
```

Any object implementing the needed interface can be passed. This is
flexible, but document expectations and validate inputs when necessary.

## 23. Modules, Mixins, and Namespaces

### Namespace

``` ruby
module MyApp
  VERSION = "1.0.0"

  class User
  end
end

user = MyApp::User.new
```

### Mixin with `include`

``` ruby
module Timestamped
  def timestamp
    Time.now
  end
end

class Event
  include Timestamped
end
```

### `extend` and `prepend`

-   `include`: adds module instance methods to the class's instances.
-   `extend`: adds module methods to a particular object, often class
    methods.
-   `prepend`: places a module before a class in method lookup, often
    used to wrap behavior.

``` ruby
module ClassHelpers
  def category
    "example"
  end
end

class Product
  extend ClassHelpers
end

Product.category
```

Modules are also useful for constants and avoiding name collisions.
Prefer small, cohesive modules over large collections of unrelated
methods.

## 24. Introspection and Metaprogramming

Ruby can inspect objects at runtime.

``` ruby
value = "hello"

value.class
value.is_a?(String)
value.respond_to?(:upcase)
value.methods.include?(:upcase)
value.instance_variables
```

### Dynamic method invocation

``` ruby
"hello".public_send(:upcase)
```

Prefer `public_send` when calling a method by name supplied at runtime
because it respects public visibility. Do not pass untrusted method
names without an allowlist.

### Define a method dynamically

``` ruby
class Greeter
  define_method(:greet) do |name|
    "Hello, #{name}"
  end
end
```

Metaprogramming can reduce repetition but can also make code harder to
debug, search, and refactor. Use ordinary methods unless dynamic
behavior provides a clear benefit.

Avoid using `eval` to execute strings assembled from user input.

## 25. Files and Directories

### Read and write

``` ruby
text = File.read("input.txt", encoding: "UTF-8")
File.write("output.txt", "Hello\n")
File.write("output.txt", "More text\n", mode: "a")
```

### Safe resource handling

``` ruby
File.open("input.txt", "r") do |file|
  file.each_line do |line|
    puts line.chomp
  end
end
```

The block form closes the file even if an exception occurs.

### Process a large file line by line

``` ruby
File.foreach("large.log") do |line|
  next unless line.include?("ERROR")
  puts line
end
```

Avoid `File.read` for very large files if you do not need the entire
contents in memory.

### Paths

``` ruby
path = File.join("data", "report.csv")
File.expand_path(path)
File.basename(path)
File.dirname(path)
File.extname(path)
File.exist?(path)
File.file?(path)
File.directory?(path)
File.size(path) if File.file?(path)
```

Use `File.join` instead of manually assembling paths with `/`.
`File.expand_path` normalizes a path but does not prove that it is safe
or authorized.

### Directories and globbing

``` ruby
Dir.pwd
Dir.entries(".")
Dir.glob("logs/*.log").each { |path| puts path }
Dir.mkdir("output") unless Dir.exist?("output")
```

### Temporary files

``` ruby
require "tempfile"

Tempfile.create("report") do |file|
  file.write("temporary data\n")
  file.flush
  puts file.path
end
```

The block form manages cleanup. Use temporary files for intermediate
data that should not persist.

### File permissions and metadata

``` ruby
File.readable?("input.txt")
File.writable?("output.txt")
File.executable?("script.sh")
File.mtime("input.txt")
File.stat("input.txt").mode
```

Do not assume a file's permissions alone make it safe to read or
execute. Consider ownership, symlinks, race conditions, and the
directory in which the file lives.

## 26. Environment, Arguments, and CLI Options

### Environment variables

``` ruby
home = ENV["HOME"]
environment = ENV.fetch("APP_ENV", "development")
```

`ENV.fetch` is useful for required configuration:

``` ruby
api_key = ENV.fetch("API_KEY") # raises KeyError if missing
```

Never commit secrets to source control or print them to logs.

### Arguments

``` ruby
p ARGV
filename = ARGV.fetch(0, "input.txt")
```

### `OptionParser`

``` ruby
require "optparse"

options = { verbose: false, limit: 10 }

OptionParser.new do |parser|
  parser.banner = "Usage: ruby report.rb [options]"

  parser.on("-v", "--verbose", "Show details") do
    options[:verbose] = true
  end

  parser.on("-n N", "--limit N", Integer, "Maximum rows") do |n|
    options[:limit] = n
  end

  parser.on("-h", "--help", "Show help") do
    puts parser
    exit
  end
end.parse!

p options
p ARGV
```

Use `OptionParser` rather than manually parsing complicated command-line
flags.

### Standard streams and exit codes

``` ruby
puts "Normal output"       # stdout
warn "Something happened" # stderr
exit 0                     # success
exit 1                     # failure
```

Conventionally, exit status `0` means success; a nonzero value means
failure.

## 27. Processes and External Commands

External commands are powerful, but unsafe command construction can lead
to command injection.

### Prefer argument arrays

``` ruby
require "open3"

stdout, stderr, status = Open3.capture3(
  "grep", "-n", "--", "ERROR", "application.log"
)

puts stdout
warn stderr unless stderr.empty?
warn "grep exited with #{status.exitstatus}" unless status.success?
```

Passing an executable and separate arguments avoids shell parsing.
Confirm the executable and its options are appropriate for the platform.

### `system`

``` ruby
success = system("git", "status", "--short")
warn "Git command failed" unless success
```

`system` returns `true`, `false`, or `nil` depending on process outcome
and whether execution could be started. Inspect `$?` or use
`Process::Status` when you need the exact exit status.

### `spawn` and `exec`

-   `spawn`: starts a child process and returns its PID.
-   `exec`: replaces the current process with another program.
-   Backticks and `%x{}`: capture output, but use only with trusted
    command strings.
-   `Open3`: captures output, error output, and process status.

``` ruby
pid = spawn("sleep", "1")
Process.wait(pid)
```

### Avoid shell interpolation

**Unsafe:**

``` ruby
# Do not build a shell command from untrusted input.
system("grep #{user_pattern} #{filename}")
```

**Safer:**

``` ruby
system("grep", "-F", "--", user_pattern, filename)
```

Even with argument arrays, validate paths and options for the specific
command. Never assume untrusted data is safe simply because it is passed
as an argument.

## 28. Exceptions and Error Handling

### Basic exception handling

``` ruby
begin
  number = Integer("not a number")
rescue ArgumentError => error
  warn "Invalid number: #{error.message}"
ensure
  # Runs whether or not an exception occurred
end
```

### `else`

``` ruby
begin
  result = Integer("42")
rescue ArgumentError
  warn "Conversion failed"
else
  puts "Converted successfully: #{result}"
ensure
  # Cleanup, if needed
end
```

`else` runs only if the `begin` body finishes without an exception.

### Raise an exception

``` ruby
raise ArgumentError, "name cannot be blank" if name.to_s.strip.empty?
```

### Custom exception

``` ruby
class ConfigurationError < StandardError
end

raise ConfigurationError, "Missing APP_ENV"
```

### Best practices

-   Rescue the specific exception you can handle.
-   Avoid `rescue Exception`; it also catches system-level exceptions
    that usually should not be swallowed.
-   Do not silently ignore failures.
-   Use `ensure` for cleanup.
-   Provide actionable error messages without exposing secrets.
-   For expected invalid input, return a clear error or exit with a
    nonzero status.

## 29. Regular Expressions and Text Processing

Ruby regular expressions are commonly written as `/pattern/`.

``` ruby
"ruby 4".match?(/\Aruby/)
"abc123".match?(/\d+/)
```

### Anchors and character classes

  Pattern         Meaning
  --------------- -----------------------------------------
  `\A`            Start of string
  `\z`            End of string
  `^`, `$`        Line anchors under relevant modes
  `\d`            Digit
  `\w`            Word character
  `\s`            Whitespace
  `.`             Any character except newline by default
  `[A-Z]`         Character class
  `+`, `*`, `?`   Quantifiers
  `{2,5}`         Repetition range
  `(...)`         Capture group
  `(?:...)`       Non-capturing group
  `|`             Alternation

### Match and capture

``` ruby
match = "user-42".match(/\Auser-(\d+)\z/)
if match
  puts match[1]       # "42"
end
```

### Replace

``` ruby
"one two".sub(/\s+/, "-")   # first match
"one two".gsub(/\s+/, "-")  # all matches
```

### Escape untrusted literal text

``` ruby
literal = "a+b"
pattern = Regexp.new(Regexp.escape(literal))
```

Do not treat arbitrary user input as a regular expression unless that is
explicitly intended. Complex regexes can also be vulnerable to excessive
backtracking.

## 30. CSV, JSON, YAML, and XML

Use parsers for structured formats rather than trying to parse them with
regular expressions.

### CSV

``` ruby
require "csv"

CSV.foreach("people.csv", headers: true) do |row|
  puts row["name"]
end

CSV.open("report.csv", "w", write_headers: true,
         headers: %w[name score]) do |csv|
  csv << ["Ada", 98]
  csv << ["Grace", 95]
end
```

CSV fields can contain commas, quotes, and newlines. Use the `csv`
library instead of splitting each line on commas.

### JSON

``` ruby
require "json"

data = { name: "Ada", roles: %w[admin editor] }
json_text = JSON.generate(data)
puts json_text

parsed = JSON.parse(json_text)
puts parsed["name"]
```

Parsed JSON object keys are strings by default. Handle malformed input:

``` ruby
begin
  data = JSON.parse(File.read("data.json"))
rescue JSON::ParserError => error
  warn "Invalid JSON: #{error.message}"
  exit 1
end
```

### YAML

``` ruby
require "yaml"

config = YAML.safe_load(
  File.read("config.yml"),
  permitted_classes: [],
  permitted_symbols: [],
  aliases: false
)
```

YAML loading options vary by Ruby/Psych version. Treat configuration as
untrusted unless its source is trusted, and avoid unsafe object
deserialization. If aliases are needed, enable them deliberately after
assessing the input.

### XML and HTML

Use a real parser for general XML or HTML, such as Nokogiri (an external
gem). HTML is not reliably parsed with regex alone.

## 31. Dates, Times, and Encodings

### Dates and times

``` ruby
require "date"

today = Date.today
now = Time.now
date = Date.parse("2026-10-24")
time = Time.parse("2026-10-24 14:30:00")
```

Use `Time` for timestamps and `Date` for calendar dates. Be explicit
about time zones in distributed applications; a server's local time zone
may differ from a user's.

### Formatting

``` ruby
now.strftime("%Y-%m-%d %H:%M:%S")
Date.today.strftime("%A, %B %-d, %Y")
```

Common directives: `%Y` year, `%m` month, `%d` day, `%H` hour (24-hour),
`%M` minute, `%S` second, `%A` weekday.

### Encoding

``` ruby
text = File.read("input.txt", encoding: "UTF-8")
text.encoding
text.valid_encoding?
text.encode("UTF-8")
```

An encoding declaration or conversion does not automatically repair
arbitrary invalid data. Detect and handle invalid byte sequences
deliberately.

## 32. Networking and HTTP

### Basic HTTP GET

``` ruby
require "net/http"
require "uri"
require "json"

uri = URI("https://example.com/api/status")
response = Net::HTTP.start(
  uri.host,
  uri.port,
  use_ssl: uri.scheme == "https",
  open_timeout: 5,
  read_timeout: 10
) do |http|
  http.get(uri.request_uri)
end

if response.is_a?(Net::HTTPSuccess)
  puts response.body
else
  warn "HTTP request failed: #{response.code}"
end
```

For a real API client, also consider write timeouts, redirects,
response-size limits, content types, rate limits, retries, and JSON
parsing errors. Verify TLS certificates; do not disable TLS verification
to work around certificate errors.

### POST JSON

``` ruby
require "net/http"
require "uri"
require "json"

uri = URI("https://example.com/api/items")
request = Net::HTTP::Post.new(uri)
request["Content-Type"] = "application/json"
request["Accept"] = "application/json"
request.body = JSON.generate(name: "sample")

response = Net::HTTP.start(
  uri.host,
  uri.port,
  use_ssl: uri.scheme == "https",
  open_timeout: 5,
  read_timeout: 10
) do |http|
  http.request(request)
end

puts response.code
```

Use placeholder domains in examples and replace them with a real,
documented API endpoint when experimenting. Never hard-code API keys
into source code.

## 33. Loading Code, Gems, and Bundler

### `require` and `load`

``` ruby
require "json"         # loads a feature once
require "set"
load "./development.rb" # loads file again each time called
```

Prefer `require` for libraries. `load` is mainly useful when
intentionally reloading a file.

### Install and inspect gems

``` bash
gem list
gem info json
gem install rake
gem uninstall rake
```

Avoid using `sudo gem install` with a user-managed Ruby unless the
installation is deliberately configured for system-wide use.

### Bundler

A `Gemfile` declares project dependencies:

``` ruby
source "https://rubygems.org"

gem "rake"
```

Common commands:

``` bash
bundle install
bundle exec ruby script.rb
bundle exec rake
bundle update rake
bundle check
```

Commit `Gemfile.lock` for applications and executable projects so
dependency resolution is repeatable. Update dependencies deliberately
and test the result.

### Standard library versus external gem

Many useful libraries ship with Ruby or are distributed with the Ruby
installation, but packaging can vary by version and distribution. If
`require "csv"` or another library fails, check whether its gem/package
is installed for the active Ruby version. Do not assume every library is
bundled identically across Ruby 3.x and 4.x.

## 34. Project Structure and Rake

A small project might look like:

``` text
my_tool/
├── bin/
│   └── my_tool
├── lib/
│   └── my_tool.rb
├── test/
│   └── test_my_tool.rb
├── Gemfile
├── Gemfile.lock
├── Rakefile
└── README.md
```

### Load project code

``` ruby
require_relative "../lib/my_tool"
```

Use `require_relative` for files relative to the current source file.
Avoid relying on the process's current working directory for locating
source files.

### Simple Rakefile

``` ruby
require "rake"

desc "Run the test suite"
task :test do
  ruby "-Itest", "test/test_my_tool.rb"
end
```

Run:

``` bash
bundle exec rake test
```

For a real gem, use a standard gem layout and a gemspec. Keep
command-line entry points thin and move reusable behavior into `lib/`.

## 35. Testing and Debugging

### Built-in Minitest

``` ruby
require "minitest/autorun"

def add(a, b)
  a + b
end

class AddTest < Minitest::Test
  def test_adds_two_numbers
    assert_equal 5, add(2, 3)
  end
end
```

Run the test file:

``` bash
ruby test_add.rb
```

Useful assertions include `assert`, `refute`, `assert_equal`,
`assert_nil`, `assert_raises`, and `assert_includes`.

### Debugging

``` ruby
p variable
pp complex_object
warn "Reached checkpoint"
```

Modern Ruby supports interactive debugging with the `debug` library when
available:

``` ruby
require "debug"
binding.break
```

Debugging tools and commands can vary by Ruby version and installed
packages. Remove temporary debug statements before committing code.

### Testing principles

-   Test normal inputs, edge cases, and invalid inputs.
-   Keep tests repeatable and independent.
-   Avoid relying on real external services in unit tests.
-   Use temporary directories and files for filesystem tests.
-   Test error behavior as well as successful results.

## 36. Logging and Performance

### Logger

``` ruby
require "logger"

logger = Logger.new($stderr)
logger.level = Logger::INFO

logger.debug("Detailed diagnostic information")
logger.info("Job started")
logger.warn("Configuration is incomplete")
logger.error("Job failed")
```

Never log passwords, API tokens, private keys, or sensitive user data.
Add context that helps diagnose a problem without exposing secrets.

### Benchmark

``` ruby
require "benchmark"

Benchmark.bm do |benchmark|
  benchmark.report("sum:") { 1_000_000.times.sum { |n| n } }
end
```

Benchmark representative work rather than tiny examples alone. For real
performance issues, profile first and optimize the measured bottleneck.

### Complexity reminders

  Operation                   Typical complexity
  --------------------------- --------------------
  Array indexing              O(1)
  Array search                O(n)
  Hash lookup                 Average O(1)
  Set membership              Average O(1)
  Sorting                     Usually O(n log n)
  Full collection traversal   O(n)

Actual costs depend on the data structure, implementation, and
operation.

## 37. Concurrency Overview

Ruby provides several ways to perform work concurrently:

-   **Threads:** useful for overlapping I/O; MRI's Global VM Lock
    affects parallel execution of Ruby code.
-   **Processes:** separate address spaces; useful for CPU-bound work or
    isolation.
-   **Fibers:** lightweight cooperative execution units; useful with
    fiber-aware I/O and schedulers.
-   **Queue:** a thread-safe communication primitive for
    producer-consumer patterns.

``` ruby
require "thread"

queue = Queue.new
worker = Thread.new do
  queue << "done"
end

puts queue.pop
worker.join
```

Concurrency behavior depends on the Ruby implementation and libraries.
Do not assume threads automatically make CPU-bound Ruby code run in
parallel. Protect shared mutable state and understand the lifecycle of
worker threads.

## 38. Modern Ruby Features and Compatibility

Ruby evolves over time. Check the project's target version before using
newer syntax.

  -----------------------------------------------------------------------
  Feature                             Notes
  ----------------------------------- -----------------------------------
  Keyword arguments                   Modern, explicit argument style;
                                      details changed in Ruby 3.0

  Safe navigation `&.`                Avoids calling a method on `nil`;
                                      available since Ruby 2.3

  Pattern matching `case/in`          Introduced in Ruby 2.7 and refined
                                      in later releases

  Endless method definitions          `def name = expression`; introduced
                                      in Ruby 3.0

  Numbered block parameters `_1`,     Convenient for simple blocks;
  `_2`                                available in modern Ruby

  `Data.define`                       Immutable value-object facility
                                      introduced in Ruby 3.2

  `filter_map`                        Transform and discard `nil`/`false`
                                      results; available since Ruby 2.7

  `Hash#transform_keys` /             Useful hash transformations; verify
  `transform_values`                  older target versions

  `...` argument forwarding           For forwarding arguments,
                                      introduced in Ruby 2.7

  `it` block parameter                Availability and semantics are
                                      version-specific; verify before
                                      using
  -----------------------------------------------------------------------

Examples:

``` ruby
# Safe navigation
user&.profile&.name

# Endless method
def double(number) = number * 2

# Numbered block parameter
[1, 2, 3].map { _1 * 2 }

# Data class for a small immutable value object (Ruby 3.2+)
Point = Data.define(:x, :y)
point = Point.new(x: 2, y: 5)
```

Use the newest syntax when your project controls its Ruby version. For
reusable libraries, consider the minimum supported Ruby version and test
against it.

## 39. Security and Best Practices

### Input validation

Treat command-line input, environment variables, files, API responses,
and user-submitted values as untrusted until validated.

``` ruby
port = Integer(ENV.fetch("PORT", "3000"), 10)
raise ArgumentError, "port out of range" unless (1..65_535).cover?(port)
```

### Avoid unsafe evaluation

Do not use `eval` to parse data or execute input. Use purpose-built
parsers such as `JSON.parse` and `CSV`.

### External commands

-   Prefer `system("command", "arg1", "arg2")` or `Open3` with separate
    arguments.
-   Avoid interpolating untrusted values into shell command strings.
-   Validate paths and command options, even when using argument arrays.
-   Check exit statuses and handle stderr.

### Filesystem safety

-   Use `File.join` for paths.
-   Avoid writing to privileged locations with untrusted filenames.
-   Consider symlinks and race conditions.
-   Use block-based file handling for automatic cleanup.
-   Use temporary directories/files for intermediate artifacts.

### Secrets and network security

-   Read secrets from environment variables or a dedicated secrets
    manager.
-   Do not commit credentials to Git.
-   Keep TLS certificate verification enabled.
-   Set timeouts on network operations.
-   Validate response status, content type, and size.
-   Do not trust remote JSON/YAML just because it is syntactically
    valid.

### Dependencies

-   Keep dependencies minimal.
-   Use `Gemfile.lock` where appropriate.
-   Review dependency updates and security advisories.
-   Avoid running install commands as root without a clear reason.
-   Prefer supported Ruby releases and update deliberately.

### General style

-   Prefer small methods with clear names.
-   Use `each`, `map`, `select`, and other `Enumerable` methods when
    they improve readability.
-   Use `puts` for ordinary output, `p` for inspection, `warn` for
    diagnostics, and `format` for formatted output.
-   Avoid global variables and unnecessary class variables.
-   Rescue only exceptions you can handle.
-   Prefer composition to deep inheritance.
-   Do not use clever syntax when straightforward code is clearer.

## 40. Ruby Compared with Bash

Ruby and Bash solve overlapping but different problems. Bash excels at
shell orchestration; Ruby is generally more comfortable for structured
data, complex logic, and larger reusable programs.

  --------------------------------------------------------------------------------------------------------------------
  Task                    Bash                                             Ruby
  ----------------------- ------------------------------------------------ -------------------------------------------
  Print a line            `printf '%s\n' "$name"`                          `puts name`

  Read a line             `IFS= read -r name`                              `name = gets&.chomp`

  Variable                `name="Ada"`                                     `name = "Ada"`

  Condition               `if [[ $x -gt 5 ]]; then ... fi`                 `if x > 5 ... end`

  Iterate files           `for file in *.log; do ...; done`                `Dir.glob("*.log").each { \|file\| ... }`

  Read a file             `while IFS= read -r line; do ...; done < file`   `File.foreach("file") { \|line\| ... }`

  JSON                    External `jq` is commonly used                   `require "json"`

  CSV                     Requires careful parsing or tools                `require "csv"`

  HTTP                    Commonly `curl`                                  `net/http` or an HTTP gem

  Run a process           Shell command                                    `system`, `spawn`, or `Open3`

  Data collection         Arrays / strings                                 Arrays, hashes, sets, enumerables

  Dependencies            OS packages and shell utilities                  RubyGems and Bundler
  --------------------------------------------------------------------------------------------------------------------

Ruby's `puts` is idiomatic for line output. Use `printf` in Ruby only
when formatting control is useful, for example
`printf("Progress: %3d%%\n", percent)`.

## 41. Quick Reference Tables

### Common string methods

  -----------------------------------------------------------------------
  Method                              Purpose
  ----------------------------------- -----------------------------------
  `strip`                             Remove surrounding whitespace

  `split`                             Split into an array

  `join`                              Join array elements into a string

  `include?`                          Check for a substring

  `sub` / `gsub`                      Replace first / all matches

  `start_with?` / `end_with?`         Prefix / suffix test

  `match?`                            Check a regular expression without
                                      returning a match object

  `to_i` / `to_f`                     Convert to number, permissively
  -----------------------------------------------------------------------

### Common array methods

  Method                Purpose
  --------------------- ---------------------------------
  `each`                Iterate
  `map`                 Transform each item
  `select` / `filter`   Keep matching items
  `reject`              Remove matching items
  `find`                Return first matching item
  `reduce` / `inject`   Accumulate a result
  `sort` / `sort_by`    Sort
  `uniq`                Remove duplicates
  `compact`             Remove `nil`
  `flatten`             Flatten nested arrays
  `each_with_index`     Iterate with index
  `zip`                 Combine corresponding positions

### Common hash methods

  Method               Purpose
  -------------------- --------------------------------------------------------
  `[]`                 Look up a key; returns `nil` if missing and no default
  `fetch`              Look up with explicit fallback or error
  `key?`               Check for a key
  `keys` / `values`    Return keys / values
  `each`               Iterate key-value pairs
  `merge`              Return merged hash
  `merge!`             Modify hash with merged values
  `dig`                Safely traverse nested hashes/arrays
  `transform_keys`     Transform keys
  `transform_values`   Transform values

### Common file and directory methods

  Method                             Purpose
  ---------------------------------- ---------------------------
  `File.read`                        Read whole file
  `File.write`                       Write file
  `File.open`                        Open file
  `File.foreach`                     Iterate through lines
  `File.exist?`                      Check existence
  `File.file?` / `File.directory?`   Check type
  `File.join`                        Join path components
  `File.basename` / `File.dirname`   Extract path components
  `Dir.glob`                         Match path patterns
  `Dir.pwd`                          Current working directory

### Common introspection methods

  -----------------------------------------------------------------------
  Method                              Purpose
  ----------------------------------- -----------------------------------
  `class`                             Return object's class

  `is_a?` / `kind_of?`                Check class or module membership

  `respond_to?`                       Check method availability

  `nil?`                              Check for `nil`

  `object_id`                         Object identity value

  `inspect`                           Developer-oriented representation

  `to_s`                              String representation

  `methods`                           Available public/protected methods
                                      (with options/version-specific
                                      details)
  -----------------------------------------------------------------------

### Useful standard libraries

  Library              Use
  -------------------- --------------------------------------
  `json`               JSON parsing and generation
  `csv`                CSV parsing and writing
  `date`               Calendar dates
  `time`               Time parsing and formatting
  `pathname`           Path manipulation
  `fileutils`          File and directory utilities
  `optparse`           Command-line options
  `open3`              External process control and capture
  `net/http`           HTTP client
  `uri`                URI parsing
  `logger`             Application logging
  `set`                Set collection
  `securerandom`       Secure random values
  `tempfile`           Temporary files
  `benchmark`          Basic benchmarking
  `minitest/autorun`   Built-in testing framework

Some standard-library components may be packaged separately or as gems
depending on the Ruby version and distribution. If `require` fails,
verify the active Ruby installation and package availability.

## 42. Common Mistakes

### Assuming `0` or an empty string is falsey

``` ruby
if 0
  puts "Runs in Ruby"
end
```

Only `false` and `nil` are falsey.

### Integer division

``` ruby
7 / 2    # => 3
7.0 / 2  # => 3.5
```

### Using `to_i` for strict validation

``` ruby
"12cats".to_i     # => 12
Integer("12cats") # raises ArgumentError
```

### Forgetting `chomp`

``` ruby
name = gets&.chomp
```

Without `chomp`, the newline may remain in the string.

### Confusing `puts`, `p`, and `print`

-   `puts`: normal human-readable output.
-   `print`: output without an automatic newline.
-   `p`: debug representation.
-   `format` / `printf`: controlled formatting.

### Assuming a constant makes an object immutable

``` ruby
SETTINGS = { mode: "safe" }
SETTINGS[:mode] = "other" # allowed unless the object is frozen
```

### Accidentally sharing mutable defaults

Use `Hash.new { |hash, key| hash[key] = [] }` rather than `Hash.new([])`
when each key needs its own array.

### Catching every exception

Avoid broad `rescue` clauses that hide programming errors or
system-level failures. Catch the expected exception and respond
meaningfully.

### Building shell commands with interpolation

Do not assemble command strings from untrusted values. Pass the
executable and arguments separately.

### Parsing CSV or HTML manually

Use dedicated parsers. Commas, quotes, line breaks, and nested markup
make ad hoc parsing unreliable.

### Assuming every Ruby version has identical libraries

Check the active interpreter, standard-library packaging, and target
version before relying on a feature.

## 43. Learning Path and Mini-Projects

### Suggested learning order

1.  Variables, types, strings, operators, and input/output.
2.  Conditionals, loops, arrays, hashes, and methods.
3.  Blocks, `Enumerable`, and idiomatic collection processing.
4.  Classes, modules, object composition, and exceptions.
5.  Files, directories, command-line arguments, and subprocesses.
6.  CSV/JSON, regular expressions, dates, and HTTP.
7.  Gems, Bundler, project structure, tests, and logging.
8.  Security, performance, concurrency, and advanced Ruby features.

### Practice projects

  -----------------------------------------------------------------------
  Project                             Concepts practiced
  ----------------------------------- -----------------------------------
  Unit converter                      Methods, input, numeric conversion

  Number guessing game                Conditions, loops, random values

  Word and line counter               File processing, hashes, CLI
                                      arguments

  Log analyzer                        `File.foreach`, regex,
                                      `Enumerable`, sorting

  CSV report generator                CSV, data transformation,
                                      formatting

  JSON configuration checker          JSON, validation, exceptions

  File organizer                      `Pathname`, `FileUtils`, filesystem
                                      safety

  System information report           External commands, `Open3`, exit
                                      status

  HTTP status checker                 `net/http`, timeouts, error
                                      handling

  Command-line task manager           Classes, persistence, JSON,
                                      `OptionParser`

  Backup verifier                     File metadata, checksums, logging

  Small gem                           Project layout, tests, Bundler,
                                      documentation
  -----------------------------------------------------------------------

### Final checklist

Before calling a Ruby script finished, ask:

-   Does it validate its inputs?
-   Does it handle expected errors and return a meaningful exit status?
-   Does it avoid unsafe shell interpolation?
-   Does it close files and clean up temporary resources?
-   Does it avoid exposing secrets in output or logs?
-   Are dependencies declared and reproducible?
-   Are important behaviors covered by tests?
-   Does the code use clear, idiomatic Ruby rather than unnecessary
    cleverness?

------------------------------------------------------------------------

**Keep this guide nearby, but use it alongside the official
documentation.** A cheat sheet helps you remember syntax; the API
documentation explains edge cases, version-specific behavior, and method
contracts.
