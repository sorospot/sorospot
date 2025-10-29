// Esse arquivo depende das seguintes variáveis globais:
//   window.SOROSPOT_GOOGLE_MAPS_API_KEY (string)
//   window.SOROSPOT_CURRENT_USER_EMAIL (string)

let map;
let markers = [];

window.initMap = function () {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: { lat: -23.5015, lng: -47.4526 },
  });

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
    if (!titleVal || !titleVal.trim()) return alert("Título é obrigatório");
    if (!latVal || !lngVal) return alert("Localização inválida");
    const f = new FormData();
    f.append("lat", document.getElementById("pinLat").value);
    f.append("lng", document.getElementById("pinLng").value);
    f.append("title", document.getElementById("pinTitle").value);
    f.append("description", document.getElementById("pinDesc").value);
    f.append("color", document.querySelector(".pinColor").value);
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
        addMarkerToMap({
          id: m.id,
          title: m.title,
          deleted: false,
          description: m.description,
          lat: parseFloat(m.latitude),
          lng: parseFloat(m.longitude),
          color: m.color || document.querySelector(".pinColor").value,
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
  const gMarker = new google.maps.Marker({
    position: { lat: m.lat, lng: m.lng },
    map: map,
    title: m.title,
    label: {
      text: "\uF567",
      fontFamily: "Material Symbols Outlined",
      color: "#ffffff",
      fontSize: "18px",
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
        ${deleteBtn}
      </div>
    </div>`;

  const infow = new google.maps.InfoWindow({ content });
  gMarker.addListener("click", () => infow.open(map, gMarker));
  google.maps.event.addListener(infow, "domready", () => {
    document.querySelector(".fechaTooltip").addEventListener("click", () => {
      infow.close();
    });

    const btn = document.querySelector(
      '.pinTooltipDelete[data-id="' + m.id + '"]'
    );
    if (btn)
      btn.addEventListener("click", () => {
        openDeleteModal(m.id, () => {
          fetch("/api/maps/markers/" + m.id, {
            method: "DELETE",
          })
            .then((r) => {
              if (r.status === 204) gMarker.setMap(null);
              else r.text().then((t) => alert("Erro: " + t));
            })
            .catch((e) => alert("Erro: " + e));
        });
      });
  });

  markers.push(gMarker);
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
                    `<img src="/uploads/${p}" class="map-thumb" style="margin-right:.8rem">`
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
          const id = ev.target.getAttribute("data-id");
          openDeleteModal(id, () => {
            fetch("/api/maps/markers/" + id, {
              method: "DELETE",
            }).then((r) => {
              if (r.status === 204) {
                openMyPinsModal();
              } else r.text().then((t) => alert("Erro: " + t));
            });
          });
        })
      );

      list.querySelectorAll(".my-zoom").forEach((b) =>
        b.addEventListener("click", (ev) => {
          const id = ev.target.getAttribute("data-id");
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
          const id = ev.target.getAttribute("data-id");
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
  document.querySelector(".pinColor").value = item.color || "#ff0000";
  const photosDiv = document.getElementById("editPhotos");
  photosDiv.innerHTML = "";

  const photosContainer = document.createElement("div");
  photosContainer.className = "edit-photos-container";

  // Armazenar as fotos marcadas para remoção
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

    // Clicar na imagem inteira abre o modal de exclusão
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
    const fd = new FormData();
    fd.append("title", document.getElementById("editTitle").value);
    fd.append("description", document.getElementById("editDesc").value);
    fd.append("color", document.querySelector(".pinColor").value);
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
        alert("Atualizado");
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
    // Adicionar a foto à lista de remoção
    const currentToRemove = photosContainer.dataset.toRemove || "";
    const toRemoveList = currentToRemove ? currentToRemove.split(",") : [];
    if (!toRemoveList.includes(photoPath)) {
      toRemoveList.push(photoPath);
    }
    photosContainer.dataset.toRemove = toRemoveList.join(",");

    // Remover a imagem visualmente (do DOM)
    wrapper.remove();

    deletePhotoModal.classList.remove("open");
  };
}
