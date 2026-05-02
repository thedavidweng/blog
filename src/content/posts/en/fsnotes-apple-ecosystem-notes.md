---
title: "FSNotes - Open Source Notes in Apple Ecosystem"
locale: en
slug: "fsnotes-apple-ecosystem-notes"
description: "Software size is only 13.5 MB, but fully functional. macOS version is completely free, but offers paid download on Mac App Store to support the author's development. iOS version is paid, priced at ¥18 in China region. You can choose to use cloud services to sync to iOS and then use other Markdown-supported software for editing and viewing."
publishedDate: 2021-04-16
tags:
  - Tools
  - Translated
draft: true
---

## Introduction

FSNotes is an open-source note-taking software that supports macOS and iOS. The official website lists the following main features:

- Markdown-first, supports plain text and RTF files
- Lightweight and smooth, runs well even with 10k+ files
- iCloud Drive or Dropbox sync (any sync disk)
- Multi-folder storage, keyboard-centric operation, shortcuts inspired by nvALT
- Adaptive dual-pane view, optional vertical or horizontal layout
- External editor support, seamless real-time sync
- Supports code highlighting for over 170 programming languages
- Supports inline images
- Supports tags
- Supports note linking [[double brackets]]
- Supports pinning notes
- Supports quick copy of notes to clipboard
- Dark mode
- AES-256 encryption
- Supports Mermaid and MathJax
- Optional Git version control and backup

![](/posts/fsnotes-apple-ecosystem-notes/macOS-and-iOS.avif)

Software size is only 13.5 MB, but fully functional. macOS version is completely free, but offers paid download on Mac App Store to support the author's development. iOS version is paid, priced at ¥18 in China region. You can choose to use cloud services to sync to iOS and then use other Markdown-supported software for editing and viewing.

## Installation

macOS version can be installed using Homebrew:

```
brew install fsnotes
```

Or download from GitHub Releases page [GitHub Releases](https://github.com/glushchenko/fsnotes/releases)

## Usage

After completing the installation, the software has very detailed English usage tutorials built-in.

![](/posts/fsnotes-apple-ecosystem-notes/fsnotes-built-in-tutorial.avif)

I have translated it, and submitted an Issue on GitHub hoping to add multi-language support.

![](/posts/fsnotes-apple-ecosystem-notes/fsnotes-github-issue-panel.avif)

Next is the usage tutorial translated by myself.

### 1. Introduction

Hi, my name is Oleksandr, and I am the author of this program. A few years ago, I found that my favorite note-taking app nvALT no longer launched.

Existing macOS and iOS alternatives didn't suit me, and since I had been a developer for many years, I tried to write my own solution. In the summer of 2017, I published the source code of FSNotes on GitHub. It was a terrible application. Very bad, with poor functionality. But I didn't give up, and neither did the contributors.

Now, FSNotes has been translated into 12 languages, with users all over the world. The number of features exceeds one hundred, dozens of which are unique.

If you like this application, please support the development. Purchase on App Store [Mac App Store](https://apps.apple.com/app/fsnotes/id1277179284) and get the mobile version of FSNotes on [AppStore](https://apps.apple.com/app/fsnotes-manager/id1346501102).

Best regards, FSNotes developer, Oleksandr Hlushchenko Email: support@fsnot.es

### 2. Links

[[1. Introduction](about:blank#%E5%BC%95%E8%A8%80)] [[2. Links](about:blank#%E9%93%BE%E6%8E%A5)] [[3. Shortcuts](about:blank#%E5%BF%AB%E6%8D%B7%E9%94%AE)] [[4. Sidebar](about:blank#%E4%BE%A7%E8%BE%B9%E6%A0%8F)] [[5. Tags and Subtags](about:blank#%E6%A0%87%E7%AD%BE%E5%92%8C%E5%AD%90%E6%A0%87%E7%AD%BE)] [[6. Mermaid and MathJax](about:blank#mermaid-%E4%B8%8E-mathjax)] [[7. Git-based Version Control](about:blank#%E5%9F%BA%E4%BA%8E-git-%E7%9A%84%E7%89%88%E6%9C%AC%E6%8E%A7%E5%88%B6)] [[8. Container](about:blank#%E5%AE%B9%E5%99%A8)] [[9. GitHub Flavored Markdown](about:blank#github-flavored-markdown)] Note: The above content can only be clicked to jump within FSNotes software

Official website: https://fsnot.es Issues: https://github.com/glushchenko/fsnotes/issues Wiki: https://github.com/glushchenko/fsnotes/wiki Announcements: https://twitter.com/fsnotesapp

### 3. Shortcuts

FSNotes supports pure keyboard operation and is a shortcut-friendly application.

The most important key combinations you must learn are:

`cmd - backtick` - Use CMD + backtick (the one above TAB) to disable/enable preview mode.

Alternative: You can also complete the above operation through **View - Toggle Preview** in the menu bar `View - Toggle Preview`

### Global

- `cmd + option + shift + L` - Open main window and focus on search bar
- `cmd + option + shift + n` - Save clipboard
- `enter` - Move right to folder level (down); sidebar > note list > note
- `cmd + enter` - Move left to folder level (up); note > note list > sidebar

### Search Bar

- `down arrow` - Use down arrow to move focus to note list
- `enter` - Return to create new note

### Main Window

- `esc` - Move cursor to search bar and clear screen (does not delete editing content)
- `cmd + L` - Focus on search bar
- `tab` - TAB to next area
- `cmd + backtick` - CMD + backtick preview mode (Markdown only)
- `up, down arrows` - Down arrow to select note
- `cmd + j` - Next note
- `cmd + k` - Previous note

### Note List

- `cmd + delete` - Delete note
- `cmd + r` - Rename note
- `cmd + 8` - Pin note
- `cmd + 7` - Remove encryption (decrypt previously encrypted notes)
- `cmd + n` - New note
- `cmd + shift + n` - New RTF
- `ctrl + cmd + e` - Open selected content in external editor
- `ctrl + cmd + o` - Show selected content in Finder
- `shift + cmd + m` - Move selected note in storage
- `shift + cmd + b` - Hide sidebar
- `cmd + s` - Save revision in Git
- `cmd + d` - Create note copy
- `cmd + alt + l` - Encrypt/decrypt note (AES 256)

### Editing

- `fn + f5` - Auto-complete note name
- `cmd + backtick`, or click `View - Toggle preview` - Used to enable or disable Markdown preview

### 4. Sidebar

To toggle project and tag sidebar button `control + cmd + shift + b`

You can select and filter unlimited projects and tags.

### Each Subfolder is a Project

Create unlimited folders in your storage space. Right-click the root directory (`Documents`) and click "New Folder" `⌥ option + ⇧ shift + n`.

Each project has its own settings, right-click the project - "Show View Options" `cmd + shift + ,`.

![](/posts/fsnotes-apple-ecosystem-notes/view-options.avif)
View

You can configure sorting, direction, visibility settings.

![](/posts/fsnotes-apple-ecosystem-notes/preferences.avif)
Preference

### 5. Tags and Subtags

FSNotes version 4 brings an amazing inline tag system. Just add a hash (#) in front of the text to add tags to notes. Like this: #hello. Or, add subtags to them like this: #hello/world. How many tags can you put on your notes? Like #unlimited/sub/tags. Tags auto-complete. Type hash (#) and the first character of the tag, then:

![](/posts/fsnotes-apple-ecosystem-notes/tag-autocomplete.avif)
Hello

Very good! There's more. Each project has its own tag namespace. For example, when selecting "Archive", only tags from notes in "Archive" are displayed.

Hold down while selecting in sidebar

```
cmd
```

You can multi-select multiple projects and tags.

![](/posts/fsnotes-apple-ecosystem-notes/git-save.avif)

### 6. Mermaid and MathJax

### Mermaid Flowchart Example

Supported documentation: https://mermaidjs.github.io

```
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts <br/>prevail!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!
```

### MathJax Math Formula Example

Supported documentation: https://www.mathjax.org

> Please enable in menu bar: View > Preview MathJax

When ((*a* ≠ 0)), there are two solutions for *a**x*2 + *b**x* + *c* = 0 which are $$x = {-b \pm \sqrt{b^2-4ac} \over 2a}.$$

### 7. Git-based Version Control

Use `cmd + s` shortcut to save notes:

![](/posts/fsnotes-apple-ecosystem-notes/git-commit-dialog.avif)
Save

And restore to historical versions in the menu bar:

![](/posts/fsnotes-apple-ecosystem-notes/git-history.avif)
History

### Automatic Backup of All Notes

Configure in preferences:

![](/posts/fsnotes-apple-ecosystem-notes/backup-settings.avif)
Backup

For example, backup once per hour.

### You Can Also Backup the Backup 🤪

After all, one can never be too safe.

![](/posts/fsnotes-apple-ecosystem-notes/backup-backup.avif)
BackupBackup

### 8. Container

What is a container? A "container" is a folder that stores your files. A container saves the text and other resources used in a note. Of course, you can choose not to use a container. Open Preferences -> Basic -> Container and select "None". Notes will be stored in plain text, Markdown, or RTF format.

I recommend using TextBundle container and encrypted TextBundle container for sensitive data. Please read on.

### TextBundle Container

File extension – `.textbundle`

TextBundle – This format is designed to provide a more seamless user experience when exchanging plain text files (such as Markdown or RTF) between applications. http://textbundle.org

For example, a Markdown file may contain references to external images. When sending such a file from a Markdown editor to a previewer, the user must explicitly specify the location of each image file. This is where TextBundle comes in handy. By packaging Markdown text and all referenced images in one file, Text Bundle provides a more convenient experience.

### Encrypted TextBundle Container

File extension – `.etp`.

Encrypted text bundle is used for note encryption. It is an encrypted text bundle (compressed package) and encrypted with RNCryptor. RNCryptor is a cross-platform data format with many implementation schemes. In the software background, we have:

AES-256 encryption CBC mode PBKDF2 password stretching password salting random IV encrypted HMAC open and cross-platform

You can use Python or Ruby, JS, etc. to decrypt any FSNotes notes (full list can be found here) decompress and use in plain text format freely.

### 9. GitHub Flavored Markdown

### Headers h1-h6

Shortcut: `cmd + 1-6`

### Images

![](/posts/fsnotes-apple-ecosystem-notes/image-toolbar.avif)
icon

Shortcut: `cmd + shift + i`

### Bold, Italic, Strikethrough

**Bold** Shortcut: `cmd + b`

*Italic* Shortcut: `cmd + i`

~~Strikethrough~~ Shortcut: `cmd + y`

### Quote

> You can quote more than one line

Shortcut: `cmd + shift + u`

### Code Block

Swift example:

```
public static func getHighlighter() -> Highlightr? {
    if let instance = self.hl {
        return instance
    }

    guard let highlightr = Highlightr() else {
        return nil
    }

    highlightr.setTheme(to: "vs")
    self.hl = highlightr

    return self.hl
}
```

SQL example:

```
CREATE TABLE "topic" (    "id" serial NOT NULL PRIMARY KEY,    "forum_id" integer NOT NULL,    "subject" varchar(255) NOT NULL);ALTER TABLE "topic"ADD CONSTRAINT forum_id FOREIGN KEY ("forum_id")REFERENCES "forum" ("id");-- Initialsinsert into "topic" ("forum_id", "subject")values (2, 'D''artagnian');
```

Shortcut: `cmd + control + c`

### Code Span

`One line code span`

Shortcut: `cmd + shift + c`

### List, Numbered List and Todo

- List

Shortcut: `control + L`

1. First item

1. Second item

Shortcut: `control + shift + L`

- Pay the bill
- Buy water

Shortcut: `cmd + t`

### Wiki Links

Add Wiki links [[WikiLinks with emoji 😎]]

Shortcut: `cmd + 9`

## Summary

The above is the FSNotes usage tutorial, which basically demonstrates the common usage scenarios of FSNotes. As a Markdown-focused note-taking software, its advantages and disadvantages are very obvious. For friends who already have Markdown usage experience, they should already have a set of workflows for managing `.md` files. But for beginners, getting familiar with Markdown usage through a note-taking software that is more like traditional note software (Evernote, OneNote) can be a very friendly introductory choice.
