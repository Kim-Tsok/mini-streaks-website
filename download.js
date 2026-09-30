// Points the download buttons at the right installer.
// The links in index.html go straight to the v0.2.0 files. If GitHub reports a
// newer published release, the buttons switch to that one instead.
// Change REPO if the app moves.
const REPO = 'Kim-Tsok/mini-streaks-app';
const RELEASES = `https://github.com/${REPO}/releases`;
const BUNDLED_VERSION = '0.2.0';

// How to recognise each installer tauri-action uploads.
const MATCHERS = {
  exe: n => /-setup\.exe$/i.test(n),
  msi: n => /\.msi$/i.test(n),
  'dmg-arm': n => /(aarch64|arm64).*\.dmg$/i.test(n),
  'dmg-intel': n => /(x64|x86_64|intel).*\.dmg$/i.test(n),
  appimage: n => /\.AppImage$/i.test(n),
  deb: n => /\.deb$/i.test(n),
  rpm: n => /\.rpm$/i.test(n),
};

// What each download is called on the big button.
const LABEL = {
  exe: 'Windows',
  msi: 'Windows (.msi)',
  'dmg-arm': 'Mac (Apple silicon)',
  'dmg-intel': 'Mac (Intel)',
  appimage: 'Linux (AppImage)',
  deb: 'Linux (.deb)',
  rpm: 'Linux (.rpm)',
};

const OS_NAME = { windows: 'Windows', mac: 'macOS', linux: 'Linux' };

// Browsers only hint at the Linux distro (Firefox on Fedora and Ubuntu puts it
// in the user agent), so anything unrecognised gets the AppImage, which runs anywhere.
const RPM_DISTROS = /fedora|red ?hat|rhel|centos|rocky|alma|opensuse|suse|mageia/;
const DEB_DISTROS = /ubuntu|debian|mint|pop!?_?os|elementary|kali|raspbian|zorin/;

function detectOS() {
  const p = (navigator.userAgentData?.platform || navigator.platform || navigator.userAgent).toLowerCase();
  if (p.includes('win')) return 'windows';
  if (p.includes('mac')) return 'mac';
  if (p.includes('linux') || p.includes('x11')) return 'linux';
  return null;
}

async function pickAsset(os) {
  if (os === 'windows') return 'exe';
  if (os === 'linux') {
    const ua = navigator.userAgent.toLowerCase();
    if (RPM_DISTROS.test(ua)) return 'rpm';
    if (DEB_DISTROS.test(ua)) return 'deb';
    return 'appimage';
  }
  if (os === 'mac') {
    // Only Chromium browsers can tell Apple silicon from Intel; the rest get Apple silicon.
    try {
      const { architecture } = await navigator.userAgentData.getHighEntropyValues(['architecture']);
      if (architecture === 'x86') return 'dmg-intel';
    } catch {}
    return 'dmg-arm';
  }
  return null;
}

// Reads the links already in the page, so the bundled release works without GitHub's API.
function currentLinks() {
  const urls = {};
  document.querySelectorAll('[data-asset]').forEach(a => {
    if (a.href.startsWith('https://github.com/')) urls[a.dataset.asset] = a.href;
  });
  return urls;
}

function setLinks(urls) {
  document.querySelectorAll('[data-asset]').forEach(a => {
    a.href = urls[a.dataset.asset] || RELEASES;
  });
}

function showRelease(version, os, asset, urls) {
  document.getElementById('release-line').textContent = `Version ${version}. Pick the file for your computer.`;
  const note = document.getElementById('primary-note');
  if (!asset || !urls[asset]) {
    note.textContent = `Version ${version}, free for Linux, Windows and macOS.`;
    return;
  }
  const primary = document.getElementById('primary-download');
  primary.href = urls[asset];
  primary.textContent = `Download for ${LABEL[asset]}`;
  note.textContent = `Version ${version}, free. `;
  const other = document.createElement('a');
  other.href = '#download';
  other.textContent = `Not using ${OS_NAME[os]}? See all downloads`;
  note.append(other);
}

async function init() {
  document.getElementById('all-releases').href = RELEASES;
  document.getElementById('source-link').href = `https://github.com/${REPO}`;

  const os = detectOS();
  if (os) document.querySelector(`.platform[data-os="${os}"]`)?.classList.add('is-yours');
  const asset = await pickAsset(os);

  showRelease(BUNDLED_VERSION, os, asset, currentLinks());

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) throw new Error(`GitHub said ${res.status}`);
    const release = await res.json();
    const version = (release.tag_name || '').replace(/^v/, '');
    if (!version || version === BUNDLED_VERSION) return;
    const urls = {};
    for (const a of release.assets || []) {
      for (const [key, test] of Object.entries(MATCHERS)) {
        if (!urls[key] && test(a.name)) urls[key] = a.browser_download_url;
      }
    }
    setLinks(urls);
    showRelease(version, os, asset, urls);
  } catch {
    // Offline or rate-limited: the bundled v0.2.0 links stay in place.
  }
}

init();
