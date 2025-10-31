(function () {
  window.SOROSPOT_IMAGE_PICKERS = window.SOROSPOT_IMAGE_PICKERS || {};

  function $(id) {
    return id ? document.getElementById(id) : null;
  }

  function setupImagePicker({
    inputId,
    previewId,
    addBtnId,
    replaceBtnId,
    removeBtnId,
  }) {
    const inputEl = $(inputId);
    const previewEl = $(previewId);
    const addBtnEl = $(addBtnId);
    const replaceBtnEl = $(replaceBtnId);
    const removeBtnEl = $(removeBtnId);

    if (!inputEl || !previewEl) return;

    function enable(el, enabled) {
      if (!el) return;
      el.setAttribute("state", enabled ? "enabled" : "disabled");
    }

    function show(el, visible, display = "grid") {
      if (!el) return;
      el.style.display = visible ? display : "none";
    }

    function updateUI(hasFile) {
      show(previewEl, hasFile, "block");
      show(addBtnEl, !hasFile);
      enable(replaceBtnEl, !!hasFile);
      enable(removeBtnEl, !!hasFile);
    }

    function reset() {
      inputEl.value = "";
      previewEl.src = "";
      updateUI(false);
    }

    inputEl.addEventListener("change", () => {
      const file = inputEl.files && inputEl.files[0];
      if (!file) {
        updateUI(false);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        previewEl.src = reader.result;
        updateUI(true);
      };
      reader.readAsDataURL(file);
    });

    if (removeBtnEl) {
      removeBtnEl.addEventListener("click", () => {
        reset();
      });
    }

    const hasInitialFile = !!(inputEl.files && inputEl.files.length > 0);
    if (!hasInitialFile) {
      previewEl.style.display = previewEl.src ? "block" : "none";
    }
    updateUI(hasInitialFile || !!previewEl.src);

    // Register for external control
    window.SOROSPOT_IMAGE_PICKERS[inputId] = { reset };
  }

  setupImagePicker({
    inputId: "pinImage",
    previewId: "previewImagem",
    addBtnId: "btnImg",
    replaceBtnId: "trocarImagem",
    removeBtnId: "removerImagem",
  });

  setupImagePicker({
    inputId: "editImage",
    previewId: "previewImagem_edit",
    addBtnId: "btnImg_edit",
    replaceBtnId: "trocarImagem_edit",
    removeBtnId: "removerImagem_edit",
  });
})();
