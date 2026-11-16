# Privacy

What A11yFix AI reads, what it stores and what leaves your browser. This describes the code in this repository
(extension version in `package.json`); there is no server behind the extension.

## Summary

- The audit itself runs entirely in your browser. A classic scan sends nothing anywhere.
- The only network request the extension makes is to the OpenAI API (`https://api.openai.com/v1/chat/completions`),
  and only when you click **Generate AI fix** or run the **deep scan**.
- There is no analytics, telemetry, crash reporting or account. The author receives no data.

## What is sent to OpenAI, and when

| Action              | What is sent                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Generate AI fix** | The rule that failed, its description, and for up to 3 affected elements: the CSS selector and the element's HTML. |
| **Deep scan**       | A pruned copy of the whole rendered page (up to 150,000 characters) and a short list of computed styles.           |

Both requests carry your OpenAI API key (that is how OpenAI authenticates you) and the interface language.

The deep scan removes `<script>`, `<style>`, `<noscript>`, `<template>`, `<link>` and `<object>` elements and most
attributes, and shortens long text and attribute values. **It keeps visible text, link and image URLs, and the
`value` of form fields.** If the page shows personal or confidential data, or you have typed into a form, that
content is part of what is sent. Do not run the deep scan on such a page unless your agreement with OpenAI allows
it.

What OpenAI does with the request is governed by OpenAI's terms for the API key you supplied, not by this
extension.

## What is stored, and where

| Data                                                          | Where                  | Leaves the device?                                     |
| ------------------------------------------------------------- | ---------------------- | ------------------------------------------------------ |
| Settings: OpenAI API key, model, language, plan               | `chrome.storage.local` | No, except the key in requests to OpenAI               |
| Generated fixes (cache)                                       | `chrome.storage.local` | No                                                     |
| Last 10 scans: URL, page title, date, score, number of issues | `chrome.storage.local` | No                                                     |
| Monthly scan counter (month and a number)                     | `chrome.storage.sync`  | Synced by Chrome to your other browsers, if sync is on |

The API key is stored unencrypted in the browser profile, like any extension setting. Anyone with access to your
browser profile can read it. Removing the extension deletes everything it stored.

## Permissions

| Permission                       | Why                                                                                |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| `activeTab`, `scripting`, `tabs` | Inject the audit script into the page you ask to scan, and read its URL and title. |
| `<all_urls>` (host permission)   | Let you scan any site. The script is injected on demand, never automatically.      |
| `storage`                        | Keep the settings, cache, history and counter listed above.                        |
| `sidePanel`                      | Show the results in Chrome's side panel.                                           |

## Contact

Questions or a correction: open an issue on the repository.
