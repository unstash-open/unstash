/* global chrome */

import { createCaptureHash, normaliseCaptureUrl } from "./capture.js";

const appUrl = "https://unstash-open.vercel.app/prototype";
const titleElement = document.querySelector("#tab-title");
const urlElement = document.querySelector("#tab-url");
const actionElement = document.querySelector("#capture-action");
const buttonElement = document.querySelector("#capture-button");
const statusElement = document.querySelector("#status");

/** @type {{ url: string; title: string } | null} */
let activeTab = null;

function showError(message) {
  statusElement.textContent = message;
  statusElement.classList.add("error");
  buttonElement.disabled = true;
}

async function loadActiveTab() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const url = normaliseCaptureUrl(tab?.url ?? "");

    if (!url) {
      showError("This browser page cannot be captured.");
      titleElement.textContent = "Open a normal web page first.";
      return;
    }

    const title =
      (tab.title ?? "").replace(/\s+/g, " ").trim().slice(0, 160) ||
      `Review saved link from ${new URL(url).hostname}`;

    activeTab = { url, title };
    titleElement.textContent = title;
    urlElement.textContent = url;
    urlElement.title = url;
    buttonElement.disabled = false;
  } catch {
    showError("Unstash could not read the active tab.");
  }
}

buttonElement.addEventListener("click", async () => {
  if (!activeTab) return;

  try {
    const hash = createCaptureHash({
      version: 1,
      url: activeTab.url,
      title: activeTab.title,
      action: actionElement.value,
    });

    buttonElement.disabled = true;
    statusElement.textContent = "Opening your local Unstash queue…";
    await chrome.tabs.create({ url: `${appUrl}${hash}` });
    window.close();
  } catch {
    showError("This tab could not be added.");
  }
});

loadActiveTab();
