document.addEventListener('DOMContentLoaded', function() {
    loadgraphBarUser();
});

/**
 * Fonction permettant de charger le graphique en barres
 */

function loadgraphBarUser(){
    // Définition des marges et dimensions du graphique
    var margin = {top: 30, right: 30, bottom: 70, left: 60},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // Attacher le svg à la div #my_dataviz2
    var svg = d3.select("#dataVizUser")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Parsing des données
    d3.csv("../datasets/modification-count-by-user.csv", function(data) {

        // Axe x
        var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(data.map(function(d) { return d.User; }))
        .padding(0.2);
        svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

            
        var minValue = d3.min(data, function(d) { return +d.ModificationCount; });
        var maxValue = d3.max(data, function(d) { return +d.ModificationCount; });
        // Axe Y
        var y = d3.scaleLinear()
        .domain([minValue - minValue / 10, maxValue + maxValue / 10])
        .range([ height, 0]);
        svg.append("g")
        .call(d3.axisLeft(y));

        // Ajouter un groupe pour chaque barre
        var bars = svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "bar");

        // Ajouter les barres
        bars.append("rect")
            .attr("x", function(d) { return x(d.User); })
            .attr("y", function(d) { return y(d.ModificationCount); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height - y(d.ModificationCount); })
            .attr("fill", "#69b3a2");

        // Ajouter le texte pour afficher la valeur
        bars.append("text")
            .attr("class", "bar-label")
            .attr("x", function(d) { return x(d.User) + x.bandwidth() / 2; })
            .attr("y", function(d) { return y(d.ModificationCount) - 5; })
            .attr("text-anchor", "middle")
            .style("opacity", 0)  // Masquer le texte par défaut
            .text(function(d) { return d.ModificationCount; });

        // Gestion des événements de survol
        bars.on("mouseover", function() {
            d3.select(this).select("rect")
            .attr("stroke", "black")       // Ajoute la bordure noire
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
