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
        // Botões de abrir modais
        const btnOpenEdit = reference.querySelector("[data-open-edit-modal]");
        const btnOpenDelete = reference.querySelector("[data-open-delete-modal]");
        const btnOpenStatus = reference.querySelector("[data-open-status-modal]");

        // Modais
        console.log(reference);
        console.log(reference.querySelector("#editModal"));
        const editModal = reference.querySelector("#editModal");
        const deleteModal = reference.querySelector("#deleteModal");
        const statusModal = reference.querySelector("#statusModal");

        // Botões de cancelar
        const btnCancelEdit = reference.querySelector("#cancelEdit");
        const btnCancelDelete = reference.querySelector("#cancelDelete");
        const btnCancelStatus = reference.querySelector("#cancelStatus");

        // Abrir modal de editar
        if (btnOpenEdit) {
            btnOpenEdit.addEventListener("click", function() {
                console.log("Abrindo modal de editar1");
                openEditModal();
            });
        }

        // Abrir modal de excluir
        if (btnOpenDelete) {
            btnOpenDelete.addEventListener("click", function() {
                if (deleteModal) {
                    deleteModal.classList.add("open");
                    // Pegar o ID da ocorrência da URL ou de um atributo data
                    const occurrenceId = getOccurrenceIdFromPage();
                    reference.querySelector("#deleteOccurrenceId").value = occurrenceId;
                }
            });
        }

        // Abrir modal de status
        if (btnOpenStatus) {
            btnOpenStatus.addEventListener("click", function() {
                if (statusModal) {
                    statusModal.classList.add("open");
                    // Pegar o ID e status atual da ocorrência
                    const occurrenceId = getOccurrenceIdFromPage();
                    const currentStatus = getCurrentStatus();
                    reference.querySelector("#statusOccurrenceId").value = occurrenceId;
                    reference.querySelector("#statusSelect").value = currentStatus;
                }
            });
        }

        // Fechar modal de editar
        if (btnCancelEdit && editModal) {
            btnCancelEdit.addEventListener("click", function() {
                editModal.classList.remove("open");
            });
        }

        // Fechar modal de excluir
        if (btnCancelDelete && deleteModal) {
            btnCancelDelete.addEventListener("click", function() {
                deleteModal.classList.remove("open");
            });
        }

        // Fechar modal de status
        if (btnCancelStatus && statusModal) {
            btnCancelStatus.addEventListener("click", function() {
                statusModal.classList.remove("open");
            });
        }

        // Submit do form de status
        const statusForm = reference.querySelector("#statusForm");
        if (statusForm) {
            statusForm.addEventListener("submit", function(e) {
                e.preventDefault();
                handleStatusChange();
            });
        }

        // Submit do form de excluir
        const deleteForm = reference.querySelector("#deleteForm");
        if (deleteForm) {
            deleteForm.addEventListener("submit", function(e) {
                e.preventDefault();
                handleDelete();
            });
        }
    };

    openEditModal = function() {
        console.log("Abrindo modal de editar");
    }

    // Função auxiliar para pegar o ID da ocorrência da URL
    getOccurrenceIdFromPage = function() {
        const url = window.location.pathname;
        const matches = url.match(/\/occurrence\/show\/(\d+)/);
        return matches ? matches[1] : null;
    };

    getCurrentStatus = function() {
        const statusBadge = reference.querySelector(".status-badge");
        if (statusBadge) {
            if (statusBadge.classList.contains("pending")) return "PENDING";
            if (statusBadge.classList.contains("in-progress")) return "IN_PROGRESS";
            if (statusBadge.classList.contains("resolved")) return "RESOLVED";
            if (statusBadge.classList.contains("closed")) return "CLOSED";
            if (statusBadge.classList.contains("reopened")) return "REOPENED";
        }
        return "PENDING";
    };

    // Função para lidar com alteração de status
    handleStatusChange = function() {
        const occurrenceId = reference.querySelector("#statusOccurrenceId").value;
        const newStatus = reference.querySelector("#statusSelect").value;
        
        console.log("Alterando status da ocorrência", occurrenceId, "para", newStatus);
        
        // TODO: Implementar chamada API
        // fetch(`/api/occurrence/${occurrenceId}/status`, {
        //     method: 'PATCH',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ status: newStatus })
        // }).then(response => {
        //     if (response.ok) {
        //         window.location.reload();
        //     }
        // });

        // Por enquanto, apenas fecha o modal
        reference.querySelector("#statusModal").classList.remove("open");
    };

    // Função para lidar com exclusão
    handleDelete = function() {
        const occurrenceId = reference.querySelector("#deleteOccurrenceId").value;
        
        console.log("Excluindo ocorrência", occurrenceId);
        
        // TODO: Implementar chamada API
        // fetch(`/api/occurrence/${occurrenceId}`, {
        //     method: 'DELETE'
        // }).then(response => {
        //     if (response.ok) {
        //         window.location.href = '/mapa';
        //     }
        // });

        // Por enquanto, apenas fecha o modal
        reference.querySelector("#deleteModal").classList.remove("open");
    };

    init();
}

var occurrenceInstance;

document.addEventListener("DOMContentLoaded", function() {
    var reference = document.querySelector(".occurrence");
    occurrenceInstance = new OccurrenceController(reference);
});