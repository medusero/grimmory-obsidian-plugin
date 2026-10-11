# Grimmory Sync

An Obsidian plugin that syncs your book highlights and notes from a self-hosted [Grimmory](https://github.com/grimmory-tools/grimmory) instance into your vault.

Each book becomes a Markdown note: highlights as blockquotes with their notes underneath, grouped by chapter and ordered by their position in the book. On re-sync only the managed zone of the note is rewritten — the span between its `gs:start` and `gs:end` HTML-comment markers; anything else you add, including the frontmatter, is left untouched.

Works on desktop and mobile.

> **Disclaimer:** This is an unofficial, community-made plugin and is not affiliated with or endorsed by the Grimmory project.

## Installation

### From Obsidian's community plugins

1. Open **Settings -> Community plugins**. If you haven't already, select **Turn on community plugins**.
2. Select **Browse**, search for **Grimmory Sync**, and select **Install**.
3. Select **Enable**.

Grimmory Sync has passed Obsidian's automated checks and is awaiting manual review, so its listing currently shows a "not yet reviewed by the Obsidian team" notice. Installing, enabling, and updating all work as usual in the meantime.

### Manual installation

1. Download `main.js` and `manifest.json` from the [latest release](https://github.com/medusero/grimmory-obsidian-plugin/releases/latest).
2. In your vault, create the folder `.obsidian/plugins/grimmory-sync/` and copy both files into it. On some systems `.obsidian` is hidden; enable hidden files in your file manager to see it.
3. Reload Obsidian, then enable **Grimmory Sync** under **Settings -> Community plugins -> Installed plugins**.

## Configuration

In *Settings → Grimmory Sync*:

| Setting                 | Description                                                                         |
| ----------------------- | ----------------------------------------------------------------------------------- |
| **Base URL**            | The URL of your Grimmory instance.                                                  |
| **Username / Password** | Used once to obtain an access token; never stored. Click **Login**.                 |
| **Folder**              | Vault folder where notes are created (defaults to the vault root).                  |
| **Prefix**              | Optional prefix for file names (e.g. `notes on romeo and juliet.md`).               |
| **Heading level**       | Heading level (H1–H6) for chapter titles.                                           |
| **Label**               | Text placed before each note (defaults to `**Note:** `; leave blank if you prefer). |

## Usage

Run a sync from the ribbon icon (**Sync Grimmory**) or the **Grimmory Sync: Sync notes** command in the command palette.

- If a book has no note, one is created.
- If it already has one, only its managed zone is updated; everything else is kept.
- To stop syncing a book, change `gs-state` from `active` to any other value in its note's frontmatter, or remove `gs-state` and `gs-book-id` and delete the plugin's `gs:start` / `gs:end` marker lines entirely.

## License

[MIT](LICENSE)
