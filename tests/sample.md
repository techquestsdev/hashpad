# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

## Inline styles

**bold**, __bold too__, *italic*, _italic too_, ~~strike~~, ==marked==
`inline code` and a \*escaped\* asterisk

## Nested emphasis

**bold with _italic_ and [a link](https://example.com)**
*italic with `code`*
~~strike with **bold**~~
==mark with _italic_==
**a *b* c**

## Links and images

[Inline link](https://example.com "with title")
[Mail link](mailto:test@example.com)
[Unsafe link](javascript:alert(1))
Bare URL: https://example.com/path?x=1
Autolink: <https://example.com>
![alt text](https://example.com/img.png "image title")
[Reference link][ref] and a footnote[^1]

[ref]: https://example.com
[^1]: Footnote text

## Lists

- dash item
* star item
+ plus item
  - nested dash with **bold**
1. first
2. second
3) paren style

- [ ] open task
- [x] done task
- [X] done task, capital X

## Blockquotes

> single level
> > nested level two
> > > nested level three
> quote with **bold**, `code` and [a link](https://example.com)

## Horizontal rules

---
***
___
- - -

## Table

| Name | Value |
|------|:-----:|
| a    | 1     |
| b    | 2     |

## Code blocks

```js
const x = 1; // **not bold** inside
```

~~~
tilde fence
~~~

Plain text at the end.
