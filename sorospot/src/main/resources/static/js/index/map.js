// Esse arquivo depende das seguintes variáveis globais:
//   window.SOROSPOT_GOOGLE_MAPS_API_KEY (string)
//   window.SOROSPOT_CURRENT_USER_EMAIL (string)

let map;
let markers = {}; // { id: gMarker }
let currentOpenInfoWindow = null;
let categories = [];
let categoryModalContext = null;

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

window.initMap = function () {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: { lat: -23.5015, lng: -47.4526 },
  });

  // Categorias
  fetch("/api/maps/categories")
    .then((r) => r.json())
    .then((cats) => {
      categories = cats.map(formatCategory);
    })
    .catch((e) => console.error("Erro ao carregar categorias:", e));

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        map.setCenter(p);
        map.setZoom(16);
        new google.maps.Marker({ position: p, map, title: "Você" });
      },
      (err) => console.warn("Geolocalização Falhou.", err)
    );
  }

  // carregar ocorrências
  fetch("/api/maps/occurrences")
    .then((r) => r.json())
    .then((list) => {
      list.forEach((o) => {
        const lat = o.latitude
          ? parseFloat(o.latitude)
          : o.address && o.address.startsWith("lat:")
          ? parseFloat(o.address.split(",")[0].split(":")[1])
          : null;
        const lng = o.longitude
          ? parseFloat(o.longitude)
          : o.address && o.address.startsWith("lat:")
          ? parseFloat(o.address.split(",")[1].split(":")[1])
          : null;
        if (lat && lng)
          addMarkerToMap({
            id: o.id,
            title: o.title || o.description,
            description: o.description,
            lat,
            lng,
            color: o.color || "#ff0000",
            categoryIcon: o.categoryIcon || "location_on",
            categoryColor: o.color || "#ff0000",
            photo: o.photo,
            user: o.user,
            ownerEmail: o.userEmail || null,
          });
      });
    });

  map.addListener("click", (e) => {
    if (!window.SOROSPOT_CURRENT_USER_EMAIL) {
      alert("Você precisa estar logado para criar pins.");
      window.location.href = "/signIn";
      return;
    }
    openPinModal(e.latLng.lat(), e.latLng.lng());
  });

  document.getElementById("address").addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") document.getElementById("searchBtn").click();
  });

  document.getElementById("searchBtn").addEventListener("click", () => {
    const q = document.getElementById("address").value;
    if (!q) return;
    fetch("/api/maps/geocode-simple?address=" + encodeURIComponent(q))
      .then((r) => r.json())
      .then((result) => {
        if (!result || !result.formattedAddress)
          return alert("Nenhum resultado");
        map.setCenter({ lat: result.lat, lng: result.lng });
        map.setZoom(16);
      })
      .catch((e) => alert("Erro: " + e));
  });

  document.getElementById("centerBtn").addEventListener("click", () => {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition((p) =>
        map.setCenter({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
        })
      );
    map.setZoom(16);
  });

  document.getElementById("myPinsBtn").addEventListener("click", () => {
    if (!window.SOROSPOT_CURRENT_USER_EMAIL) {
      alert("Você precisa estar logado para ver seus pins.");
      window.location.href = "/signIn";
      return;
    }
    openMyPinsModal();
  });

  // modal de novo pin
  const modal = document.getElementById("pinModal");
  const pinTrigger = document.getElementById("pinCategoryTrigger");
  if (pinTrigger) {
    pinTrigger.addEventListener("click", () => {
      openCategoryModal({
        hiddenId: "pinCategory",
        triggerId: "pinCategoryTrigger",
      });
    });
  }
  document.getElementById("cancelPin").addEventListener("click", () => {
    if (
      window.SOROSPOT_IMAGE_PICKERS &&
      window.SOROSPOT_IMAGE_PICKERS["pinImage"]
    ) {
      window.SOROSPOT_IMAGE_PICKERS["pinImage"].reset();
    }
    modal.classList.toggle("open");
  });
  document.getElementById("pinForm").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const latVal = document.getElementById("pinLat").value;
    const lngVal = document.getElementById("pinLng").value;
    const titleVal = document.getElementById("pinTitle").value;
    const titleInput = document.getElementById("pinTitle");
    if (!titleVal || !titleVal.trim()) {
      if (titleInput) {
        titleInput.classList.add("input-error");
        setTimeout(() => titleInput.classList.remove("input-error"), 2000);
      }
      return;
    }
    if (!latVal || !lngVal) {
      return alert("Localização inválida");
    }
    const categoryId = document.getElementById("pinCategory").value;
    if (!categoryId) {
      const trigger = document.getElementById("pinCategoryTrigger");
      if (trigger) {
        trigger.classList.add("category-error");
        setTimeout(() => trigger.classList.remove("category-error"), 2000);
      }
      return;
    }
    const f = new FormData();
    f.append("lat", document.getElementById("pinLat").value);
    f.append("lng", document.getElementById("pinLng").value);
    f.append("title", document.getElementById("pinTitle").value);
    f.append("description", document.getElementById("pinDesc").value);
    f.append("categoryId", categoryId);
    const file = document.getElementById("pinImage").files[0];
    if (file) f.append("image", file);

    fetch("/api/maps/markers", {
      method: "POST",
      body: f,
    })
      .then((r) => {
        if (!r.ok)
          return r.text().then((t) => {
            throw t || "Não autorizado";
          });
        return r.json();
      })
      .then((m) => {
        const selectedCat = categories.find((c) => c.id == categoryId);
        addMarkerToMap({
          id: m.id,
          title: m.title,
          deleted: false,
          description: m.description,
          lat: parseFloat(m.latitude),
          lng: parseFloat(m.longitude),
          color: m.color || (selectedCat ? selectedCat.color : "#ff0000"),
          categoryIcon: selectedCat ? selectedCat.icon : "location_on",
          categoryColor:
            m.color || (selectedCat ? selectedCat.color : "#ff0000"),
          photo: m.photo,
          user: m.user,
          ownerEmail: m.userEmail || null,
        });
        modal.classList.remove("open");
      })
      .catch((e) => alert("Erro ao salvar: " + e));
  });

  function openPinModal(lat, lng) {
    const pinModal = document.getElementById("pinModal");
    pinModal.classList.toggle("open");
    document.getElementById("pinLat").value = lat;
    document.getElementById("pinLng").value = lng;
    document.getElementById("pinTitle").value = "";
    document.getElementById("pinDesc").value = "";
    document.getElementById("pinImage").value = "";
    const hidden = document.getElementById("pinCategory");
    const trig = document.getElementById("pinCategoryTrigger");
    if (hidden) hidden.value = "";
    if (trig) {
      const icon = trig.querySelector(".material-symbols-outlined.icon");
      if (icon) {
        icon.textContent = "";
        icon.style.color = "var(--bg-color-secondary)";
      }
      const text = trig.querySelector(".text");
      if (text) text.textContent = "Selecionar";
      const chevron = trig.querySelector(".material-symbols-outlined.chevron");
      if (chevron) chevron.style.display = "";
    }
  }
};

function fechaModal(event, t) {
  const innerModal = t.firstElementChild;
  if (!innerModal.contains(event.target)) {
    if (
      t &&
      t.id === "pinModal" &&
      window.SOROSPOT_IMAGE_PICKERS &&
      window.SOROSPOT_IMAGE_PICKERS["pinImage"]
    ) {
      window.SOROSPOT_IMAGE_PICKERS["pinImage"].reset();
    }
    if (
      t &&
      t.id === "editModal" &&
      window.SOROSPOT_IMAGE_PICKERS &&
      window.SOROSPOT_IMAGE_PICKERS["editImage"]
    ) {
      window.SOROSPOT_IMAGE_PICKERS["editImage"].reset();
    }
    t.classList.remove("open");
  }
}

const aumentarImagem = (t) => {
  const fullscreen = document.fullscreenElement;

  if (fullscreen === t) {
    document.exitFullscreen?.();
  } else {
    t.requestFullscreen?.();
  }
};

function addMarkerToMap(m) {
  const iconText = m.categoryIcon || "location_on";
  const iconColor = m.categoryColor || m.color || "#ff0000";

  const gMarker = new google.maps.Marker({
    position: { lat: m.lat, lng: m.lng },
    map: map,
    title: m.title,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: iconColor,
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 4,
      scale: 13,
    },
    label: {
      text: iconText,
      fontFamily: "Material Symbols Outlined",
      color: "#ffffff",
      fontSize: "16px",
    },
  });

  const isOwner =
    (m.ownerEmail && m.ownerEmail === window.SOROSPOT_CURRENT_USER_EMAIL) ||
    false;
  const deleteBtn = isOwner
    ? `<div class="pinTooltipDelete" data-id="${m.id}">
        <span class="material-symbols-outlined">delete</span>
        <button class="delete-btn">Excluir</button>
      </div>`
    : "";
  const content = `<div class="pinTooltip">
      <div class="tooltipHeader">
        <strong class="pinTooltipTitle">${escapeHtml(m.title)}</strong>
        <button class="fechaTooltip" type="button">&times;</button>
      </div>
      <div class="tooltipBody">
        <div class="pinTooltipDesc">${escapeHtml(m.description || "")}</div>
        ${
          m.photo && Object.keys(m.photo).length > 0
            ? `<div class="pinTooltipImg">
            <img src="/uploads/${m.photo}" onclick="aumentarImagem(this)" style="width:72px;height:72px;object-fit:cover;border-radius:4px">
          </div>`
            : ""
        }
        <div class="pinTooltipOwner"><strong>Por:</strong> ${escapeHtml(
          m.user || "Anônimo"
        )}</div>
        <div class="pinTooltipActions">
          <div class="pinTooltipShow" data-id="${m.id}">
              <span class="material-symbols-outlined">double_arrow</span>
              <a href="/occurrence/show/${
                m.id
              }"><button class="show-btn">Detalhes</button></a>
          </div>
          ${deleteBtn}
        </div>
      </div>
    </div>`;

  const infow = new google.maps.InfoWindow({ content });
  let isDeleting = false;

  gMarker.addListener("click", () => {
    if (currentOpenInfoWindow && currentOpenInfoWindow !== infow) {
      currentOpenInfoWindow.close();
    }

    infow.open(map, gMarker);
    currentOpenInfoWindow = infow;
  });

  google.maps.event.addListener(infow, "closeclick", () => {
    if (currentOpenInfoWindow === infow) {
      currentOpenInfoWindow = null;
    }
  });

  google.maps.event.addListener(infow, "domready", () => {
    setTimeout(() => {
      const iwContainer = document.querySelector(".gm-style-iw-c");
      if (!iwContainer) return;

      const closeBtn = iwContainer.querySelector(".fechaTooltip");
      if (closeBtn && !closeBtn.dataset.listenerAdded) {
        closeBtn.dataset.listenerAdded = "true";

        closeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          infow.close();
          if (currentOpenInfoWindow === infow) {
            currentOpenInfoWindow = null;
          }
        });
      }

      const deleteBtn = iwContainer.querySelector(
        '.pinTooltipDelete[data-id="' + m.id + '"]'
      );
      if (deleteBtn && !deleteBtn.dataset.listenerAdded) {
        deleteBtn.dataset.listenerAdded = "true";

        deleteBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          if (isDeleting) return;

          openDeleteModal(m.id, () => {
            if (isDeleting) return;
            isDeleting = true;

            fetch("/api/maps/markers/" + m.id, {
              method: "DELETE",
              headers: { "X-User-Email": window.SOROSPOT_CURRENT_USER_EMAIL },
            })
              .then((r) => {
                if (r.status === 204 || r.status === 200) {
                  gMarker.setMap(null);
                  infow.close();
                  if (currentOpenInfoWindow === infow) {
                    currentOpenInfoWindow = null;
                  }
                } else {
                  r.text().then((t) => alert("Erro: " + t));
                }
              })
              .catch((e) => alert("Erro: " + e))
              .finally(() => {
                isDeleting = false;
              });
          });
        });
      }
    }, 50);
  });

  markers[m.id] = gMarker; // Armazena marker por id
}

function escapeHtml(str) {
  return String(str).replace(/[&<>\"']/g, function (s) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[s];
  });
}

function openDeleteModal(id, onConfirm) {
  const modal = document.getElementById("deleteModal");
  const cancel = document.getElementById("cancelDelete");
  const confirm = document.getElementById("confirmDelete");
  const innerModal = modal.querySelector(".panel");

  const clickOutsideHandler = (event) => {
    if (!innerModal.contains(event.target)) {
      modal.classList.remove("open");
      document.removeEventListener("click", clickOutsideHandler);
    }
  };

  const cancelFn = () => {
    modal.classList.remove("open");
    confirm.removeEventListener("click", confirmFn);
    document.removeEventListener("click", clickOutsideHandler);
  };

  const confirmFn = () => {
    modal.classList.remove("open");
    confirm.removeEventListener("click", confirmFn);
    document.removeEventListener("click", clickOutsideHandler);
    if (onConfirm) onConfirm();
  };

  cancel.addEventListener("click", cancelFn, { once: true });
  confirm.addEventListener("click", confirmFn, { once: true });
  modal.addEventListener("click", clickOutsideHandler, { once: true });

  modal.classList.add("open");
}

function openMyPinsModal() {
  const modal = document.getElementById("myPinsModal");
  const list = document.getElementById("myPinsList");
  list.classList.remove("no-pins");
  list.innerHTML = "Carregando...";
  modal.classList.toggle("open");
  fetch("/api/maps/my-occurrences")
    .then((r) => {
      if (!r.ok)
        return r.text().then((t) => {
          throw t || "Não autorizado";
        });
      return r.json();
    })
    .then((arr) => {
      if (!arr.length) {
        list.classList.add("no-pins");
        list.innerHTML =
          "<h3 class='modalWarning'>Nenhum pin encontrado <span class='material-symbols-outlined'>chat_error</span></h3>";
        return;
      }
      list.innerHTML = "";
      arr.forEach((item) => {
        const div = document.createElement("div");
        const thumbs =
          item.photos && item.photos.length
            ? item.photos
                .slice(0, 3)
                .map(
                  (p) =>
                    `<img src="/uploads/${p}" class="map-thumb" onclick="aumentarImagem(this)" style="margin-right:.8rem">`
                )
                .join("")
            : "";
        div.innerHTML = `<div style="display:flex;align-items:center"><div>${thumbs}</div><div style="flex:1"><strong>${escapeHtml(
          item.title || "Sem título"
        )}</strong><div style="font-size:0.9em">${escapeHtml(
          item.description || ""
        )}</div></div></div><div style="margin-top:6px;display:flex;gap: 1.2rem;"><button data-id="${
          item.id
        }" class="my-edit">Editar <span class="material-symbols-outlined">edit</span></button> <button data-id="${
          item.id
        }" class="my-delete">Excluir <span class="material-symbols-outlined">delete</span></button> <button data-id="${
          item.id
        }" class="my-zoom">Ir para <span class="material-symbols-outlined">zoom_in</span></button></div>`;
        list.appendChild(div);
      });

      list.querySelectorAll(".my-delete").forEach((b) =>
        b.addEventListener("click", (ev) => {
          const id = ev.currentTarget.getAttribute("data-id");
          openDeleteModal(id, () => {
            fetch("/api/maps/markers/" + id, {
              method: "DELETE",
            }).then((r) => {
              if (r.status === 204) {
                if (markers[id]) {
                  markers[id].setMap(null);
                  delete markers[id];
                }
                openMyPinsModal();
              } else r.text().then((t) => alert("Erro: " + t));
            });
          });
        })
      );

      list.querySelectorAll(".my-zoom").forEach((b) =>
        b.addEventListener("click", (ev) => {
          const id = ev.currentTarget.getAttribute("data-id");
          const item = arr.find((x) => x.id == id);
          modal.classList.toggle("open");
          if (item && item.latitude && item.longitude) {
            map.setCenter({
              lat: parseFloat(item.latitude),
              lng: parseFloat(item.longitude),
            });
            map.setZoom(16);
          }
        })
      );

      list.querySelectorAll(".my-edit").forEach((b) =>
        b.addEventListener("click", (ev) => {
          const id = ev.currentTarget.getAttribute("data-id");
          const item = arr.find((x) => x.id == id);
          if (!item) return;
          openEditModal(item);
        })
      );
    })
    .catch((e) => {
      list.innerHTML = "Erro: " + e;
    });
  document
    .getElementById("closeMyPins")
    .addEventListener("click", () => modal.classList.remove("open"));
}

function openEditModal(item) {
  const modal = document.getElementById("editModal");
  modal.classList.toggle("open");
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

    wrapper.addEventListener("click", () => {
      openDeletePhotoModal(wrapper, p, photosContainer);
    });

    wrapper.appendChild(img);
    wrapper.appendChild(deleteIcon);
    photosContainer.appendChild(wrapper);
  });

  photosDiv.appendChild(photosContainer);

  if (photos.length > 4) {
    const prevBtn = document.createElement("button");
    photosDiv.style.justifyContent = "center";
    prevBtn.className = "carousel-nav carousel-prev";
    prevBtn.type = "button";
    prevBtn.innerHTML =
      '<span class="material-symbols-outlined">chevron_left</span>';
    prevBtn.addEventListener("click", () => {
      photosContainer.scrollBy({ left: -200, behavior: "smooth" });
    });

    const nextBtn = document.createElement("button");
    nextBtn.className = "carousel-nav carousel-next";
    nextBtn.type = "button";
    nextBtn.innerHTML =
      '<span class="material-symbols-outlined">chevron_right</span>';
    nextBtn.addEventListener("click", () => {
      photosContainer.scrollBy({ left: 200, behavior: "smooth" });
    });

    photosDiv.appendChild(prevBtn);
    photosDiv.appendChild(nextBtn);
  }

  document.getElementById("cancelEdit").onclick = () => {
    if (
      window.SOROSPOT_IMAGE_PICKERS &&
      window.SOROSPOT_IMAGE_PICKERS["editImage"]
    ) {
      window.SOROSPOT_IMAGE_PICKERS["editImage"].reset();
    }
    modal.classList.toggle("open");
  };
  document.getElementById("editForm").onsubmit = function (ev) {
    ev.preventDefault();
    const id = document.getElementById("editId").value;
    const titleVal = document.getElementById("editTitle").value;
    const titleInput = document.getElementById("editTitle");
    if (!titleVal || !titleVal.trim()) {
      if (titleInput) {
        titleInput.classList.add("input-error");
        setTimeout(() => titleInput.classList.remove("input-error"), 2000);
      }
      return;
    }
    const categoryId = document.getElementById("editCategory").value;
    if (!categoryId) {
      const trigger = document.getElementById("editCategoryTrigger");
      if (trigger) {
        trigger.classList.add("category-error");
        setTimeout(() => trigger.classList.remove("category-error"), 2000);
      }
      return;
    }
    const fd = new FormData();
    fd.append("title", document.getElementById("editTitle").value);
    fd.append("description", document.getElementById("editDesc").value);
    fd.append("categoryId", categoryId);
    const file = document.getElementById("editImage").files[0];
    if (file) fd.append("image", file);

    const photosContainerElement = document.querySelector(
      "#editPhotos .edit-photos-container"
    );
    if (photosContainerElement && photosContainerElement.dataset.toRemove) {
      const toRemove = photosContainerElement.dataset.toRemove
        .split(",")
        .filter((x) => x.trim());
      if (toRemove.length) {
        fd.append("removePhotos", toRemove.join(","));
      }
    }

    fetch("/api/maps/markers/" + id, {
      method: "PUT",
      body: fd,
    })
      .then((r) => {
        if (!r.ok)
          return r.text().then((t) => {
            throw t;
          });
        return r.json();
      })
      .then((res) => {
        modal.classList.toggle("open");
        openMyPinsModal();
        window.location.reload();
      })
      .catch((e) => alert("Erro: " + e));
  };
}

function openDeletePhotoModal(wrapper, photoPath, photosContainer) {
  const deletePhotoModal = document.getElementById("deletePhotoModal");
  deletePhotoModal.classList.add("open");

  document.getElementById("cancelDeletePhoto").onclick = () => {
    deletePhotoModal.classList.remove("open");
  };

  document.getElementById("confirmDeletePhoto").onclick = () => {
    const currentToRemove = photosContainer.dataset.toRemove || "";
    const toRemoveList = currentToRemove ? currentToRemove.split(",") : [];
    if (!toRemoveList.includes(photoPath)) {
      toRemoveList.push(photoPath);
    }
    photosContainer.dataset.toRemove = toRemoveList.join(",");

    wrapper.remove();

    deletePhotoModal.classList.remove("open");
  };
}

function openCategoryModal(context) {
  categoryModalContext = context;
  const modal = document.getElementById("categoryModal");
  const list = document.getElementById("categoryList");
  if (!modal || !list) return;
  list.innerHTML = "";
  if (!categories || !categories.length) {
    list.innerHTML = "<p class='modalWarning'>Carregando categorias...</p>";
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
