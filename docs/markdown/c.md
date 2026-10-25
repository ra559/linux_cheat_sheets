---
layout: sheet
title: "C Programming Language Cheat Sheet"
category: "Programming"
summary: "Core C syntax, data types, control flow, pointers, and standard library essentials."
date: 2026-10-24 20:25:21
permalink: /html/c.html
---
# C Programming Language Cheat Sheet

A practical C reference for beginners and everyday development on Linux, including Debian 13. Examples use standard C and can be compiled with GCC or Clang.

## Table of contents

- [1. Compile and run C programs](#1-compile-and-run-c-programs)
- [2. Basic program structure](#2-basic-program-structure)
- [3. Comments and formatting](#3-comments-and-formatting)
- [4. Variables and fundamental types](#4-variables-and-fundamental-types)
- [5. Type qualifiers and modifiers](#5-type-qualifiers-and-modifiers)
- [6. Constants and literals](#6-constants-and-literals)
- [7. Input and output](#7-input-and-output)
- [8. Operators](#8-operators)
- [9. Type conversions](#9-type-conversions)
- [10. Conditional statements](#10-conditional-statements)
- [11. Loops](#11-loops)
- [12. Functions](#12-functions)
- [13. Arrays](#13-arrays)
- [14. Strings](#14-strings)
- [15. Pointers](#15-pointers)
- [16. Dynamic memory allocation](#16-dynamic-memory-allocation)
- [17. Structures, unions, and enumerations](#17-structures-unions-and-enumerations)
- [18. Scope, lifetime, and storage duration](#18-scope-lifetime-and-storage-duration)
- [19. Header files and preprocessor](#19-header-files-and-preprocessor)
- [20. File input and output](#20-file-input-and-output)
- [21. Error handling and debugging](#21-error-handling-and-debugging)
- [22. Bitwise operations](#22-bitwise-operations)
- [23. Common standard library headers](#23-common-standard-library-headers)
- [24. Common mistakes and safe practices](#24-common-mistakes-and-safe-practices)
- [25. Small complete examples](#25-small-complete-examples)

---

## 1. Compile and run C programs

### Install a compiler on Debian

```bash
sudo apt update
sudo apt install build-essential gdb
```

`build-essential` installs GCC and the basic tools needed to compile many C programs. `gdb` is a debugger.

Check versions:

```bash
gcc --version
gdb --version
```

### Compile a source file

Suppose the file is named `hello.c`:

```bash
gcc hello.c -o hello
./hello
```

### Compile with useful warnings

```bash
gcc -std=c17 -Wall -Wextra -Wpedantic -g hello.c -o hello
```

- `-std=c17`: use the C17 language standard.
- `-Wall -Wextra -Wpedantic`: enable many useful diagnostics.
- `-g`: include debugging information.
- `-o hello`: name the output executable `hello`.

Warnings are useful feedback. Fix them instead of routinely suppressing them.

### Compile with Clang

```bash
sudo apt install clang
clang -std=c17 -Wall -Wextra -Wpedantic -g hello.c -o hello
```

### Address and undefined-behavior sanitizers

For supported GCC/Clang environments, these can help find memory errors during development:

```bash
gcc -std=c17 -Wall -Wextra -g \
  -fsanitize=address,undefined \
  program.c -o program
./program
```

Sanitizers are development tools, not a replacement for careful code.

---

## 2. Basic program structure

```c
#include <stdio.h>

int main(void)
{
    printf("Hello, world!\n");
    return 0;
}
```

- `#include <stdio.h>` makes declarations for standard input/output functions available.
- `int main(void)` defines the program's entry point and takes no arguments.
- `{ ... }` marks a block of code.
- `printf()` writes formatted output.
- `\n` is a newline character.
- `return 0;` indicates successful completion to the operating system.

In hosted C programs, reaching the closing brace of `main` is equivalent to returning `0`.

### Program arguments

```c
#include <stdio.h>

int main(int argc, char *argv[])
{
    printf("Argument count: %d\n", argc);

    for (int i = 0; i < argc; i++) {
        printf("argv[%d] = %s\n", i, argv[i]);
    }

    return 0;
}
```

- `argc`: number of command-line arguments, including the program name.
- `argv`: array of strings containing the arguments.
- `argv[0]` usually contains the program name or path.

---

## 3. Comments and formatting

```c
// Single-line comment

/*
   Multi-line comment.
*/
```

C comments do not nest. Keep indentation consistent and use meaningful variable names.

```c
int item_count = 5;

if (item_count > 0) {
    printf("Items available\n");
}
```

A semicolon ends most declarations and statements. Braces group multiple statements into a block.

---

## 4. Variables and fundamental types

A variable has a type, a name, and a value.

```c
int age = 30;
float temperature = 21.5f;
double distance = 1234.567;
char initial = 'A';
_Bool is_ready = 1;
```

In typical beginner programs, `int`, `double`, and `char` are common starting points. The exact size of most C types depends on the implementation.

| Type | Purpose | Example |
|---|---|---|
| `char` | Character-sized integer type; often stores a character | `char letter = 'A';` |
| `int` | Integer | `int count = 42;` |
| `float` | Single-precision floating point | `float rate = 1.5f;` |
| `double` | Double-precision floating point | `double pi = 3.14159;` |
| `_Bool` | Boolean value, `0` or `1` | `_Bool active = 1;` |
| `void` | No value / no type | `void print_message(void);` |

Include `<stdbool.h>` to use the `bool`, `true`, and `false` names in C versions that provide them (C23 makes these keywords).

```c
#include <stdbool.h>

bool is_logged_in = true;
bool has_error = false;
```

### Check sizes with `sizeof`

```c
#include <stdio.h>

int main(void)
{
    printf("char: %zu bytes\n", sizeof(char));
    printf("int: %zu bytes\n", sizeof(int));
    printf("float: %zu bytes\n", sizeof(float));
    printf("double: %zu bytes\n", sizeof(double));
    return 0;
}
```

`sizeof` returns a value of type `size_t`; `%zu` is the matching `printf` format specifier.

### Signed and unsigned integers

```c
signed int temperature = -5;
unsigned int quantity = 10;
```

- Signed integer types can represent negative and nonnegative values.
- Unsigned integer types represent nonnegative values and use their range differently.
- Unsigned arithmetic wraps modulo one more than the type's maximum value.
- Signed integer overflow is undefined behavior in C. Do not rely on it wrapping.

### Fixed-width integer types

For exact-width integer types when available, include `<stdint.h>`:

```c
#include <stdint.h>

int32_t signed_value = -100;
uint32_t unsigned_value = 100;
uint64_t large_value = 123456789ULL;
```

An exact-width type such as `uint32_t` is provided only if the implementation supports a type of exactly that width without padding bits.

### Integer format specifiers

Include `<inttypes.h>` for portable formatting macros for fixed-width integers.

```c
#include <inttypes.h>
#include <stdint.h>
#include <stdio.h>

int32_t value = -123;
printf("%" PRId32 "\n", value);
```

---

## 5. Type qualifiers and modifiers

Qualifiers and type modifiers serve different purposes.

### Qualifiers

- `const`: the object cannot be modified through this identifier.
- `volatile`: accesses are observable in ways the implementation must respect; it is not a general thread-synchronization mechanism.
- `restrict`: a promise about pointer-based access that can enable optimization; violating its rules can cause undefined behavior.

```c
const double tax_rate = 0.15;
volatile unsigned int hardware_status;
```

`const` does not automatically make an object globally immutable, and it does not mean the value must be a compile-time constant in every context.

### Integer type modifiers

- `signed`
- `unsigned`
- `short`
- `long`
- `long long`

Examples:

```c
short int small_number = 10;
long int population = 1000000L;
long long int very_large_number = 9000000000LL;
unsigned long long int count = 42ULL;
```

The standard specifies minimum ranges and relationships, not one universal byte size for every type. Use `sizeof` or fixed-width types when the distinction matters.

### `const` with pointers

```c
const int *p1;        // Pointer to const int; *p1 cannot be changed through p1
int *const p2 = NULL; // Constant pointer; p2 cannot be reassigned
const int *const p3 = NULL; // Constant pointer to const int
```

These declarations have different meanings: the location of `const` matters.

---

## 6. Constants and literals

```c
const int max_users = 100;
#define BUFFER_SIZE 256
```

Prefer a `const` object when you want a typed object. `#define` creates a preprocessor macro and does not declare a C variable.

### Numeric literals

```c
int decimal = 42;
int octal = 052;          // Base 8, value 42
int hexadecimal = 0x2A;   // Base 16, value 42

unsigned int u = 42U;
long int l = 42L;
long long int ll = 42LL;

float f = 3.14f;
double d = 3.14;
```

A leading zero on an integer literal means octal notation. Avoid accidental leading zeros.

### Character and string literals

```c
char letter = 'Z';
const char *message = "Hello";
```

Single quotes denote character constants; double quotes denote string literals.

Common escapes:

| Escape | Meaning |
|---|---|
| `\n` | Newline |
| `\t` | Tab |
| `\\` | Backslash |
| `\"` | Double quote |
| `\'` | Single quote |
| `\0` | Null character |

---

## 7. Input and output

Include `<stdio.h>` for standard I/O functions.

### Print formatted output with `printf`

```c
int age = 25;
double price = 19.99;
char grade = 'B';

printf("Age: %d\n", age);
printf("Price: %.2f\n", price);
printf("Grade: %c\n", grade);
```

Common `printf` format specifiers:

| Specifier | Expected argument |
|---|---|
| `%d` | `int` |
| `%u` | `unsigned int` |
| `%ld` | `long int` |
| `%lld` | `long long int` |
| `%f` | `double` |
| `%c` | `int` value representing a character |
| `%s` | Pointer to a null-terminated character string |
| `%p` | Pointer, passed as `void *` |
| `%zu` | `size_t` |
| `%%` | A literal percent sign |

For `printf`, a `float` argument is promoted to `double`, so `%f` is used for both `float` values and `double` values.

### Read input with `fgets`

For beginner programs, `fgets` is often a better default than reading an unbounded string with `scanf("%s", ...)`.

```c
#include <stdio.h>
#include <string.h>

int main(void)
{
    char name[100];

    printf("Enter your name: ");

    if (fgets(name, sizeof name, stdin) != NULL) {
        name[strcspn(name, "\n")] = '\0';
        printf("Hello, %s!\n", name);
    } else {
        fprintf(stderr, "Could not read input.\n");
        return 1;
    }

    return 0;
}
```

`fgets` reads at most one less than the buffer capacity and null-terminates the string when successful. If the line is longer than the buffer, the remaining characters stay in the input stream and need to be handled if the application expects full lines.

### Read an integer with `scanf`

```c
int age;

printf("Enter your age: ");

if (scanf("%d", &age) == 1) {
    printf("Age: %d\n", age);
} else {
    fprintf(stderr, "Invalid integer input.\n");
    return 1;
}
```

`scanf` returns the number of assignments successfully made. Validate input carefully, especially for user-facing programs. The `&` passes the address of `age` so `scanf` can store the result.

Do not use `gets`; it was removed from the C standard because it cannot limit the input length.

### Print errors to standard error

```c
fprintf(stderr, "Error: could not open file\n");
```

- `stdout`: normal output.
- `stderr`: diagnostic/error output.

---

## 8. Operators

### Arithmetic

```c
int a = 10;
int b = 3;

a + b;  // Addition: 13
a - b;  // Subtraction: 7
a * b;  // Multiplication: 30
a / b;  // Integer division: 3
a % b;  // Remainder: 1
```

When both operands of `/` are integers, the fractional part is discarded toward zero.

```c
double result = 10.0 / 3.0;
```

### Assignment and compound assignment

```c
int count = 10;
count += 2;  // count = count + 2
count -= 1;
count *= 3;
count /= 2;
count %= 4;
```

### Increment and decrement

```c
count++;
count--;
++count;
--count;
```

In an expression, prefix forms produce the updated value; postfix forms produce the prior value. As standalone statements, both simply increment or decrement.

### Comparison

```c
a == b  // Equal
a != b  // Not equal
a < b
a > b
a <= b
a >= b
```

Comparison expressions produce an integer result of `0` (false) or `1` (true).

### Logical operators

```c
x && y  // Logical AND
x || y  // Logical OR
!x      // Logical NOT
```

`&&` and `||` short-circuit: the right-hand operand may not be evaluated if the result is already known.

### Conditional operator

```c
int maximum = (a > b) ? a : b;
```

### Operator precedence

When in doubt, use parentheses:

```c
int result = (a + b) * c;
```

Do not rely on memorizing the entire precedence table when parentheses make the intent clearer.

---

## 9. Type conversions

### Implicit conversion

C automatically converts values in many expressions and assignments.

```c
int whole = 5;
double precise = whole;  // 5.0
```

Converting a floating-point value to an integer discards the fractional part toward zero, provided the result is representable:

```c
int value = (int)3.9;  // 3
```

### Explicit cast

```c
double average = (double)total / count;
```

Without the cast, if both `total` and `count` are integers, integer division would occur before assignment.

Casts do not make an unsafe conversion safe. Be careful when converting values outside the destination type's representable range.

---

## 10. Conditional statements

### `if`, `else if`, and `else`

```c
if (score >= 90) {
    printf("A\n");
} else if (score >= 80) {
    printf("B\n");
} else {
    printf("Keep practicing\n");
}
```

In C, zero is false and nonzero is true in a condition.

### `switch`

```c
switch (choice) {
    case 1:
        printf("Start\n");
        break;
    case 2:
        printf("Settings\n");
        break;
    case 3:
        printf("Quit\n");
        break;
    default:
        printf("Unknown option\n");
        break;
}
```

`break` exits the `switch`. Without it, execution usually continues into the next case, a behavior called fall-through. `switch` works with integer types and enumerations, not strings.

---

## 11. Loops

### `for`

```c
for (int i = 0; i < 5; i++) {
    printf("%d\n", i);
}
```

Useful when initialization, condition, and update fit naturally together.

### `while`

```c
int count = 0;

while (count < 5) {
    printf("%d\n", count);
    count++;
}
```

### `do while`

```c
int choice;

do {
    printf("Enter 0 to quit: ");
    if (scanf("%d", &choice) != 1) {
        break;
    }
} while (choice != 0);
```

The body runs at least once before the condition is tested.

### `break` and `continue`

- `break`: exits the nearest loop or `switch`.
- `continue`: skips to the next loop iteration.

---

## 12. Functions

Functions let you divide a program into reusable pieces.

```c
#include <stdio.h>

int add(int a, int b);

int main(void)
{
    printf("%d\n", add(3, 4));
    return 0;
}

int add(int a, int b)
{
    return a + b;
}
```

- A **declaration/prototype** tells the compiler the function's name, return type, and parameter types.
- A **definition** supplies the function body.
- `return` sends a value back to the caller.

### Function that returns no value

```c
void print_separator(void)
{
    puts("----------------");
}
```

In a parameter list, `void` explicitly indicates that the function takes no arguments.

### Pass-by-value

C passes function arguments by value. A function receives a copy of a scalar argument.

```c
void set_to_zero(int value)
{
    value = 0; // Does not change the caller's variable
}
```

To modify the caller's object, pass a pointer to it:

```c
void set_to_zero(int *value)
{
    if (value != NULL) {
        *value = 0;
    }
}
```

Call it with `set_to_zero(&number);`.

### Recursion

A recursive function calls itself. It must have a base case to stop recursion.

```c
unsigned long long factorial(unsigned int n)
{
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}
```

This simple factorial function can overflow for large inputs and can exhaust the call stack for sufficiently large values.

---

## 13. Arrays

An array stores a fixed number of elements of the same type in contiguous memory.

```c
int numbers[5] = {10, 20, 30, 40, 50};

printf("%d\n", numbers[0]); // First element
printf("%d\n", numbers[4]); // Last element
```

C arrays use zero-based indexing. Valid indices for an array of length five are `0` through `4`. Out-of-bounds access is undefined behavior.

### Iterate through an array

```c
for (size_t i = 0; i < sizeof numbers / sizeof numbers[0]; i++) {
    printf("%d\n", numbers[i]);
}
```

This size calculation works when `numbers` is an actual array in the same scope. When an array is passed to a function, its parameter is adjusted to a pointer, so `sizeof` that parameter does not reveal the original array length. Pass the length separately.

### Initialize arrays

```c
int a[5] = {0};       // All elements are zero
int b[] = {1, 2, 3};  // Compiler infers length
```

---

## 14. Strings

C has no built-in high-level string type. A C string is a sequence of `char` values ending with a null character, `'\0'`.

```c
char greeting[] = "Hello";
```

The array contains six characters including the final null terminator.

### Common string functions

Include `<string.h>`:

```c
strlen(text);          // Length before the null terminator
strcmp(a, b);          // Compare strings
strchr(text, 'x');     // Find a character
strstr(text, "cat");   // Find a substring
```

- `strlen` does not count the null terminator.
- `strcmp` returns a negative value, zero, or a positive value; do not assume it returns only `-1`, `0`, or `1`.
- `strcpy` and `strcat` require destination buffers large enough for the result. They do not check capacity.

### Compare strings correctly

```c
#include <string.h>

if (strcmp(command, "quit") == 0) {
    /* Handle quit command */
}
```

Do not compare string contents with `==`; that compares pointer values in pointer expressions, not the text they point to.

### Copy text safely

```c
#include <stdio.h>
#include <string.h>

int main(void)
{
    char source[] = "Debian";
    char destination[20];

    if (snprintf(destination, sizeof destination, "%s", source) >=
        (int)sizeof destination) {
        fprintf(stderr, "Text was truncated\n");
        return 1;
    }

    puts(destination);
    return 0;
}
```

For simple fixed-size buffers, `snprintf` can help avoid writing past the destination. Always check its return value when truncation matters.

---

## 15. Pointers

A pointer stores the address of an object or function, or can hold a null pointer.

```c
int number = 42;
int *pointer = &number;

printf("%d\n", number);
printf("%p\n", (void *)&number);
printf("%d\n", *pointer);
```

- `&number`: address-of operator.
- `int *pointer`: pointer to an `int`.
- `*pointer`: dereference the pointer to access the pointed-to integer.

### Modify a value through a pointer

```c
int number = 10;
int *pointer = &number;

*pointer = 99;
// number is now 99
```

### Null pointers

```c
int *pointer = NULL;

if (pointer != NULL) {
    printf("%d\n", *pointer);
}
```

Never dereference a null, uninitialized, dangling, or otherwise invalid pointer.

### Pointers and arrays

In many expressions, an array name converts to a pointer to its first element.

```c
int values[] = {10, 20, 30};
int *p = values;

printf("%d\n", *p);       // 10
printf("%d\n", *(p + 1)); // 20
printf("%d\n", p[2]);     // 30
```

Pointer arithmetic is only defined within an array object and one position past its end. The one-past pointer must not be dereferenced.

### `const` and pointer parameters

```c
void print_value(const int *value)
{
    if (value != NULL) {
        printf("%d\n", *value);
    }
}
```

The `const int *` communicates that the function will not modify the pointed-to integer through this pointer.

---

## 16. Dynamic memory allocation

Include `<stdlib.h>` for `malloc`, `calloc`, `realloc`, and `free`.

Dynamic memory is useful when the amount of memory needed is determined at runtime. Every successful allocation that is no longer needed must be released, and pointers must not be used after their allocation is freed.

### `malloc`

```c
#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    size_t count = 10;
    int *values = malloc(count * sizeof *values);

    if (values == NULL) {
        fprintf(stderr, "Memory allocation failed\n");
        return 1;
    }

    for (size_t i = 0; i < count; i++) {
        values[i] = (int)i;
    }

    free(values);
    values = NULL;
    return 0;
}
```

`malloc` returns uninitialized storage. Do not read values until you have initialized them.

### `calloc`

```c
int *values = calloc(count, sizeof *values);
```

`calloc` allocates space for an array and initializes all bytes to zero. Check the result for `NULL`.

### `realloc`

Use a temporary pointer so the original allocation is not lost if `realloc` fails:

```c
int *temporary = realloc(values, new_count * sizeof *values);

if (temporary == NULL) {
    /* values is still valid; handle the failure */
} else {
    values = temporary;
}
```

Check that `new_count * sizeof *values` cannot overflow before allocating when `new_count` may be large. If `realloc` succeeds, the old pointer must no longer be used. If it fails for a nonzero requested size, the original allocation remains valid.

### Memory rules

- Do not access memory beyond the allocation.
- Do not use memory after `free`.
- Do not free the same allocation twice.
- Do not free memory that was not dynamically allocated.
- Free each allocation on all relevant code paths.
- Prefer automatic/local variables when dynamic allocation is not necessary.

---

## 17. Structures, unions, and enumerations

### `struct`

A structure groups related fields.

```c
struct Person {
    char name[50];
    int age;
};

struct Person person = {"Alex", 30};
printf("%s is %d\n", person.name, person.age);
```

Use `.` to access a structure field, and `->` to access a field through a pointer to a structure.

```c
struct Person *p = &person;
printf("%s\n", p->name);
```

### `typedef`

```c
typedef struct {
    int x;
    int y;
} Point;

Point origin = {0, 0};
```

`typedef` creates an alias for a type; it does not create a new distinct type.

### `enum`

```c
enum Direction {
    NORTH,
    EAST,
    SOUTH,
    WEST
};

enum Direction heading = NORTH;
```

By default, enumeration constants start at zero and increase by one.

### `union`

```c
union Value {
    int integer;
    float decimal;
};
```

A union's members share the same storage. It can hold a value represented by one member at a time; reading a different member than the one most recently written requires care and is subject to C's rules.

---

## 18. Scope, lifetime, and storage duration

- **Block scope:** a name declared inside a block is generally visible from its declaration to the end of that block.
- **File scope:** a name declared outside functions is visible from its declaration to the end of the source file, subject to linkage rules.
- **Automatic storage duration:** common for local variables; storage exists during the relevant block execution.
- **Static storage duration:** objects declared at file scope and objects declared `static` in a block exist for the program's lifetime.
- **Allocated storage duration:** memory obtained dynamically, for example with `malloc`, remains allocated until released.

### Local variable

```c
void example(void)
{
    int count = 0; // Automatic storage duration
    count++;
}
```

### Static local variable

```c
int next_id(void)
{
    static int id = 0;
    return ++id;
}
```

The static local variable retains its value between calls.

### `extern` and `static` at file scope

- `extern` can declare an object or function defined elsewhere.
- `static` at file scope gives an object or function internal linkage, restricting its name to that translation unit.

---

## 19. Header files and preprocessor

### Include standard headers

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
```

Angle brackets are commonly used for system or standard headers. Quotation marks are commonly used for project headers:

```c
#include "utils.h"
```

### Header guards

In `utils.h`:

```c
#ifndef UTILS_H
#define UTILS_H

int add(int a, int b);

#endif
```

Header guards prevent the same header's contents from being processed repeatedly within a translation unit.

### Macros

```c
#define ARRAY_LENGTH 10
#define SQUARE(x) ((x) * (x))
```

Macros are text substitutions. Parentheses help prevent precedence surprises, but macros can still have pitfalls: `SQUARE(i++)` evaluates its argument more than once. Prefer functions when possible.

### Conditional compilation

```c
#ifdef DEBUG
    puts("Debug mode");
#endif
```

Compile with `-DDEBUG` to define `DEBUG`:

```bash
gcc -DDEBUG program.c -o program
```

---

## 20. File input and output

Include `<stdio.h>`.

### Open, read, and close a file

```c
#include <stdio.h>

int main(void)
{
    FILE *file = fopen("notes.txt", "r");

    if (file == NULL) {
        perror("notes.txt");
        return 1;
    }

    char line[256];

    while (fgets(line, sizeof line, file) != NULL) {
        fputs(line, stdout);
    }

    if (ferror(file)) {
        perror("Reading notes.txt");
        fclose(file);
        return 1;
    }

    if (fclose(file) == EOF) {
        perror("Closing notes.txt");
        return 1;
    }

    return 0;
}
```

### Common file modes

| Mode | Purpose |
|---|---|
| `"r"` | Read existing file |
| `"w"` | Write; create or truncate file |
| `"a"` | Append; create if needed |
| `"r+"` | Read and write existing file |
| `"w+"` | Read and write; create or truncate |
| `"a+"` | Read and append; create if needed |
| `"rb"` / `"wb"` | Binary read/write modes |

On Unix-like systems, text and binary modes are usually equivalent, but the distinction matters on some other platforms.

### Write text to a file

```c
FILE *file = fopen("output.txt", "w");

if (file == NULL) {
    perror("output.txt");
    return 1;
}

if (fprintf(file, "Hello, file!\n") < 0) {
    perror("Writing output.txt");
    fclose(file);
    return 1;
}

if (fclose(file) == EOF) {
    perror("Closing output.txt");
    return 1;
}
```

Check file operations for errors, especially when data must not be lost.

---

## 21. Error handling and debugging

### Return status codes

By convention, return `0` from `main` for success and a nonzero value for failure.

```c
if (something_failed) {
    fprintf(stderr, "Operation failed\n");
    return 1;
}
```

### `perror`

```c
FILE *file = fopen("missing.txt", "r");

if (file == NULL) {
    perror("fopen");
}
```

`perror` prints a message associated with the current `errno` value. Use it promptly after the failing operation.

### Debug with GDB

Compile with debugging information:

```bash
gcc -g -O0 -Wall -Wextra program.c -o program
gdb ./program
```

Useful GDB commands:

```text
break main
run
next
step
print variable_name
backtrace
continue
quit
```

- `break`: set a breakpoint.
- `run`: start the program.
- `next`: execute the next source line without stepping into a function.
- `step`: step into a function call.
- `print`: inspect a value.
- `backtrace`: show the call stack.
- `continue`: resume execution.

### Inspect program exit status in Bash

```bash
./program
echo $?
```

`$?` contains the exit status of the most recently executed command.

---

## 22. Bitwise operations

Bitwise operators work on individual bits of integer values.

```c
unsigned int a = 0b1100; // Binary literal is available in C23, not standard C17
unsigned int b = 0b1010;
```

For C17, use decimal or hexadecimal literals instead:

```c
unsigned int a = 12; // 1100 in binary
unsigned int b = 10; // 1010 in binary
```

| Operator | Meaning |
|---|---|
| `&` | Bitwise AND |
| `|` | Bitwise OR |
| `^` | Bitwise XOR |
| `~` | Bitwise complement |
| `<<` | Left shift |
| `>>` | Right shift |

Example:

```c
unsigned int a = 12; // 1100
unsigned int b = 10; // 1010

printf("%u\n", a & b); // 8  (1000)
printf("%u\n", a | b); // 14 (1110)
printf("%u\n", a ^ b); // 6  (0110)
printf("%u\n", a << 1); // 24
```

### Test, set, and clear a bit

```c
unsigned int flags = 0;
unsigned int mask = 1u << 2; // Bit 2

flags |= mask;       // Set bit 2
if ((flags & mask) != 0) {
    puts("Bit is set");
}
flags &= ~mask;      // Clear bit 2
flags ^= mask;       // Toggle bit 2
```

Use unsigned types for bit manipulation. Shift counts must be valid for the type width; invalid shifts can cause undefined behavior.

---

## 23. Common standard library headers

| Header | Common use |
|---|---|
| `<stdio.h>` | Standard input/output and files |
| `<stdlib.h>` | Allocation, conversions, process utilities |
| `<string.h>` | String and memory operations |
| `<stdbool.h>` | Boolean aliases in pre-C23 code |
| `<stdint.h>` | Fixed-width integer types |
| `<inttypes.h>` | Formatting and scanning fixed-width integers |
| `<stddef.h>` | `size_t`, `ptrdiff_t`, `NULL`, `offsetof` |
| `<limits.h>` | Integer type limits |
| `<float.h>` | Floating-point limits |
| `<math.h>` | Mathematical functions |
| `<ctype.h>` | Character classification/conversion |
| `<errno.h>` | Error number macros |
| `<time.h>` | Time and date functions |
| `<assert.h>` | Development-time assertions |

Example using `<math.h>`:

```c
#include <math.h>
#include <stdio.h>

int main(void)
{
    double result = sqrt(81.0);
    printf("%.1f\n", result);
    return 0;
}
```

On many Linux GCC setups, link the math library with `-lm`:

```bash
gcc program.c -o program -lm
```

---

## 24. Common mistakes and safe practices

- **Using `=` instead of `==`:** `if (x = 5)` assigns `5`; `if (x == 5)` compares.
- **Uninitialized variables:** initialize local variables before reading them.
- **Out-of-bounds arrays:** check indices and buffer lengths.
- **Invalid pointers:** never dereference a pointer unless it points to a valid object.
- **Memory leaks:** release dynamically allocated memory when no longer needed.
- **Use-after-free:** do not use pointers to memory after it has been freed.
- **String buffer overflow:** ensure destination capacity; avoid `gets`.
- **Incorrect format specifiers:** match `printf`/`scanf` specifiers to argument types.
- **Ignoring return values:** check file operations, allocations, input, and other fallible calls.
- **Integer division surprise:** use floating-point operands when fractional results are intended.
- **Signed overflow:** do not rely on overflow wrapping.
- **Confusing `&` and `&&`:** `&` is bitwise AND (or address-of in unary form); `&&` is logical AND.
- **Confusing `|` and `||`:** `|` is bitwise OR; `||` is logical OR.
- **Comparing strings with `==`:** use `strcmp` for string contents.
- **Relying on undefined behavior:** the compiler is not required to make invalid operations behave as expected.

A useful beginner compile command is:

```bash
gcc -std=c17 -Wall -Wextra -Wpedantic -g program.c -o program
```

Treat warnings as opportunities to understand the code more deeply.

---

## 25. Small complete examples

### Example A: Read two integers and add them

```c
#include <stdio.h>

int main(void)
{
    int a;
    int b;

    printf("Enter two integers: ");

    if (scanf("%d %d", &a, &b) != 2) {
        fprintf(stderr, "Please enter two valid integers.\n");
        return 1;
    }

    printf("Sum: %d\n", a + b);
    return 0;
}
```

Compile and run:

```bash
gcc -std=c17 -Wall -Wextra -Wpedantic add.c -o add
./add
```

Note: for untrusted input or production-grade numeric parsing, use a more robust approach such as `fgets` followed by `strtol`, checking errors and range.

### Example B: Count characters in a line

```c
#include <stdio.h>
#include <string.h>

int main(void)
{
    char line[256];

    printf("Enter a line: ");

    if (fgets(line, sizeof line, stdin) == NULL) {
        fprintf(stderr, "Could not read input.\n");
        return 1;
    }

    size_t length = strcspn(line, "\n");
    printf("Characters before newline: %zu\n", length);

    return 0;
}
```

If the input line is longer than the buffer, this counts only the portion read. Handle long lines explicitly if that matters.

### Example C: Find the largest number in an array

```c
#include <stdio.h>
#include <stddef.h>

int main(void)
{
    int numbers[] = {12, 4, 99, 37, 18};
    size_t count = sizeof numbers / sizeof numbers[0];
    int largest = numbers[0];

    for (size_t i = 1; i < count; i++) {
        if (numbers[i] > largest) {
            largest = numbers[i];
        }
    }

    printf("Largest: %d\n", largest);
    return 0;
}
```

This example assumes the array has at least one element.

---

## Quick command reference

```bash
# Compile with warnings and debug symbols
gcc -std=c17 -Wall -Wextra -Wpedantic -g program.c -o program

# Run
./program

# Compile multiple source files
gcc -std=c17 -Wall -Wextra -Wpedantic main.c utils.c -o app

# Debug
gdb ./program

# Run with AddressSanitizer and UndefinedBehaviorSanitizer
gcc -g -fsanitize=address,undefined program.c -o program
./program
```

**Beginner recommendation:** learn types and expressions first, then conditionals and loops, functions, arrays and strings, pointers, and finally dynamic memory and file I/O. Write small programs, compile with warnings, and investigate each warning rather than simply removing it.
