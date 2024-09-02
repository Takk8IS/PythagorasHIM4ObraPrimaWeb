// content.js
async function clickElement(selector) {
  try {
    const element = await waitForElement(selector);
    await element.click();
    console.log(`Clicked element: ${selector}`);
  } catch (error) {
    console.error(`Error clicking element ${selector}:`, error);
    throw error;
  }
}

async function selectLabels(selectors) {
  for (const selector of selectors) {
    try {
      const label = await waitForElement(selector);
      if (!label.classList.contains("ui-state-active")) {
        await label.click();
        console.log(`Selected label: ${selector}`);
      }
    } catch (error) {
      console.error(`Error selecting label ${selector}:`, error);
    }
  }
}

function waitForElement(selector, timeout = 30000) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(selector)) {
      resolve(document.querySelector(selector));
      return;
    }
    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout waiting for element: ${selector}`));
    }, timeout);
  });
}

async function initializeAudit() {
  try {
    updateStatus("Iniciando auditoria...");
    await clickElement("#ui-id-9");
    updateStatus("Menu de pesquisa aberto");
    await waitForElement(".OpcoesSituacao:nth-child(7) label");
    await selectLabels([
      ".OpcoesSituacao:nth-child(7) label",
      ".OpcoesSituacao:nth-child(8) label",
      ".OpcoesSituacao:nth-child(9) label",
    ]);
    updateStatus("Opções de situação selecionadas");
  } catch (error) {
    updateStatus(`Erro ao inicializar auditoria: ${error.message}`, true);
  }
}

async function fillClientName(clientName) {
  try {
    updateStatus(`Preenchendo nome do cliente: ${clientName}`);
    const clientNameInput = await waitForElement(
      "div:nth-child(5) > .select2:nth-child(4) .select2-search__field",
    );
    clientNameInput.value = clientName;
    clientNameInput.dispatchEvent(new Event("input", { bubbles: true }));
    clientNameInput.dispatchEvent(new Event("change", { bubbles: true }));

    // Simulate pressing Enter
    clientNameInput.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter" }),
    );

    updateStatus("Nome do cliente inserido, aguardando processamento...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    updateStatus("Tentando selecionar o cliente...");
    await clickElement(".select2-results__option");

    // updateStatus("Cliente selecionado, atualizando...");
    // await clickElement("#cphPesquisa_btnAtualizarObraOrdemCompra");

    // updateStatus("Iniciando pesquisa...");
    // await new Promise((resolve) => setTimeout(resolve, 3000));
    // await clickElement("#cphPesquisa_btnPesquisar");

    // updateStatus("Pesquisa iniciada, aguardando resultados...");
    // await new Promise((resolve) => setTimeout(resolve, 5000));

    // await extractOrderData();
  } catch (error) {
    updateStatus(`Erro ao preencher nome do cliente: ${error.message}`, true);
  }
}

async function fillSupplierName(supplierName) {
  try {
    updateStatus(`Preenchendo nome do fornecedor: ${supplierName}`);
    const supplierNameInput = await waitForElement(
      "#ui-id-10 > div:nth-child(8) .select2-search__field",
    );
    supplierNameInput.value = supplierName;
    supplierNameInput.dispatchEvent(new Event("input", { bubbles: true }));
    supplierNameInput.dispatchEvent(new Event("change", { bubbles: true }));

    // Simulate pressing Enter
    supplierNameInput.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter" }),
    );

    updateStatus("Nome do fornecedor inserido, aguardando processamento...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    updateStatus("Tentando selecionar o fornecedor...");
    await clickElement(".select2-results__option");

    // updateStatus("Fornecedor selecionado, atualizando...");
    // await clickElement("#cphPesquisa_btnAtualizarObraOrdemCompra");

    // updateStatus("Iniciando pesquisa...");
    // await new Promise((resolve) => setTimeout(resolve, 3000));
    // await clickElement("#cphPesquisa_btnPesquisar");

    // updateStatus("Pesquisa iniciada, aguardando resultados...");
    // await new Promise((resolve) => setTimeout(resolve, 5000));

    // await extractOrderData();
  } catch (error) {
    updateStatus(
      `Erro ao preencher nome do fornecedor: ${error.message}`,
      true,
    );
  }
}

async function extractOrderData() {
  try {
    updateStatus("Extraindo dados das ordens de compra...");
    const orderData = [];
    let hasNextPage = true;
    let pageNumber = 1;

    while (hasNextPage) {
      const rows = await waitForElement(
        "#cphPesquisa_gdvPesquisaCompras tbody tr",
        60000,
      );
      updateStatus(`Processando página ${pageNumber}`);
      for (const row of rows) {
        const columns = row.querySelectorAll("td");
        if (columns.length > 0) {
          orderData.push({
            number: columns[0].textContent.trim(),
            date: columns[1].textContent.trim(),
            supplier: columns[2].textContent.trim(),
            total: columns[3].textContent.trim(),
            status: columns[4].textContent.trim(),
          });
        }
      }

      const nextPageButton = document.querySelector(
        ".pagination-next:not(.disabled)",
      );
      if (nextPageButton) {
        await nextPageButton.click();
        pageNumber++;
        updateStatus(`Navegando para a página ${pageNumber}`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } else {
        hasNextPage = false;
      }
    }

    console.log("Dados extraídos:", orderData);
    updateStatus(
      `Extração concluída. ${orderData.length} ordens de compra encontradas.`,
    );
  } catch (error) {
    updateStatus(`Erro ao extrair dados: ${error.message}`, true);
  }
}

function updateStatus(message, isError = false) {
  chrome.runtime.sendMessage({ action: "updateStatus", message, isError });
}

window.addEventListener("load", initializeAudit);

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "fillClientName") {
    await fillClientName(request.clientName);
  }
  if (request.action === "fillSupplierName") {
    await fillSupplierName(request.supplierName);
  }
});
