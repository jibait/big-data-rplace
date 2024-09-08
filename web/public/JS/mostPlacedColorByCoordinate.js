document.addEventListener('DOMContentLoaded', function() {
    requestRefreshMostPlacedColorByCoordinateUntilSuccess();
});

async function requestRefreshMostPlacedColorByCoordinateUntilSuccess() {
    try {
        const result = await fetch('/most-placed-color-by-coordinate');
        if (result.ok) {
            console.log("✅ most-placed-color-by-coordinate loaded successfully, loading graph...");
            loadMostPlacedColorByCoordinate();
            return;
        }
    } catch(e) {}
    console.log("Failed to load most-placed-color-by-coordinate data, retrying in 5 seconds...");
    setTimeout(requestRefreshMostPlacedColorByCoordinateUntilSuccess, 5000);
}

function loadMostPlacedColorByCoordinate(){
    // Get the div with the id modificationCountByCoordinate and add the image to it
    var div = document.getElementById("mostPlacedColorByCoordinate");
    var img = document.createElement("img");
    img.src = "../datasets/most-placed-color-by-coordinate.png";
    img.alt = "Modification count by coordinate";
    img.classList.add("data-image");
    div.appendChild(img);
}