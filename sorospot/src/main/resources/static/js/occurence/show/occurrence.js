function occurrence(reference) {
    
    var init = function() {
        toggleHeaderButtonsOnShowOccurrence(reference);
    }

    toggleHeaderButtonsOnShowOccurrence = function(reference) {
        var myPinsButton = reference.querySelector("#myPinsBtn");
        var centerBtn = reference.querySelector("#centerBtn");
        var addressInput = reference.querySelector("#address");
        var searchBtn = reference.querySelector("#searchBtn");

        addressInput.setAttribute("disabled", "true");
        searchBtn.setAttribute("disabled", "true");
        myPinsButton.setAttribute("disabled", "true");
        centerBtn.setAttribute("disabled", "true");
    }

    init();
}

var occurrence;

document.addEventListener("DOMContentLoaded", function() {
    var reference = document.querySelector("header");
    occurrence = new occurrence(reference);
});