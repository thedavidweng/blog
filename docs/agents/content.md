# Post content and frontmatter

- Every post has matching English (`en`) and Chinese (`zh`) versions with the same slug.
- Frontmatter YAML booleans must use `true` or `false` (`True`, `False`, `TRUE`, `FALSE` are also valid). `no`, `yes`, `on`, `off` are parsed as strings and rejected by `z.boolean()`. Use `draft: false`, not `draft: no`.
- Giscus threads are keyed by slug: the two languages intentionally share the same comments. Do not switch the mapping.
- Follow the [writing style guide](../writing-style-guide.md) for article prose.
