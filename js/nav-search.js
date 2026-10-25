
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector("#toc-search-input");
  const sidebar = document.querySelector(".toc-sidebar");

  // The first direct UL in the sidebar is Pandoc's TOC.
  const toc = sidebar?.querySelector(":scope > ul");

  if (!searchInput || !toc) {
    console.error("Search initialization failed:", {
      searchInputFound: Boolean(searchInput),
      tocFound: Boolean(toc)
    });
    return;
  }

  function filterList(list, query) {
    let hasVisibleMatch = false;

    for (const item of list.children) {
      if (item.tagName !== "LI") continue;

      const link = [...item.children].find(
        (element) => element.tagName === "A"
      );

      const nestedLists = [...item.children].filter(
        (element) =>
          element.tagName === "UL" ||
          element.tagName === "OL"
      );

      const headingMatches = link?.textContent
        .toLowerCase()
        .includes(query) ?? false;

      let childMatches = false;

      nestedLists.forEach((nestedList) => {
        if (filterList(nestedList, query)) {
          childMatches = true;
        }
      });

      const visible =
        query === "" || headingMatches || childMatches;

      item.hidden = !visible;

      if (visible) hasVisibleMatch = true;
    }

    return hasVisibleMatch;
  }

  searchInput.addEventListener("input", () => {
    filterList(toc, searchInput.value.trim().toLowerCase());
  });

  console.log("Navigation search initialized successfully.");
});
