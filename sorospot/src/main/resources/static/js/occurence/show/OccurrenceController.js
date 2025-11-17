function OccurrenceController(reference) {
    let categories = [];
    
    var init = function() {
        toggleHeaderButtonsOnShowOccurrence(reference);
        setTimeout(setupModalControls, 100);
    };

    toggleHeaderButtonsOnShowOccurrence = function(reference) {
        var header = reference.querySelector("header");
        var myPinsButton = header.querySelector("#myPinsBtn");
        var centerBtn = header.querySelector("#centerBtn");
        var addressInput = header.querySelector("#address");
        var searchBtn = header.querySelector("#searchBtn");

        addressInput.setAttribute("disabled", "true");
        searchBtn.setAttribute("disabled", "true");
        myPinsButton.setAttribute("disabled", "true");
        centerBtn.setAttribute("disabled", "true");
    };

    setupModalControls = function() {
        const btnOpenEdit = reference.querySelector("[data-open-edit-modal]");
        const btnOpenDelete = reference.querySelector("[data-open-delete-modal]");
        const btnOpenStatus = reference.querySelector("[data-open-status-modal]");

        const editModal = reference.querySelector("#editModal");
        const deleteModal = reference.querySelector("#deleteModal");
        const statusModal = reference.querySelector("#statusModal");

        const btnCancelEdit = reference.querySelector("#cancelEdit");
        const btnCancelDelete = reference.querySelector("#cancelDelete");
        const btnCancelStatus = reference.querySelector("#cancelStatus");

        if (btnOpenEdit) {
            btnOpenEdit.addEventListener("click", function() {
                openOccurrenceEditModal();
            });
        }

        if (btnOpenDelete) {
            btnOpenDelete.addEventListener("click", function() {
                if (deleteModal) {
                    deleteModal.classList.add("open");
                    const occurrenceId = getOccurrenceIdFromPage();
                    reference.querySelector("#deleteOccurrenceId").value = occurrenceId;
                }
            });
        }

        if (btnOpenStatus) {
            btnOpenStatus.addEventListener("click", function() {
                if (statusModal) {
                    statusModal.classList.add("open");
                    const occurrenceId = getOccurrenceIdFromPage();
                    const currentStatus = getCurrentStatus();
                    reference.querySelector("#statusOccurrenceId").value = occurrenceId;
                    reference.querySelector("#statusSelect").value = currentStatus;
                }
            });
        }

        if (btnCancelEdit && editModal) {
            btnCancelEdit.addEventListener("click", function() {
                editModal.classList.remove("open");
            });
        }

        if (btnCancelDelete && deleteModal) {
            btnCancelDelete.addEventListener("click", function() {
                deleteModal.classList.remove("open");
            });
        }

        if (btnCancelStatus && statusModal) {
            btnCancelStatus.addEventListener("click", function() {
                statusModal.classList.remove("open");
            });
        }

        const statusForm = reference.querySelector("#statusForm");
        if (statusForm) {
            statusForm.addEventListener("submit", function(e) {
                e.preventDefault();
                handleStatusChange();
            });
        }

        const deleteForm = reference.querySelector("#deleteForm");
        if (deleteForm) {
            deleteForm.addEventListener("submit", function(e) {
                e.preventDefault();
                handleDelete();
            });
        }
    };

    formatCategory = function(cat) {
        if (!cat) {
            console.warn("[formatCategory] cat é null/undefined");
            return null;
        }

        const rawType = cat.type || "";
        const displayName = rawType
            ? rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase()
            : "";

        const iconRaw = cat.icon;
        const displayIcon =
            iconRaw && String(iconRaw).toLowerCase() !== "null" && iconRaw.trim() !== ""
                ? iconRaw
                : "location_on";

        const result = { ...cat, displayName, displayIcon };

        return result;
    };

    openOccurrenceEditModal = function() {
        const editModal = reference.querySelector("#editModal");
        const categoryModal = reference.querySelector("#categoryModal");

        const occurrenceId = getOccurrenceIdFromPage();

        if (!occurrenceId) {
            console.warn("[openOccurrenceEditModal] Nenhuma ocorrência encontrada na URL.");
            return;
        }

        const categoriesPromise = fetch("/api/maps/categories")
            .then(r => {
                return r.json();
            })
            .then(cats => {
                categories = cats.map(formatCategory);
                window.categories = categories;
            })
            .catch(e => console.error("[openOccurrenceEditModal] Erro ao carregar categorias:", e));

        const occurrencePromise = fetch("/api/maps/my-occurrences")
            .then(r => {
                if (!r.ok) {
                    return r.text().then(t => {
                        console.error("[openOccurrenceEditModal] Erro bruto da API:", t);
                        throw new Error(t || "Não autorizado");
                    });
                }
                return r.json();
            })
            .then(arr => {
                const found = arr.find(x => x.id == occurrenceId);
                return found;
            });

        Promise.all([categoriesPromise, occurrencePromise])
            .then(([_, item]) => {
                if (!item) {
                    throw new Error("Ocorrência não encontrada ou você não tem permissão para editá-la.");
                }

                // Preencher os campos do modal
                populateEditModal(item);
                
                // Abrir o modal
                editModal.classList.add("open");
            })
            .catch(e => {
                console.error("===== [openOccurrenceEditModal] ERRO =====", e);
                alert("Erro: " + e.message);
            });
    };

    populateEditModal = function(item) {
        // Preencher campos básicos
        reference.querySelector("#editId").value = item.id;
        reference.querySelector("#editTitle").value = item.title || "";
        reference.querySelector("#editDesc").value = item.description || "";

        // Configurar categoria
        const editHidden = reference.querySelector("#editCategory");
        const editTrigger = reference.querySelector("#editCategoryTrigger");
        
        if (editTrigger) {
            editTrigger.onclick = () => openCategoryModal();
        }

        if (categories && categories.length) {
            const currentCat = categories.find(
                (c) => c.type === item.category || c.displayName === item.category
            );
            if (currentCat) {
                if (editHidden) editHidden.value = currentCat.id;
                if (editTrigger) {
                    const icon = editTrigger.querySelector(".material-symbols-outlined.icon");
                    const text = editTrigger.querySelector(".text");
                    const chevron = editTrigger.querySelector(".material-symbols-outlined.chevron");
                    if (icon) {
                        icon.textContent = currentCat.displayIcon;
                        icon.style.color = currentCat.color;
                    }
                    if (text) text.textContent = currentCat.displayName;
                    if (chevron) chevron.style.display = "none";
                }
            }
        }

        // Preencher fotos existentes
        const photosDiv = reference.querySelector("#editPhotos");
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

        // Adicionar botões de navegação se houver mais de 4 fotos
        if (photos.length > 4) {
            photosDiv.style.justifyContent = "center";
            
            const prevBtn = document.createElement("button");
            prevBtn.className = "carousel-nav carousel-prev";
            prevBtn.type = "button";
            prevBtn.innerHTML = '<span class="material-symbols-outlined">chevron_left</span>';
            prevBtn.addEventListener("click", () => {
                photosContainer.scrollBy({ left: -200, behavior: "smooth" });
            });

            const nextBtn = document.createElement("button");
            nextBtn.className = "carousel-nav carousel-next";
            nextBtn.type = "button";
            nextBtn.innerHTML = '<span class="material-symbols-outlined">chevron_right</span>';
            nextBtn.addEventListener("click", () => {
                photosContainer.scrollBy({ left: 200, behavior: "smooth" });
            });

            photosDiv.appendChild(prevBtn);
            photosDiv.appendChild(nextBtn);
        }

        // Configurar submit do formulário
        setupEditFormSubmit();
    };

    openDeletePhotoModal = function(wrapper, photoPath, photosContainer) {
        const deletePhotoModal = reference.querySelector("#deletePhotoModal");
        if (!deletePhotoModal) return;
        
        deletePhotoModal.classList.add("open");

        reference.querySelector("#cancelDeletePhoto").onclick = () => {
            deletePhotoModal.classList.remove("open");
        };

        reference.querySelector("#confirmDeletePhoto").onclick = () => {
            const currentToRemove = photosContainer.dataset.toRemove || "";
            const toRemoveList = currentToRemove ? currentToRemove.split(",") : [];
            if (!toRemoveList.includes(photoPath)) {
                toRemoveList.push(photoPath);
            }
            photosContainer.dataset.toRemove = toRemoveList.join(",");

            wrapper.remove();
            deletePhotoModal.classList.remove("open");
        };
    };

    openCategoryModal = function() {
        const categoryModal = reference.querySelector("#categoryModal");
        const categoryList = reference.querySelector("#categoryList");
        
        if (!categoryModal || !categoryList) return;
        
        categoryList.innerHTML = "";
        
        if (!categories || !categories.length) {
            categoryList.innerHTML = "<p class='modalWarning'>Carregando categorias...</p>";
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
                    const hidden = reference.querySelector("#editCategory");
                    const trig = reference.querySelector("#editCategoryTrigger");
                    
                    if (hidden) hidden.value = cat.id;
                    if (trig) {
                        const iconEl = trig.querySelector(".material-symbols-outlined.icon");
                        const textEl = trig.querySelector(".text");
                        const chevronEl = trig.querySelector(".material-symbols-outlined.chevron");
                        
                        if (iconEl) {
                            iconEl.textContent = cat.displayIcon;
                            iconEl.style.color = cat.color;
                        }
                        if (textEl) textEl.textContent = cat.displayName;
                        if (chevronEl) chevronEl.style.display = "none";
                    }
                    categoryModal.classList.remove("open");
                });
                categoryList.appendChild(card);
            });
        }

        const cancelBtn = reference.querySelector("#cancelCategory");
        if (cancelBtn) {
            cancelBtn.onclick = () => categoryModal.classList.remove("open");
        }

        categoryModal.classList.add("open");
    };

    setupEditFormSubmit = function() {
        const editForm = reference.querySelector("#editForm");
        if (!editForm) return;

        editForm.onsubmit = function(ev) {
            ev.preventDefault();
            
            const id = reference.querySelector("#editId").value;
            const titleVal = reference.querySelector("#editTitle").value;
            const titleInput = reference.querySelector("#editTitle");
            
            if (!titleVal || !titleVal.trim()) {
                if (titleInput) {
                    titleInput.classList.add("input-error");
                    setTimeout(() => titleInput.classList.remove("input-error"), 2000);
                }
                return;
            }

            const categoryId = reference.querySelector("#editCategory").value;
            if (!categoryId) {
                const trigger = reference.querySelector("#editCategoryTrigger");
                if (trigger) {
                    trigger.classList.add("category-error");
                    setTimeout(() => trigger.classList.remove("category-error"), 2000);
                }
                return;
            }

            const fd = new FormData();
            fd.append("title", reference.querySelector("#editTitle").value);
            fd.append("description", reference.querySelector("#editDesc").value);
            fd.append("categoryId", categoryId);

            const file = reference.querySelector("#editImage").files[0];
            if (file) {
                const maxBytes = 10 * 1024 * 1024; // 10MB
                if (file.size > maxBytes) {
                    const input = reference.querySelector("#editImage");
                    if (input) {
                        input.classList.add("input-error");
                        setTimeout(() => input.classList.remove("input-error"), 2500);
                    }
                    return;
                }
                fd.append("image", file);
            }

            const photosContainerElement = reference.querySelector("#editPhotos .edit-photos-container");
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
                    if (!r.ok) {
                        return r.text().then((t) => {
                            throw new Error(t || "Erro ao salvar");
                        });
                    }
                    return r.json();
                })
                .then((res) => {
                    alert("Ocorrência atualizada com sucesso!");
                    window.location.reload();
                })
                .catch((e) => {
                    alert("Erro ao salvar: " + e.message);
                });
        };
    };

    getOccurrenceIdFromPage = function() {
        const url = window.location.pathname;
        const matches = url.match(/\/occurrence\/show\/(\d+)/);
        return matches ? matches[1] : null;
    };

    getCurrentStatus = function() {
        const statusBadge = reference.querySelector(".status-badge");
        if (statusBadge) {
            if (statusBadge.classList.contains("pending")) return "Pendente";
            if (statusBadge.classList.contains("in-progress")) return "Em andamento";
            if (statusBadge.classList.contains("resolved")) return "Resolvida";
            if (statusBadge.classList.contains("canceled")) return "Cancelada";
            if (statusBadge.classList.contains("reopened")) return "Reaberta";
        }
        return "PENDING";
    };

    handleStatusChange = function() {
        const occurrenceId = reference.querySelector("#statusOccurrenceId").value;
        const status = reference.querySelector("#statusSelect").value;
        const userEmail = window.SOROSPOT_CURRENT_USER_EMAIL;

        fetch(`/api/occurrence/${occurrenceId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Email': userEmail
            },
            body: JSON.stringify({ status: status })
        }).then(response => {
            if (response.ok) {
                alert("Status alterado com sucesso!");
                window.location.reload();
            } else {
                alert('Erro ao alterar status.');
                reference.querySelector("#statusModal").classList.remove("open");
            }
        }).catch(() => {
            alert('Erro ao alterar status.');
            reference.querySelector("#statusModal").classList.remove("open");
        });
    };

    handleDelete = function() {
        const occurrenceId = reference.querySelector("#deleteOccurrenceId").value;
        
        fetch("/api/maps/markers/" + occurrenceId, {
            method: "DELETE",
            headers: { "X-User-Email": window.SOROSPOT_CURRENT_USER_EMAIL }
        }).then(response => {
            if (response.ok) {
                alert("Ocorrência excluída com sucesso!");
                window.location.href = '/mapa';
            } else {
                alert("Erro ao excluir ocorrência.");
                reference.querySelector("#deleteModal").classList.remove("open");
            }
        }).catch(() => {
            alert("Erro ao excluir ocorrência.");
            reference.querySelector("#deleteModal").classList.remove("open");
        });
    };

    init();
}

var occurrenceInstance;

document.addEventListener("DOMContentLoaded", function() {
    var reference = document.querySelector(".occurrence");
    occurrenceInstance = new OccurrenceController(reference);
});