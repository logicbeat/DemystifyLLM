# Test GitHub-Style Markdown Rendering

This is a test to verify that our markdown configuration renders content similar to GitHub's viewer.

## Code Blocks

Here's a JavaScript code block:

```javascript
function greetUser(name) {
  const greeting = `Hello, ${name}!`;
  console.log(greeting);
  return greeting;
}

// Call the function
greetUser("World");
```

### Python Example

```python
def calculate_fibonacci(n):
    """Calculate the nth Fibonacci number."""
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

# Generate first 10 Fibonacci numbers
for i in range(10):
    print(f"F({i}) = {calculate_fibonacci(i)}")
```

## Lists and Tables

### Unordered List
- First item
- Second item with **bold text**
- Third item with `inline code`
- Fourth item with [a link](https://github.com)

### Ordered List
1. Initialize the project
2. Configure dependencies
3. Write the code
4. Test thoroughly
5. Deploy to production

### Table Example

| Feature | GitHub | Our Implementation | Status |
|---------|--------|-------------------|--------|
| Syntax Highlighting | ✅ | ✅ | Complete |
| Tables | ✅ | ✅ | Complete |
| Links | ✅ | ✅ | Complete |
| Images | ✅ | ✅ | Complete |

## Blockquotes and Emphasis

> This is a blockquote with **bold text** and *italic text*.
> 
> It can span multiple lines and contain `inline code` as well.

## Inline Elements

Here's some text with **bold**, *italic*, and `inline code` formatting. 

External links like [GitHub](https://github.com) should open in new tabs, while internal links stay in the same tab.

## Images

![React Logo](https://reactjs.org/logo-og.png)

## Horizontal Rule

---

That's all for this test!