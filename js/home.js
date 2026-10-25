document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const sidebar = document.querySelector("#sidebar");
  const menuToggle = document.querySelector("#menu-toggle");
  const closeMenu = document.querySelector("#close-menu");
  const backdrop = document.querySelector("#backdrop");
  const search = document.querySelector("#sheet-search");
  const sheetList = document.querySelector("#sheet-list");
  const emptyMessage = document.querySelector("#empty-message");
  const status = document.querySelector("#sheet-status");

  function setMenuOpen(open) {
    body.classList.toggle("menu-open", open);
    menuToggle?.setAttribute("aria-expanded", String(open));
    menuToggle?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (open) closeMenu?.focus();
    else menuToggle?.focus();
  }

  menuToggle?.addEventListener("click", () => {
    setMenuOpen(!body.classList.contains("menu-open"));
  });
  closeMenu?.addEventListener("click", () => setMenuOpen(false));
  backdrop?.addEventListener("click", () => setMenuOpen(false));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && body.classList.contains("menu-open")) {
      setMenuOpen(false);
    }
  });

  sidebar?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 48rem)").matches) {
        body.classList.remove("menu-open");
        menuToggle?.setAttribute("aria-expanded", "false");
        menuToggle?.setAttribute("aria-label", "Open menu");
      }
    });
  });

  function renderSheetLinks(sheets) {
    if (!sheetList) return;
    sheetList.replaceChildren();

    sheets
      .filter((sheet) => sheet && typeof sheet.title === "string" && typeof sheet.url === "string")
      .sort((a, b) => a.title.localeCompare(b.title))
      .forEach((sheet) => {
        const link = document.createElement("a");
        link.href = sheet.url;
        link.textContent = sheet.title;
        link.dataset.title = sheet.title;
        link.className = "sheet-link";
        sheetList.appendChild(link);
      });

    if (status) status.hidden = true;
    if (emptyMessage) emptyMessage.hidden = sheetList.children.length !== 0;
  }

  async function loadCheatSheets() {
    try {
      const response = await fetch("cheatsheets.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const sheets = await response.json();
      if (!Array.isArray(sheets)) {
        throw new Error("cheatsheets.json must contain a JSON array");
      }

      renderSheetLinks(sheets);
    } catch (error) {
      console.error("Could not load the cheat-sheet index:", error);
      if (status) {
        status.hidden = false;
        status.textContent = "Could not load cheat sheets. Run the index generator and open this site through a local web server.";
      }
      if (emptyMessage) emptyMessage.hidden = true;
    }
  }

  search?.addEventListener("input", () => {
    const query = search.value.trim().toLocaleLowerCase();
    let visible = 0;
    sheetList?.querySelectorAll("a").forEach((link) => {
      const title = (link.dataset.title || link.textContent || "").toLocaleLowerCase();
      link.hidden = !title.includes(query);
      if (!link.hidden) visible++;
    });
    if (emptyMessage) {
      emptyMessage.hidden = visible !== 0 || sheetList?.children.length === 0;
      emptyMessage.textContent = query ? "No matching cheat sheets." : "No cheat sheets found.";
    }
  });

  const grid = document.querySelector("#latest-grid");
  const cards = [...(grid?.querySelectorAll(".sheet-card") || [])];
  cards.sort((a, b) => (b.dataset.added || "").localeCompare(a.dataset.added || ""));
  cards.forEach((card) => grid?.appendChild(card));

  loadCheatSheets();
});
