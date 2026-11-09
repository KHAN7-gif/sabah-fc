# Sabah FC TV — Android TV / Google TV

A small Java Android TV application that displays the public Sabah FC portal at
`https://sabah-fc.pages.dev/`. Website/data updates appear through the existing
portal refresh mechanism after Cloudflare has deployed them; no APK reinstall is
needed for those web updates. Internet and a working Android System WebView are
required. The TV layout uses a dark, Apple TV inspired interface with a fixed left
sidebar for Home, Matches, Table, Stats, Players, About and Admin. Admin publishing
still requires the portal's existing authentication; use a web browser for setup.
The regular website layout is unchanged.

## Install on your TV

1. Download `releases/Sabah-FC-TV-v1.1.0.apk` to your phone or computer.
2. Transfer it to Android TV/Google TV using USB or a TV file-transfer app.
3. On the TV, open the APK with a file manager and allow installation for that
   file manager if Android asks. Select Install.
4. Open **Sabah FC TV** from the TV applications list.

Version 1.1.0 (version code 2) uses the same signing certificate as 1.0.0 and can
be installed as an update. This sidebar redesign is bundled in the APK, so install
the new APK once; subsequent portal data refreshes continue automatically.

The APK supports Android 6/API 23 and later with a modern System WebView, and has
no native architecture-specific libraries (ARM/x86, 32/64-bit).

## Remote controls

- Up/Down moves through the sidebar. Right enters page content; Left from the
  first control returns to the active sidebar item.
- Arrow buttons move the visible focus ring between links, controls and players.
- OK opens the focused control; text fields use the TV keyboard and selects use
  Android's selection UI.
- Back closes a web popup, returns from a player/match, then returns to Home;
  Back from page content first focuses the sidebar; Back from Home in the sidebar
  exits the app.
- OK on an embedded YouTube video opens that video in the installed YouTube app
  or an available browser. Fullscreen WebView video is also supported.
- An offline/error screen offers Retry and Network Settings.

## Build

Requires Linux, Python 3.9+, Java 17+ runtime, and `keytool`. The build does not
modify the web project's dependencies or require Android Studio/Gradle.

```sh
python3 android-tv/tools/bootstrap.py --sdk-root /workspace/.tools/sabah-tv-sdk
python3 android-tv/build.py --sdk-root /workspace/.tools/sabah-tv-sdk
```

Bootstrap uses Google's pinned platform 35 r2 and build-tools 35.0.0, verifies them
against the official SDK catalogue and their published checksums, and downloads
the Eclipse ECJ 3.40.0 compiler from Maven Central with checksum verification. TLS
verification remains enabled. Android SDK license text is retained in the SDK
folder; terms are also at https://developer.android.com/studio/terms.

Output: `android-tv/build/Sabah-FC-TV-v1.1.0.apk`.

This version uses a development signing certificate for direct installation; it
is not a Google Play release. The signing key is kept outside the repository at
`/workspace/.keys/sabah-fc-tv-debug.keystore`. Preserve it securely to sign compatible
future updates; a different signing key requires uninstalling the previous APK.
Never commit a private signing key. Google Play publication and production signing
are separate work.

## Verification

- Java compilation and Android DEX compilation passed.
- `apksigner verify --verbose` and `zipalign -c -p 4` passed.
- `aapt2 dump badging` confirms package `com.sabahfc.tv`, version 1.1.0, minimum API 23, target API 35,
  Leanback launcher, landscape, no touchscreen requirement, app icon and TV banner.
- Browser simulation tested all seven sidebar destinations, active state, async
  sidebar initialization, D-pad content/sidebar navigation, modal focus, OK/Back,
  match/player navigation, keyboard/select handoff and YouTube URL handoff.
- Layout checks passed on every destination at 1920×1080, 1280×720 and 960×540.
- Installation, native keyboard behaviour and video playback on a physical TV
  remain unverified. No TV device or emulator was connected during this build.

Run the browser remote-control regression test with `python3 android-tv/tests/test_remote.py` (Python Playwright and Chromium required).
