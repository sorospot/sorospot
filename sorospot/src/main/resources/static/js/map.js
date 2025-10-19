// Esse arquivo depende das seguintes variáveis globais:
//   window.SOROSPOT_GOOGLE_MAPS_API_KEY (string)
//   window.SOROSPOT_CURRENT_USER_EMAIL (string)

let map;
let markers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: { lat: -23.5015, lng: -47.4526 },
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        map.setCenter(p);
        map.setZoom(15);
        new google.maps.Marker({ position: p, map, title: "Você" });
      },
      (err) => console.warn("Geolocation failed", err)
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
    openPinModal(e.latLng.lat(), e.latLng.lng());
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
        map.setCenter({ lat: p.coords.latitude, lng: p.coords.longitude })
      );
  });

  document.getElementById("myPinsBtn").addEventListener("click", () => {
    openMyPinsModal();
  });

  // modal de novo pin
  const modal = document.getElementById("pinModal");
  document
    .getElementById("cancelPin")
    .addEventListener("click", () => (modal.style.display = "none"));
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
    f.append("color", document.getElementById("pinColor").value);
    const file = document.getElementById("pinImage").files[0];
    if (file) f.append("image", file);

    fetch("/api/maps/markers", {
      method: "POST",
      body: f,
      headers: { "X-User-Email": window.SOROSPOT_CURRENT_USER_EMAIL },
    })
      .then((r) => r.json())
      .then((m) => {
        addMarkerToMap({
          id: m.id,
          title: m.title,
          description: m.description,
          lat: parseFloat(m.latitude),
          lng: parseFloat(m.longitude),
          color: m.color || document.getElementById("pinColor").value,
          photo: m.photo,
          user: m.user,
          ownerEmail: m.userEmail || "demo@sorospot.local",
        });
        modal.style.display = "none";
      })
      .catch((e) => alert("Erro ao salvar: " + e));
  });

  function openPinModal(lat, lng) {
    modal.style.display = "flex";
    document.getElementById("pinLat").value = lat;
    document.getElementById("pinLng").value = lng;
    document.getElementById("pinTitle").value = "";
    document.getElementById("pinDesc").value = "";
    document.getElementById("pinImage").value = "";
  }
}

function aumentarImagem(t) {
  t.addEventListener("click", () => {
    if (t.requestFullscreen) t.requestFullscreen();
    else if (t.webkitRequestFullscreen) t.webkitRequestFullscreen();
    else if (t.msRequestFullscreen) t.msRequestFullscreen();
  });
}

function addMarkerToMap(m) {
  const icon = {
    path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
    scale: 5,
    fillColor: m.color || "#ff0000",
    fillOpacity: 1,
    strokeWeight: 1,
  };
  const gMarker = new google.maps.Marker({
    position: { lat: m.lat, lng: m.lng },
    map: map,
    title: m.title,
    icon,
  });
  const isOwner =
    (m.ownerEmail && m.ownerEmail === window.SOROSPOT_CURRENT_USER_EMAIL) ||
    false;
  const deleteBtn = isOwner
    ? `<div style="text-align:right;margin-top:8px"><button data-id="${m.id}" class="delete-btn">Excluir</button></div>`
    : "";
  const content = `<div style="max-width:240px"><strong>${escapeHtml(
    m.title
  )}</strong><div>${escapeHtml(m.description || "")}</div>${
    m.photo && Object.keys(m.photo).length > 0
      ? `<div style="display:flex;gap:4px;margin-top:6px"><img src="/uploads/${m.photo}" onclick="aumentarImagem(this)" style="width:72px;height:72px;object-fit:cover;border-radius:4px"></div>`
      : ""
  }<div style="font-size:0.9em;color:#666">Por: ${escapeHtml(
    m.user || "Anônimo"
  )}</div>${deleteBtn}</div>`;
  const infow = new google.maps.InfoWindow({ content });
  gMarker.addListener("click", () => infow.open(map, gMarker));
  google.maps.event.addListener(infow, "domready", () => {
    const btn = document.querySelector('.delete-btn[data-id="' + m.id + '"]');
    if (btn)
      btn.addEventListener("click", () => {
        openDeleteModal(m.id, () => {
          fetch("/api/maps/markers/" + m.id, {
            method: "DELETE",
            headers: { "X-User-Email": window.SOROSPOT_CURRENT_USER_EMAIL },
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
  modal.style.display = "flex";
  const cancel = document.getElementById("cancelDelete");
  const confirm = document.getElementById("confirmDelete");
  const cleanup = () => {
    modal.style.display = "none";
    cancel.removeEventListener("click", cancelFn);
    confirm.removeEventListener("click", confirmFn);
  };
  const cancelFn = () => cleanup();
  const confirmFn = () => {
    cleanup();
    if (onConfirm) onConfirm();
  };
  cancel.addEventListener("click", cancelFn);
  confirm.addEventListener("click", confirmFn);
}

function openMyPinsModal() {
  const modal = document.getElementById("myPinsModal");
  const list = document.getElementById("myPinsList");
  list.innerHTML = "Carregando...";
  modal.style.display = "flex";
  fetch("/api/maps/my-occurrences", {
    headers: { "X-User-Email": window.SOROSPOT_CURRENT_USER_EMAIL },
  })
    .then((r) => r.json())
    .then((arr) => {
      if (!arr.length) {
        list.innerHTML = "<div>Nenhum pin encontrado</div>";
        return;
      }
      list.innerHTML = "";
      arr.forEach((item) => {
        const div = document.createElement("div");
        div.style.borderBottom = "1px solid #eee";
        div.style.padding = "8px 0";
        const thumbs =
          item.photos && item.photos.length
            ? item.photos
                .slice(0, 3)
                .map((p) => `<img src="/uploads/${p}" class="map-thumb">`)
                .join("")
            : "";
        div.innerHTML = `<div style="display:flex;gap:8px;align-items:center"><div>${thumbs}</div><div style="flex:1"><strong>${escapeHtml(
          item.title || "Sem título"
        )}</strong><div style="font-size:0.9em">${escapeHtml(
          item.description || ""
        )}</div></div></div><div style="margin-top:6px"><button data-id="${
          item.id
        }" class="my-edit">Editar</button> <button data-id="${
          item.id
        }" class="my-delete">Excluir</button> <button data-id="${
          item.id
        }" class="my-zoom">Ir para</button></div>`;
        list.appendChild(div);
      });

      list.querySelectorAll(".my-delete").forEach((b) =>
        b.addEventListener("click", (ev) => {
          const id = ev.target.getAttribute("data-id");
          openDeleteModal(id, () => {
            fetch("/api/maps/markers/" + id, {
              method: "DELETE",
              headers: { "X-User-Email": window.SOROSPOT_CURRENT_USER_EMAIL },
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
    .addEventListener("click", () => (modal.style.display = "none"));
}

function openEditModal(item) {
  const modal = document.getElementById("editModal");
  modal.style.display = "flex";
  document.getElementById("editId").value = item.id;
  document.getElementById("editTitle").value = item.title || "";
  document.getElementById("editDesc").value = item.description || "";
  document.getElementById("editColor").value = item.color || "#ff0000";
  const photosDiv = document.getElementById("editPhotos");
  photosDiv.innerHTML = "";
  const photos = item.photos || [];
  photos.forEach((p) => {
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    const img = document.createElement("img");
    img.src = "/uploads/" + p;
    img.style.width = "96px";
    img.style.height = "96px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "6px";
    const del = document.createElement("button");
    del.textContent = "Excluir";
    del.style.position = "absolute";
    del.style.right = "4px";
    del.style.top = "4px";
    del.style.background = "rgba(255,255,255,0.9)";
    del.addEventListener("click", () => {
      wrapper.style.opacity = "0.4";
      wrapper.dataset.remove = (wrapper.dataset.remove || "") + p + ",";
    });
    wrapper.appendChild(img);
    wrapper.appendChild(del);
    photosDiv.appendChild(wrapper);
  });

  document.getElementById("cancelEdit").onclick = () =>
    (modal.style.display = "none");
  document.getElementById("editForm").onsubmit = function (ev) {
    ev.preventDefault();
    const id = document.getElementById("editId").value;
    const fd = new FormData();
    fd.append("title", document.getElementById("editTitle").value);
    fd.append("description", document.getElementById("editDesc").value);
    fd.append("color", document.getElementById("editColor").value);
    const file = document.getElementById("editImage").files[0];
    if (file) fd.append("image", file);
    const toRemove = [];
    Array.from(photosDiv.children).forEach((w) => {
      if (w.dataset.remove) {
        toRemove.push(...w.dataset.remove.split(",").filter((x) => x));
      }
    });
    if (toRemove.length) fd.append("removePhotos", toRemove.join(","));

    fetch("/api/maps/markers/" + id, {
      method: "PUT",
      body: fd,
      headers: { "X-User-Email": window.SOROSPOT_CURRENT_USER_EMAIL },
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
        modal.style.display = "none";
        openMyPinsModal();
        window.location.reload();
      })
      .catch((e) => alert("Erro: " + e));
  };
}
