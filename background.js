// background.js
chrome.runtime.onInstalled.addListener(() => {
  console.log("PythagorasHIM™ 4 Obra Prima extension installed");
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "getSelectedClient") {
    try {
      const data = await chrome.storage.local.get("selectedClient");
      sendResponse({ selectedClient: data.selectedClient });
    } catch (error) {
      console.error(error);
      sendResponse({ selectedClient: null });
    }
    return true;
  }

  if (request.action === "getSelectedSupplier") {
    try {
      const data = await chrome.storage.local.get("selectedSupplier");
      sendResponse({ selectedSupplier: data.selectedSupplier });
    } catch (error) {
      console.error(error);
      sendResponse({ selectedSupplier: null });
    }
    return true;
  }
});
