// main.js

// load data from csv file and from geojson file
Promise.all([
    d3.dsv(";", "../data/openaq.csv"),
    d3.json("../data/custom3.geo.json")
]).then(function(data) {
    const csvData = data[0];
    const geojsonData = data[1]

    // process csv data to create a mapping from country label to air quality data
    const airQualityData = d3.group(csvData, d => d['Country Label']);
    const aggregatedData = aggregateData(airQualityData);

    // log on console to confirm it works properly
    console.log('AggregatedAir Quality Data:', aggregatedData);

    // populate dropdown with pollutants
    const pollutants = Array.from(new Set(csvData.map(d => d.Pollutant)));
    populateDropdown(pollutants);

    // initial visualization
    visualizeData(geojsonData, aggregatedData, pollutants[0]);

    // update visualization on dropdown change
    d3.select("#update-button").on("click", function() {
        const selectedPollutant = d3.select("#pollutant-select").property("value");
        visualizeData(geojsonData, aggregatedData, selectedPollutant);
    });
});

function populateDropdown(pollutants) {
    const dropdown = d3.select("#pollutant-select");
    dropdown.selectAll("option")
        .data(pollutants)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);
}

function aggregateData(airQualityData) {
    const aggregatedData = new Map();

    airQualityData.forEach((values, country) => {
        const pollutants = d3.group(values, d => d.Pollutant);
        const countryData = {}

        pollutants.forEach((pollutantValues, pollutant) => {
            const avgValue = d3.mean(pollutantValues, d => +d.Value);
            countryData[pollutant] = {
                avgValue: avgValue,
                unit: pollutantValues[0].Unit
            };
        });

        aggregatedData.set(country, countryData)
    });
    return aggregatedData
};

function visualizeData(geojsonData, aggregatedData, selectedPollutant) {
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = window.innerWidth - margin.left - margin.right;
    const height = window.innerHeight - margin.top - margin.bottom;

    d3.select("#visualization").selectAll("svg").remove();

    const svg = d3.select("#visualization")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const projection = d3.geoMercator()
        .scale((height) / (2 * Math.PI))
        .translate([width / 2, height / 2]);

    const path = d3.geoPath()
        .projection(projection);

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.7)")
        .style("color", "#fff")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("transition", "opacity 0.3s");

    // get max value for selected pollutant
    const maxValue = d3.max(Array.from(aggregatedData.values()), d => d[selectedPollutant] ? +d[selectedPollutant].avgValue : 0);

    // create a color scale
    const colorScale = d3.scaleSequential(d3.interpolateReds)
        .domain([0, maxValue]);

    // draw the countries
    svg.selectAll("path")
        .data(geojsonData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", d => {
            const countryName = d.properties.sovereignt;
            const countryData = aggregatedData.get(countryName);
            if (countryData && countryData[selectedPollutant]) {
                return colorScale(+countryData[selectedPollutant].avgValue);
            }
            return "lightgrey";
        })
        .attr("stroke", "white")
        .on("mouseover", function(event, d) {
            const countryName = d.properties.sovereignt;
            const countryData = aggregatedData.get(countryName);

            // Format countryData for the tooltip
            let airDataHtml = "No data available";
            if (countryData && countryData[selectedPollutant]) {
                airDataHtml = `
                    <strong>Pollutant:</strong> ${selectedPollutant}<br>
                    <strong>Average Value:</strong> ${countryData[selectedPollutant].avgValue} ${countryData[selectedPollutant].unit}<br>
                `;
            }

            // print airData to console when hovering over a country
            console.log(`Air data for ${countryName}:`, countryData);

            tooltip.html(`
                <strong>Country:</strong> ${countryName}<br>
                ${airDataHtml}
            `)
                .style("left", `${event.pageX + 5}px`)
                .style("top", `${event.pageY}px`)
                .style("opacity", 1);

            d3.select(this).attr("fill", "Navy");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", `${event.pageX + 5}px`)
                .style("top", `${event.pageY + 5}px`);
        })
        .on("mouseout", function() {
            tooltip.style("opacity", 0);
            d3.select(this).attr("fill", d => {
                const countryName = d.properties.sovereignt;
                const countryData = aggregatedData.get(countryName);
                if (countryData && countryData[selectedPollutant]) {
                    return colorScale(+countryData[selectedPollutant].avgValue);
                }
                return "lightgrey"
            });
        });

        // Add circles for each city
        // svg.selectAll("circle")
        //     .data(csvData)
        //     .enter()
        //     .append("circle")
        //     .attr("cx", d => {
        //         if (d.Coordinates) {
        //             const coords = d.Coordinates.split(',').map(Number);
        //             if (coords.length === 2) {
        //                 return projection(coords)[0];
        //             }
        //         }
        //         return null; // Return null if coordinates are invalid
        //     })
        //     .attr("cy", d => {
        //         if (d.Coordinates) {
        //             const coords = d.Coordinates.split(',').map(Number);
        //             if (coords.length === 2) {
        //                 return projection(coords)[1];
        //             }
        //         }
        //         return null; // Return null if coordinates are invalid
        //     })
        //     .attr("r", 3)
        //     .attr("fill", "red")
        //     .attr("stroke", "black")
        //     .on("mouseover", function(event, d) {
        //         const tooltipHtml = `
        //             <strong>City:</strong> ${d.City}<br>
        //             <strong>Location:</strong> ${d.Location}<br>
        //             <strong>Pollutant:</strong> ${d.Pollutant}<br>
        //             <strong>Value:</strong> ${d.Value} ${d.Unit}<br>
        //             <strong>Last Updated:</strong> ${d['Last Updated']}
        //         `;
        //         tooltip.transition().style("opacity", 1);
        //         tooltip.html(tooltipHtml)
        //             .style("left", `${event.pageX + 5}px`)
        //             .style("top", `${event.pageY + 5}px`);

        //         // Print data for hovered over city to the console
        //         console.log('Hovered city data:', d);
        //     })
        //     .on("mouseout", function() {
        //         tooltip.transition().style("opacity", 0);
        //     });

        // // Remove invalid circles
        // svg.selectAll("circle")
        //     .filter(function(d) {
        //         return d3.select(this).attr("cx") === null || d3.select(this).attr("cy") === null;
        //     })
        //     .remove();

    // add a color bar
    addColorBar(colorScale, maxValue);
}

function addColorBar(colorScale, maxValue) {
    // remove existing color bar
    d3.select("#color-bar").remove();

    const colorBarWidth = 20;
    const colorBarHeight = 300;

    const svg = d3.select("#visualization").select("svg");

    const colorBar = svg.append("g")
        .attr("id", "color-bar")
        .attr("transform", `translate(${svg.attr("width") - colorBarWidth - 40}, 20)`);

    const gradient = colorBar.append("defs")
        .append("linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "0%")
        .attr("y2", "0%");

    gradient.selectAll("stop")
        .data(d3.range(0, 1.1, 0.1))
        .enter()
        .append("stop")
        .attr("offset", d => d)
        .attr("stop-color", d => colorScale(d * maxValue));

    colorBar.append("rect")
        .attr("width", colorBarWidth)
        .attr("height", colorBarHeight)
        .style("fill", "url(#gradient)");

    const yScale = d3.scaleLinear()
        .range([colorBarHeight, 0])
        .domain([0, maxValue]);

    const yAxis = d3.axisRight(yScale)
        .ticks(5);

    colorBar.append("g")
        .attr("class", "y axis")
        .attr("transform", `translate(${colorBarWidth}, 0)`)
        .call(yAxis);
}