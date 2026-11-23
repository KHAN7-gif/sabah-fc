# Local editing and GitHub Pages publication

The Admin tab is a local editor. It has no server login and does not publish or
change the public website automatically. Edits remain in the current browser.

1. Open Admin → Open local editor and enable Admin mode.
2. Edit the player or match and save.
3. Select **Export data for GitHub** to download `sabah-fc-data.json`.
4. Review the JSON, then update the repository's `published-data.json` with it.
   Give the public snapshot a new `revision` when publishing changed data so
   viewers' background refresh can detect the update.
5. Commit to `main` and wait for GitHub Pages deployment to succeed.

Viewers read `published-data.json`. Local drafts are kept separately; a draft
based on an older public revision can be recovered through the export action.
No password, account token or server secret belongs in the exported public file.

The local editor is accessible to every visitor but can only change that visitor's
browser data. Permission to write to the GitHub repository is required to publish.
