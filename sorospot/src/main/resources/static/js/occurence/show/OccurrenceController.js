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
                console.log("Abrindo modal de editar1");
                openEditModal();
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

    openEditModal = function() {
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
                alert("Status da ocorrência alterado com sucesso.");
                window.location.reload();
            } else {
                alert('Erro ao alterar status da ocorrência.');
                reference.querySelector("#statusModal").classList.remove("open");
            }
        }).catch(() => {
            alert('Erro ao alterar status da ocorrência.');
            reference.querySelector("#statusModal").classList.remove("open");
        });
    };

    handleDelete = function() {
        const occurrenceId = reference.querySelector("#deleteOccurrenceId").value;
        console.log(window.SOROSPOT_CURRENT_USER_EMAIL)
        fetch("/api/maps/markers/" + occurrenceId, {
            method: "DELETE",
            headers: { "X-User-Email": window.SOROSPOT_CURRENT_USER_EMAIL }
        }).then(response => {
            if (response.ok) {
                alert("Ocorrência excluída com sucesso.");
                window.location.href = '/mapa';
            } else {
                alert("Erro no else ao excluir ocorrência.");
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