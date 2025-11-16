function OccurrenceController(reference) {
    
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

    openOccurrenceEditModal = function() {
        const occurrenceId = getOccurrenceIdFromPage();
        if (!occurrenceId) {
            console.warn("Nenhuma ocorrência encontrada na URL.");
            return;
        }

        // Usa a mesma rota do map.js
        fetch("/api/maps/my-occurrences")
            .then(r => {
                if (!r.ok) {
                    return r.text().then(t => {
                        throw new Error(t || "Não autorizado");
                    });
                }
                return r.json();
            })
            .then(arr => {
                const item = arr.find(x => x.id == occurrenceId);
                
                if (!item) {
                    throw new Error("Ocorrência não encontrada ou você não tem permissão para editá-la.");
                }
                
                // Tenta usar a função global do map.js
                if (window.openEditModal) {
                    window.openEditModal(item);
                } else {
                    // Fallback caso map.js não esteja carregado
                    openEditModalFallback(item);
                }
            })
            .catch(e => {
                console.error("Erro ao buscar ocorrência:", e);
                alert("Erro: " + e.message);
            });
    };

    // Fallback completo (cópia do map.js)
    function openEditModalFallback(item) {
        const modal = document.getElementById("editModal");
        if (!modal) return;

        modal.classList.add("open");
        
        document.getElementById("editId").value = item.id;
        document.getElementById("editTitle").value = item.title || "";
        document.getElementById("editDesc").value = item.description || "";

        const editHidden = document.getElementById("editCategory");
        const editTrigger = document.getElementById("editCategoryTrigger");
        
        if (editTrigger) {
            editTrigger.onclick = () => {
                if (window.openCategoryModal) {
                    window.openCategoryModal({
                        hiddenId: "editCategory",
                        triggerId: "editCategoryTrigger"
                    });
                }
            };
        }

        // Carregar categorias se necessário
        if (!window.categories || !window.categories.length) {
            fetch("/api/maps/categories")
                .then(r => r.json())
                .then(cats => {
                    window.categories = cats.map(cat => ({
                        ...cat,
                        displayName: cat.type ? cat.type.charAt(0).toUpperCase() + cat.type.slice(1).toLowerCase() : "",
                        displayIcon: cat.icon && String(cat.icon).toLowerCase() !== "null" && cat.icon.trim() !== "" ? cat.icon : "location_on"
                    }));
                    setCurrentCategory(item, editHidden, editTrigger);
                });
        } else {
            setCurrentCategory(item, editHidden, editTrigger);
        }

        setupPhotosForEdit(item);

        const cancelBtn = document.getElementById("cancelEdit");
        if (cancelBtn) {
            cancelBtn.onclick = () => {
                if (window.SOROSPOT_IMAGE_PICKERS && window.SOROSPOT_IMAGE_PICKERS["editImage"]) {
                    window.SOROSPOT_IMAGE_PICKERS["editImage"].reset();
                }
                modal.classList.remove("open");
            };
        }

        const editForm = document.getElementById("editForm");
        if (editForm) {
            editForm.onsubmit = function(ev) {
                ev.preventDefault();
                handleEditSubmit();
            };
        }
    }

    function setCurrentCategory(item, editHidden, editTrigger) {
        if (window.categories && window.categories.length) {
            const currentCat = window.categories.find(
                c => c.type === item.category || c.displayName === item.category
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
    }

    function setupPhotosForEdit(item) {
        const photosDiv = document.getElementById("editPhotos");
        if (!photosDiv) return;

        photosDiv.innerHTML = "";

        const photosContainer = document.createElement("div");
        photosContainer.className = "edit-photos-container";
        photosContainer.dataset.toRemove = "";

        const photos = item.photos || [];
        
        photos.forEach(p => {
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
                if (window.openDeletePhotoModal) {
                    window.openDeletePhotoModal(wrapper, p, photosContainer);
                } else {
                    if (confirm("Remover esta foto?")) {
                        const currentToRemove = photosContainer.dataset.toRemove || "";
                        const toRemoveList = currentToRemove ? currentToRemove.split(",") : [];
                        if (!toRemoveList.includes(p)) {
                            toRemoveList.push(p);
                        }
                        photosContainer.dataset.toRemove = toRemoveList.join(",");
                        wrapper.remove();
                    }
                }
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

            photosDiv.style.justifyContent = "center";
            photosDiv.appendChild(prevBtn);
            photosDiv.appendChild(nextBtn);
        }
    }

    function handleEditSubmit() {
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
        fd.append("title", titleVal);
        fd.append("description", document.getElementById("editDesc").value);
        fd.append("categoryId", categoryId);
        
        const file = document.getElementById("editImage").files[0];
        if (file) {
            const maxBytes = 10 * 1024 * 1024;
            if (file.size > maxBytes) {
                alert("Arquivo muito grande! Máximo 10MB");
                return;
            }
            fd.append("image", file);
        }

        const photosContainer = document.querySelector("#editPhotos .edit-photos-container");
        if (photosContainer && photosContainer.dataset.toRemove) {
            const toRemove = photosContainer.dataset.toRemove.split(",").filter(x => x.trim());
            if (toRemove.length) {
                fd.append("removePhotos", toRemove.join(","));
            }
        }

        fetch("/api/maps/markers/" + id, {
            method: "PUT",
            body: fd
        })
        .then(r => {
            if (!r.ok) {
                return r.text().then(t => { throw new Error(t); });
            }
            return r.json();
        })
        .then(() => {
            alert("Ocorrência editada com sucesso!");
            document.getElementById("editModal").classList.remove("open");
            window.location.reload();
        })
        .catch(e => {
            console.error("Erro ao editar:", e);
            alert("Erro: " + e.message);
        });
    }

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
            if (statusBadge.classList.contains("closed")) return "Cancelada";
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