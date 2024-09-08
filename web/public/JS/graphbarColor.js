document.addEventListener('DOMContentLoaded', function() {
    requestRefreshModificationCountByColorUntilSuccess();
});

async function requestRefreshModificationCountByColorUntilSuccess() {
    try {
        const result = await fetch('/modification-count-by-color');
        console.log(result);
        if (result.ok) {
            console.log("✅ modification-count-by-color loaded successfully, loading graph...");
            loadgraphBar();
            return;
        }
    } catch(e) {}
    console.log("Failed to load modification-count-by-color data, retrying in 5 seconds...");
    setTimeout(requestRefreshModificationCountByColorUntilSuccess, 5000);
}

/**
 * Fonction permettant de charger le graphique en barres
 */

function loadgraphBar(){
    // Définition des marges et dimensions du graphique
    var margin = {top: 30, right: 50, bottom: 70, left: 80},
        width = 750 - margin.left - margin.right,
        height = 650 - margin.top - margin.bottom;

    // Attacher le svg à la div 
    var svg = d3.select("#dataVizColor")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Chargement des données des couleurs
    var colorData = loadColors();
    var colorNames = colorData.map(c => c.name);
    var colorHexMap = new Map(colorData.map(c => [c.hex, c.name])); // Map des couleurs hexadécimales vers les noms

    // Parsing des données
    d3.csv("../datasets/modification-count-by-color.csv", function(data) {

        // Axe x
        var x = d3.scaleBand()
            .range([0, width])
            .domain(colorNames)  // légende des couleurs avec leurs noms
            .padding(0.2);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");

        var minValue = d3.min(data, function(d) { return +d.ModificationCount; });
        var maxValue = d3.max(data, function(d) { return +d.ModificationCount; });

        // Axe y logarithmique
        var y = d3.scaleLog()
            .base(10)
            .domain([minValue - minValue / 10, maxValue + maxValue / 10])
            .range([height, 0]);

        // Ajout de l'axe y
        var yAxis = d3.axisLeft(y)
            .ticks(10, ",")  // Nombre de ticks sur l'axe y
            .tickFormat(d3.format(",.0f")); // Format des ticks en valeurs entières (éviter d'avoir 1+e3 par exemple)

        svg.append("g")
            .call(yAxis);

        // Ajouter un groupe pour chaque barre
        var bars = svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "bar");

        // Ajouter les barres
        bars.append("rect")
            .attr("x", function(d) { return x(colorHexMap.get(d.Color)); })
            .attr("y", function(d) { return y(d.ModificationCount); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height - y(d.ModificationCount); })
            .attr("fill", function(d) { 
                return d.Color;
            });

        // Ajouter le texte pour afficher la valeur
        bars.append("text")
            .attr("class", "bar-label")
            .attr("x", function(d) { return x(colorHexMap.get(d.Color)) + x.bandwidth() / 2; })
            .attr("y", function(d) { return y(d.ModificationCount) - 5; })
            .attr("text-anchor", "middle")
            .style("opacity", 0)  // Masquer le texte par défaut
            .text(function(d) { return d.ModificationCount; });

        // Gestion des événements de survol
        bars.on("mouseover", function() {
            d3.select(this).select("rect")
              .attr("stroke", "black")       // Ajoute la bordure noire, stroke car c'est un SVG
              .attr("stroke-width", 1);      // Définit l'épaisseur de la bordure
            d3.select(this).select("text")
              .style("opacity", 1);          // Affiche la valeur au survol
        })
        .on("mouseout", function() {
            d3.select(this).select("rect")
              .attr("stroke", "none");      // Retire la bordure
            d3.select(this).select("text")
              .style("opacity", 0);         // Masque la valeur après le survol
        });
    });
}

/**
 * Fonction permettant de convertir les valeurs hexadécimales des couleurs en noms de couleurs
 * @returns {Array} Un tableau d'objets contenant le nom et la valeur hexadécimale de chaque couleur
 */
function loadColors(){
    return [
        { name: "Noir",         hex: "#000000" },
        { name: "Blanc",        hex: "#FFFFFF" },
        { name: "Orange",       hex: "#FF4500" },
        { name: "Bleu",         hex: "#2450A4" },
        { name: "Or",           hex: "#FFD635" },
        { name: "Rouge",        hex: "#BE0039" },
        { name: "Bleu Ciel",    hex: "#51E9F4" },
        { name: "Violet",       hex: "#811E9F" },
        { name: "Ambre",        hex: "#FFA800" },
        { name: "Rose",         hex: "#FF99AA" },
        { name: "Bleu Clair",   hex: "#3690EA" },
        { name: "Vert",         hex: "#00A368" },
        { name: "Gris",         hex: "#898D90" },
        { name: "Citron Vert",  hex: "#7EED56" },
        { name: "Gris Clair",   hex: "#D4D7D9" },
        { name: "Marron",       hex: "#9C6926" },
        { name: "Pêche",        hex: "#FFB470" },
        { name: "Rose Foncé",   hex: "#FF3881" },
        { name: "Violet Foncé", hex: "#B44AC0" },
        { name: "Marron Foncé", hex: "#6D482F" },
        { name: "Émeraude",     hex: "#00CC78" },
        { name: "Bleu Royal",   hex: "#493AC1" },
        { name: "Jaune Clair",  hex: "#FFF8B8" },
        { name: "Charbon",      hex: "#515252" },
        { name: "Crimson",      hex: "#6D001A" },
        { name: "Magenta",      hex: "#DE107F" },
        { name: "Sarcelle",     hex: "#00756F" },
        { name: "Bleu Violet",  hex: "#6A5CFF" },
        { name: "Bleu Gris",    hex: "#94B3FF" },
        { name: "Cyan",         hex: "#009EAA" },
        { name: "Lavande",      hex: "#E4ABFF" },
        { name: "Turquoise",    hex: "#00CCC0" }
    ];
}