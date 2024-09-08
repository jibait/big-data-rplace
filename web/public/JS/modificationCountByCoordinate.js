document.addEventListener('DOMContentLoaded', function() {
    requestRefreshModificationCountByCoordinateUntilSuccess();
});

async function requestRefreshModificationCountByCoordinateUntilSuccess() {
    try {
        const result = await fetch('/modification-count-by-coordinate');
        if (result.ok) {
            console.log("✅ modification-count-by-coordinate loaded successfully, loading graph...");
            loadModificationCountByCoordinate();
            return;
        }
    } catch(e) {}
    console.log("Failed to load modification-count-by-coordinate data, retrying in 5 seconds...");
    setTimeout(requestRefreshModificationCountByCoordinateUntilSuccess, 5000);
}

function loadModificationCountByCoordinate(){
    // Get the div with the id modificationCountByCoordinate and add the image to it
    var div = document.getElementById("modificationCountByCoordinate");
    var img = document.createElement("img");
    img.src = "../datasets/modification-count-by-coordinate.png";
    img.alt = "Modification count by coordinate";
    img.classList.add("data-image");
    div.appendChild(img);
}