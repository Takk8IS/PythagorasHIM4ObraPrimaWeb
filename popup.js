// popup.js
document.addEventListener("DOMContentLoaded", () => {
  const generateAuditButton = document.getElementById(
    "generate-audit-purchase-orders-button",
  );
  const fileInputClient = document.getElementById("file-input-client");
  const fileInputSupplier = document.getElementById("file-input-supplier");
  const generateListButtonClient = document.getElementById(
    "generate-list-button-client",
  );
  const generateListButtonSupplier = document.getElementById(
    "generate-list-button-supplier",
  );
  const clientSelect = document.getElementById("client-select");
  const supplierSelect = document.getElementById("supplier-select");
  const statusDiv = document.getElementById("status");

  generateAuditButton.addEventListener("click", () => {
    chrome.tabs.create(
      {
        url: "https://www.obraprimaweb.com.br/App/Compras/ComprasResult.aspx",
      },
      (tab) => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"],
        });
      },
    );
  });

  fileInputClient.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const clients = content
          .split("\n")
          .filter((line) => line.trim() !== "");
        chrome.storage.local.set({ clients }, () => {
          updateStatus("Lista de clientes carregada");
          populateClientSelect(clients);
        });
      };
      reader.readAsText(file);
    }
  });

  fileInputSupplier.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const suppliers = content
          .split("\n")
          .filter((line) => line.trim() !== "");
        chrome.storage.local.set({ suppliers }, () => {
          updateStatus("Lista de fornecedores carregada");
          populateSupplierSelect(suppliers);
        });
      };
      reader.readAsText(file);
    }
  });

  generateListButtonClient.addEventListener("click", () => {
    fileInputClient.click();
  });

  generateListButtonSupplier.addEventListener("click", () => {
    fileInputSupplier.click();
  });

  function populateClientSelect(clients) {
    clientSelect.innerHTML = "";
    clients.forEach((client) => {
      const option = document.createElement("option");
      option.value = client.trim();
      option.textContent = client.trim();
      clientSelect.appendChild(option);
    });
    clientSelect.classList.remove("hidden");
  }

  function populateSupplierSelect(suppliers) {
    supplierSelect.innerHTML = "";
    suppliers.forEach((supplier) => {
      const option = document.createElement("option");
      option.value = supplier.trim();
      option.textContent = supplier.trim();
      supplierSelect.appendChild(option);
    });
    supplierSelect.classList.remove("hidden");
  }

  clientSelect.addEventListener("change", (event) => {
    const selectedClient = event.target.value;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "fillClientName",
        clientName: selectedClient,
      });
    });
  });

  supplierSelect.addEventListener("change", (event) => {
    const selectedSupplier = event.target.value;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "fillSupplierName",
        supplierName: selectedSupplier,
      });
    });
  });

  chrome.storage.local.get("clients", ({ clients }) => {
    if (clients) {
      populateClientSelect(clients);
      updateStatus("Lista de clientes carregada");
    }
  });

  chrome.storage.local.get("suppliers", ({ suppliers }) => {
    if (suppliers) {
      populateSupplierSelect(suppliers);
      updateStatus("Lista de fornecedores carregada");
    }
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateStatus") {
      updateStatus(request.message, request.isError);
    }
  });
});

function updateStatus(message, isError = false) {
  const statusDiv = document.getElementById("status");
  statusDiv.textContent = message;
  statusDiv.style.color = isError ? "red" : "black";
}
