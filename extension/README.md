# Unstash Capture 0.1

Developer preview for Chromium browsers. It reads the active tab only after the
user clicks the extension icon and asks for no host permissions.

## Install

1. Download and unzip `unstash-extension-v0.1.0.zip`.
2. Open `chrome://extensions` in Chrome, Brave or Edge.
3. Enable **Developer mode**.
4. Choose **Load unpacked** and select the unzipped `extension` folder.
5. Pin Unstash Capture and click it on any normal web page.

The current tab URL, title and selected action are encoded into a URL fragment.
Fragments are not sent in HTTP requests. The Unstash prototype imports the
capture into browser local storage and immediately clears the fragment.

No Reddit login, host permissions, analytics or remote vault are used.
