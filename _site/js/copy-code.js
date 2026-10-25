
document.addEventListener("DOMContentLoaded", () => {
  const codeBlocks = document.querySelectorAll("pre:has(> code)");

  codeBlocks.forEach((block) => {
    const button = document.createElement("button");

    button.className = "copy-code-button";
    button.type = "button";
    button.textContent = "Copy";
    button.setAttribute("aria-label", "Copy code to clipboard");

    button.addEventListener("click", async () => {
      const code = block.querySelector("code");

      if (!code) return;

      try {
        await navigator.clipboard.writeText(code.innerText);
        button.textContent = "Copied!";

        setTimeout(() => {
          button.textContent = "Copy";
        }, 1500);
      } catch (error) {
        button.textContent = "Copy failed";
        console.error("Unable to copy code:", error);
      }
    });

    block.appendChild(button);
    block.classList.add("code-block-container");
  });
});

