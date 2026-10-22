# Homepage Editing Guide

This guide covers the VT320 scrolling homepage at `/`. The homepage is assembled by `index.html` using `_layouts/vt320-home.html`, styled in `_sass/_vt320.scss`, and enhanced by `assets/js/vt320.js`.

## Blog Posts

Create or edit Markdown files in `_posts/`. Use Jekyll's date-prefixed filename format:

```text
YYYY-MM-DD-short-post-name.md
```

A typical post starts with front matter like this:

```yaml
---
title: "A post title"
date: 2026-10-23
categories: [notes]
---

The first paragraph becomes the post excerpt shown on the homepage.

The rest of the post appears on its own post page.
```

The homepage loops through `site.posts`, so a new post appears automatically without editing the homepage template. Its title and date are generated from the post. The homepage displays `post.excerpt`; by default Jekyll uses the beginning of the post, or you can define an explicit `excerpt` in the post front matter.

The site currently has `future: true` in `_config.yml`, so posts dated in the future can appear in the generated site. Change that setting only if you want to hide scheduled posts.

## About And Identity

Edit the `author` values in `_config.yml`:

- `name`: terminal identity output and prompt name.
- `bio`: About text and terminal identity description.
- `location`: About location and the terminal's `pwd` output.
- `email`, `linkedin`, `github`: Contact links.

The About section reads the bio and location from these settings. Keep the existing YAML indentation and quote values containing punctuation or special characters.

## Terminal `ls topics/` Output

The current topic names are presentation text, not generated from posts. To change them, update both copies so the no-JavaScript fallback and animated terminal stay consistent:

- `_layouts/vt320-home.html`: the static `ls topics/` output inside the terminal.
- `assets/js/vt320.js`: the corresponding `ls topics/` output in `terminalLines`.

The `ls sections/` output is also presentation text. Its entries should match the homepage section IDs (`about`, `index`, `blog`, `contact`) if you change the sections.

## Index Links

The Index list is generated from `_data/navigation.yml` under `main`. Edit each item's `title` and `url` there to change the label or destination. The Blog Posts entry is special-cased to jump to the homepage's Blog section.

The fixed top navigation is separate and currently lists About, Index, Blog, and Contact directly in `_layouts/vt320-home.html`. If you add or rename a homepage section, update its top-nav link, its section `id`, and the `ls sections/` output together.

## Layout, Styling, And Motion

For text that is already data-driven, prefer editing `_config.yml`, `_posts/`, or `_data/navigation.yml`. Edit `_layouts/vt320-home.html` only to change the page structure or hardcoded terminal/presentation text. Edit `_sass/_vt320.scss` for colors, spacing, typography, and responsive styling. Edit `assets/js/vt320.js` for terminal typing, scroll reveals, active navigation, progress, or parallax behavior.

After editing, run the local Jekyll build/server so the generated homepage reflects the source changes. A post's content and permalink remain managed by its Markdown file and Jekyll front matter, not by the homepage template.
