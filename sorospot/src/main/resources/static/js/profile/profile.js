const profileUserEmail = document.body.dataset.profileEmail || "";
const currentUserEmail = document.body.dataset.currentEmail || "";
let categories = [];

// Carrega categorias
fetch("/api/maps/categories")
  .then((r) => r.json())
  .then((cats) => {
    categories = cats;
  })
  .catch((e) => console.error("Erro ao carregar categorias:", e));

// Carrega pins do usuário
if (profileUserEmail) {
  fetch(
    `/api/maps/admin/occurrences?userEmailFilter=${encodeURIComponent(
      profileUserEmail
    )}`
  )
    .then((r) => r.json())
    .then((pins) => {
      const list = document.getElementById("pinsList");
      if (!pins.length) {
        list.innerHTML = '<p style="color:#777">Nenhum pin encontrado.</p>';
        return;
      }
      list.innerHTML = "";
      pins.forEach((pin) => {
        const div = document.createElement("div");
        div.className = "pin-item";
        const thumbs =
          pin.photos && pin.photos.length
            ? pin.photos
                .slice(0, 3)
                .map((p) => `<img src="/uploads/${p}" alt="Pin" />`)
                .join("")
            : "";
        div.innerHTML = `
        <div class="pin-thumbs">${thumbs}</div>
        <div class="pin-content">
          <strong>${escapeHtml(pin.title || "Sem título")}</strong>
          <div style="font-size:0.9em;color:#666">${escapeHtml(
            pin.description || ""
          )}</div>
          <div class="pin-actions">
            <button class="button" onclick="editPin(${
              pin.id
            })">Editar <span class="material-symbols-outlined">edit</span></button>
            <button class="button danger" onclick="deletePin(${
              pin.id
            })">Excluir <span class="material-symbols-outlined">delete</span></button>
            <a href="/occurrence/show/${
              pin.id
            }" class="button">Detalhes <span class="material-symbols-outlined">info</span></a>
          </div>
        </div>
      `;
        list.appendChild(div);
      });
    })
    .catch((e) => {
      document.getElementById("pinsList").innerHTML =
        '<p style="color:#d32f2f">Erro ao carregar pins.</p>';
    });
}

function escapeHtml(str) {
  return String(str).replace(
    /[&<>"']/g,
    (s) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[s])
  );
}

function fechaModal(event, modal) {
  const innerModal = modal.firstElementChild;
  if (!innerModal.contains(event.target)) {
    modal.classList.remove("open");
  }
}

function formatCategory(cat) {
  if (!cat) return null;
  const rawType = cat.type || "";
  const displayName = rawType
    ? rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase()
    : "";
  const iconRaw = cat.icon;
  const displayIcon =
    iconRaw && String(iconRaw).toLowerCase() !== "null" && iconRaw.trim() !== ""
      ? iconRaw
      : "location_on";
  return { ...cat, displayName, displayIcon };
}

let currentEditingPin = null;

function editPin(id) {
  fetch(
    `/api/maps/admin/occurrences?userEmailFilter=${encodeURIComponent(
      profileUserEmail
    )}`
  )
    .then((r) => r.json())
    .then((pins) => {
      const pin = pins.find((p) => p.id === id);
      if (!pin) return alert("Pin não encontrado");
      currentEditingPin = pin;
      openEditPinModal(pin);
    });
}

function openEditPinModal(item) {
  const modal = document.getElementById("editModal");
  modal.classList.add("open");
  document.getElementById("editId").value = item.id;
  document.getElementById("editTitle").value = item.title || "";
  document.getElementById("editDesc").value = item.description || "";

  const editHidden = document.getElementById("editCategory");
  const editTrigger = document.getElementById("editCategoryTrigger");
  if (editTrigger) {
    editTrigger.onclick = () =>
      openCategoryModal({
        hiddenId: "editCategory",
        triggerId: "editCategoryTrigger",
      });
  }
  if (categories && categories.length) {
    const currentCat = categories.find(
      (c) => c.type === item.category || c.displayName === item.category
    );
    if (currentCat) {
      if (editHidden) editHidden.value = currentCat.id;
      if (editTrigger) {
        const icon = editTrigger.querySelector(
          ".material-symbols-outlined.icon"
        );
        const text = editTrigger.querySelector(".text");
        const chevron = editTrigger.querySelector(
          ".material-symbols-outlined.chevron"
        );
        if (icon) {
          icon.textContent = currentCat.displayIcon;
          icon.style.color = currentCat.color;
        }
        if (text) text.textContent = currentCat.displayName;
        if (chevron) chevron.style.display = "none";
      }
    }
  }

  const photosDiv = document.getElementById("editPhotos");
  photosDiv.innerHTML = "";
  const photosContainer = document.createElement("div");
  photosContainer.className = "edit-photos-container";
  photosContainer.dataset.toRemove = "";
  const photos = item.photos || [];
  photos.forEach((p) => {
    const wrapper = document.createElement("div");
    wrapper.className = "edit-photo-wrapper";
    wrapper.dataset.photo = p;
    const img = document.createElement("img");
    img.src = "/uploads/" + p;
    img.className = "edit-photo-img";
    const deleteIcon = document.createElement("span");
    deleteIcon.className = "material-symbols-outlined edit-photo-delete-icon";
    deleteIcon.textContent = "delete";
    wrapper.addEventListener("click", () =>
      openDeletePhotoModal(wrapper, p, photosContainer)
    );
    wrapper.appendChild(img);
    wrapper.appendChild(deleteIcon);
    photosContainer.appendChild(wrapper);
  });
  photosDiv.appendChild(photosContainer);

  document.getElementById("cancelEdit").onclick = () =>
    modal.classList.remove("open");
  document.getElementById("editForm").onsubmit = function (ev) {
    ev.preventDefault();
    const id = document.getElementById("editId").value;
    const fd = new FormData();
    fd.append("title", document.getElementById("editTitle").value);
    fd.append("description", document.getElementById("editDesc").value);
    fd.append("categoryId", document.getElementById("editCategory").value);
    const file = document.getElementById("editImage").files[0];
    if (file) fd.append("image", file);
    const photosContainerElement = document.querySelector(
      "#editPhotos .edit-photos-container"
    );
    if (photosContainerElement && photosContainerElement.dataset.toRemove) {
      const toRemove = photosContainerElement.dataset.toRemove
        .split(",")
        .filter((x) => x.trim());
      if (toRemove.length) fd.append("removePhotos", toRemove.join(","));
    }
    fetch("/api/maps/markers/" + id, { method: "PUT", body: fd })
      .then((r) => {
        if (!r.ok)
          return r.text().then((t) => {
            throw t;
          });
        return r.json();
      })
      .then(() => {
        modal.classList.remove("open");
        location.reload();
      })
      .catch((e) => alert("Erro: " + e));
  };
}

function deletePin(id) {
  const modal = document.getElementById("deleteModal");
  modal.classList.add("open");
  document.getElementById("cancelDelete").onclick = () =>
    modal.classList.remove("open");
  document.getElementById("confirmDelete").onclick = () => {
    fetch(`/api/maps/markers/${id}`, { method: "DELETE" })
      .then((r) => {
        if (r.status === 204 || r.status === 200) {
          modal.classList.remove("open");
          location.reload();
        } else r.text().then((t) => alert("Erro: " + t));
      })
      .catch((e) => alert("Erro: " + e));
  };
}

let categoryModalContext = null;
function openCategoryModal(context) {
  categoryModalContext = context;
  const modal = document.getElementById("categoryModal");
  const list = document.getElementById("categoryList");
  if (!modal || !list) return;
  list.innerHTML = "";
  if (!categories || !categories.length) {
    list.innerHTML = '<p class="modalWarning">Carregando categorias...</p>';
  } else {
    categories.forEach((cat) => {
      const card = document.createElement("div");
      card.className = "category-card";
      card.innerHTML = `
        <span class="material-symbols-outlined" style="color:${cat.color}">${cat.displayIcon}</span>
        <span class="name">${cat.displayName}</span>
        <span class="pill" style="background:${cat.color}"></span>
      `;
      card.addEventListener("click", () => {
        const hidden = document.getElementById(context.hiddenId);
        const trig = document.getElementById(context.triggerId);
        if (hidden) hidden.value = cat.id;
        if (trig) {
          const iconEl = trig.querySelector(".material-symbols-outlined.icon");
          const textEl = trig.querySelector(".text");
          const chevronEl = trig.querySelector(
            ".material-symbols-outlined.chevron"
          );
          if (iconEl) {
            iconEl.textContent = cat.displayIcon;
            iconEl.style.color = cat.color;
          }
          if (textEl) textEl.textContent = cat.displayName;
          if (chevronEl) chevronEl.style.display = "none";
        }
        modal.classList.remove("open");
      });
      list.appendChild(card);
    });
  }
  const cancel = document.getElementById("cancelCategory");
  if (cancel) cancel.onclick = () => modal.classList.remove("open");
  modal.classList.add("open");
}

function openDeletePhotoModal(wrapper, photoPath, photosContainer) {
  const deletePhotoModal = document.getElementById("deletePhotoModal");
  deletePhotoModal.classList.add("open");
  document.getElementById("cancelDeletePhoto").onclick = () =>
    deletePhotoModal.classList.remove("open");
  document.getElementById("confirmDeletePhoto").onclick = () => {
    const currentToRemove = photosContainer.dataset.toRemove || "";
    const toRemoveList = currentToRemove ? currentToRemove.split(",") : [];
    if (!toRemoveList.includes(photoPath)) toRemoveList.push(photoPath);
    photosContainer.dataset.toRemove = toRemoveList.join(",");
    wrapper.remove();
    deletePhotoModal.classList.remove("open");
  };
}

function openEditUserModal() {
  const modal = document.getElementById("editUserModal");
  const userData = window.PROFILE_USER_DATA || {};
  document.getElementById("editUserName").value = userData.name || "";
  document.getElementById("editUserPhone").value = userData.telephone || "";
  document.getElementById("editUserCpf").value = userData.cpf || "";
  modal.classList.add("open");
  document.getElementById("cancelEditUser").onclick = () =>
    modal.classList.remove("open");
  document.getElementById("editUserForm").onsubmit = function (ev) {
    ev.preventDefault();
    const data = {
      name: document.getElementById("editUserName").value,
      telephone: document.getElementById("editUserPhone").value,
      cpf: document.getElementById("editUserCpf").value,
    };
    fetch(`/api/users/${encodeURIComponent(profileUserEmail)}/edit`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((r) => {
        if (!r.ok) {
          return r.text().then((text) => {
            throw new Error(text || "Erro ao atualizar");
          });
        }
        return r.json();
      })
      .then(() => {
        modal.classList.remove("open");
        location.reload();
      })
      .catch((e) => {
        console.error("Erro ao editar:", e);
        alert("Erro ao editar usuário: " + e.message);
      });
  };
}

function openDeleteUserModal() {
  const modal = document.getElementById("deleteUserModal");
  modal.classList.add("open");
  document.getElementById("cancelDeleteUser").onclick = () =>
    modal.classList.remove("open");
  document.getElementById("confirmDeleteUser").onclick = async () => {
    console.log("[DELETE] Iniciando exclusão do usuário:", profileUserEmail);
    try {
      const response = await fetch(
        `/api/users/${encodeURIComponent(profileUserEmail)}/delete`,
        { method: "DELETE" }
      );
      console.log(
        "[DELETE] Resposta recebida:",
        response.status,
        response.statusText
      );

      if (response.status !== 204 && response.status !== 200) {
        const text = await response.text();
        throw new Error(text || "Erro ao excluir");
      }

      console.log(
        "[DELETE] Sucesso! Aguardando 1 segundo antes de redirecionar..."
      );
      modal.classList.remove("open");

      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("[DELETE] Redirecionando para home...");
      window.location.href = "/";
    } catch (e) {
      console.error("[DELETE] Erro ao excluir:", e);
      alert("Erro ao excluir usuário: " + e.message);
    }
  };
}
