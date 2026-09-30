# Mini Streaks website

A plain static site with no build step: `index.html`, `style.css`, `download.js` and `assets/`.

- **Preview:** `python3 -m http.server 8000` from this folder, then open http://localhost:8000
- **Publish on Vercel:** import the repo and choose Framework Preset *Other*. There's no build command or output directory to set.
- **Downloads:** every button in `index.html` links straight to its installer in the [v0.2.0 release](https://github.com/Kim-Tsok/mini-streaks-app/releases/tag/v0.2.0) of `Kim-Tsok/mini-streaks-app`. `download.js` also asks GitHub for the newest published release, and if it's newer than v0.2.0 the buttons switch to its files.
- **Your system first:** the big button at the top detects the visitor's computer and offers the matching file:

  | Visitor | Button |
  | --- | --- |
  | Windows | Windows installer (`.exe`) |
  | Mac with Apple silicon | `aarch64.dmg` |
  | Intel Mac (detected in Chrome and Edge) | `x64.dmg` |
  | Fedora, RHEL, openSUSE and similar | Linux `.rpm` |
  | Ubuntu, Debian, Mint and similar | Linux `.deb` |
  | Any other Linux | AppImage |

  Under it, a "Not using …? See all downloads" link jumps to the full list. Browsers only reveal the Linux distro sometimes (Firefox on Fedora and Ubuntu does), so the AppImage is the safe default.
- **New release:** when you publish one, update the version in the `href`s in `index.html` and `BUNDLED_VERSION` in `download.js`, so the links still work if GitHub's API is unreachable.
