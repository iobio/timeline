import * as d3 from 'd3';
import Event from './Event.js'; 
import {Modal} from './Modal.js';
import {SelectionButton} from './SelectionButton.js';
import {Table} from './Table.js';
import { globalColorScale } from './colorScale.js';
import '@mdi/font/css/materialdesignicons.min.css';



function createTimeline(data) {
    let x, x2, xTop, y, y2, mainChart, navChart, width, height, height2, xAxis, xAxisTop, xAxis2, yAxis_left, 
    yAxis_right, brush, container,svg, margin, margin2, defaultSelection, formattedData, minDate, maxDate, 
    mainChartContent, navChartContent, brushHandle, colorScale;


    // Parse dates
    const parseDate = d3.timeParse("%Y-%m-%d");

    formattedData = data.map(
        (event) => new Event(event.id, event.name, parseDate(event.date), event.description, event.category, event.iconUrl, event.pairEventId,
                             event.eventType, event.status, parseDate(event.estimatedCompleteDate))
    );

    let currentData = [];
    currentData = formattedData;

    container = d3.create("div")
        .attr("class", "timeline-container")
        .style("position", "relative")
        .style("height", "100%")
        .style("width", "960px")
        .style("background-color", "#ffffff")
        .style("border-width", "1px")
        .style("border-style", "ridge")
        .style("border-color", "rgba(0, 0, 0, 0.12)");

    // Create the chips container
    const chipsContainer = container.append("div")
        .attr("class", "filter-chips-container")
        .style("padding-top", "20px")
        .style("padding-left", "30px")
        .style("padding-right", "30px")
        .style("padding-bottom", "0px")
        .style("display", "flex")
        .style("flex-wrap", "wrap")
        .style("justify-content", "start")
        .style("max-height", "55px")
        .style("overflow-y", "auto");

        const categories = Array.from(new Set(data.map(d => d.category)));

        // Define color scale for chips
        colorScale = globalColorScale(categories);

        // Create the "None" chip for showing all data
        chipsContainer.append("div")
        .style("background-color", "#CCCCCC")
        .style("padding", "5px")
        .style("margin-left", "0px")
        .style("margin-right", "5px")
        .style("margin-bottom", "3px")
        .style("margin-top", "3px")
        .style("border-radius", "10px")
        .style("max-width", "110px")
        .attr("class", "category-chip")
        .text("All events")
        .style("font-size", "10px")
        .style("font-family", "sans-serif")
        .style("color", "white")
        .style("overflow", "hidden")
        .style("white-space", "nowrap")
        .style("text-overflow", "ellipsis")
        .on("click", function() {
            console.log("Clicked on: Show all data");
            const category = null;
            updateChart(category);
            const d3Table = Table();
            d3Table.updateTable('.timeline-container', data, category);
        })
        .on("mouseover", function() {
            d3.select(this).style("box-shadow", "0 0 0px 2px #CCCCCC")
                            .style("cursor", "pointer");
        })
        .on("mouseout", function() {
            d3.select(this).style("box-shadow", "none")
                            .style("cursor", "default");
        });

        
        // Populate the chips with categories and colors
        categories.forEach(category => {
           
            chipsContainer.append("div")
                .style("background-color", d3.color(colorScale(category)))
                .style("padding", "5px")
                .style("margin-left", "0px")
                .style("margin-right", "5px")
                .style("margin-bottom", "3px")
                .style("margin-top", "3px")
                .style("border-radius", "10px")
                .style("max-width", "110px")
                .attr("class", "category-chip")
                .text(category)
                .style("font-size", "10px")
                .style("font-family", "sans-serif")
                .style("color", "white")
                .style("overflow", "hidden")
                .style("white-space", "nowrap")
                .style("text-overflow", "ellipsis")
                .on("click", function() {
                    console.log("Clicked on category:", category);
                    updateChart(category);
                   
                    const d3Table = Table();
                    d3Table.updateTable('.timeline-container', data, category);

                })
                .on("mouseover", function(event) {
                    d3.select(this).style("box-shadow", `0 0 0px 2px ${d3.color(colorScale(category))}`)
                                    .style("cursor", "pointer");

                    // Check if the text is truncated
                    const isTextTruncated = this.scrollWidth > this.clientWidth;

                    if (isTextTruncated) {
                        const tooltipText = category;
                        // Update tooltip content and position only if text is truncated
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", .9)

                        const chipHeight = this.getBoundingClientRect().height; 
                        const spacing = 5;
                        const tooltipTop = event.pageY - event.offsetY + chipHeight + spacing + "px";

                        tooltip.html(tooltipText)
                            .style("left", (event.pageX - event.offsetX) + "px")
                            .style("top", tooltipTop);
                    }
                })
                .on("mouseout", function() {
                    d3.select(this).style("box-shadow", "none")
                                    .style("cursor", "default");
                    
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0);
                })
        });


    width = 960;
    height = 520;
    svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "timeline-svg");

    margin = {top: 20, right: 30, bottom: 130, left: 30},
    margin2 = {top: 420, right: 30, bottom: 30, left: 30},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    height2 = +svg.attr("height") - margin2.top - margin2.bottom,

    x = d3.scaleTime().range([0, width]),
    x2 = d3.scaleTime().range([0, width]),
    xTop = d3.scaleTime().range([0, width]), 
    y = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height2, 0]);

    xAxis = d3.axisBottom(x)
                .ticks(d3.timeMonth.every(1))
                .tickFormat(d3.timeFormat("%b %Y")) 
                .tickSize(-height);

    xAxisTop = d3.axisTop(xTop)
                .tickSize(0)
                .tickFormat("");

    xAxis2 = d3.axisBottom(x2)
                .tickFormat(d3.timeFormat("%Y"));

    yAxis_left = d3.axisLeft(y)
                    .tickSize(0)
                    .tickFormat("");

    yAxis_right = d3.axisRight(y)
                    .tickSize(0)
                    .tickFormat("");

    brush = d3.brushX()
        .extent([[0, 0], [width, height2]])
        .on("brush end", brushed); 

    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    mainChart = svg.append("g")
        .attr("class", "mainChart")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    navChart = svg.append("g")
        .attr("class", "navChart")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    mainChartContent = mainChart.append("g")
    .attr("class", "mainChartContent")
    .style("clip-path", "url(#clip)");

    navChartContent = navChart.append("g")
    .attr("class", "navChartContent")
    .style("clip-path", "url(#clip)");

    minDate = d3.min(formattedData, function(d) { return d.date; });
    maxDate = d3.max(formattedData, function(d) { return d.date; });

    // Adjust to start at the beginning of the minDate year and end at the end of current year
    x.domain([d3.timeYear.floor(minDate), d3.timeYear.ceil(maxDate)]);
    x2.domain([d3.timeYear.floor(minDate), d3.timeYear.ceil(new Date())]);

    xTop.domain(x.domain());
    y2.domain(y.domain());

    // Assign row numbers to events based on their placement in rows
    formattedData = assignRowNumber(formattedData);

    console.log("formattedData", formattedData);

    let lastEventDate = formattedData[formattedData.length - 1].date;
    let lastEventYearStart = d3.timeYear.floor(lastEventDate); // Start of the year of the last event
    let nextYearStart = d3.timeYear.offset(lastEventYearStart, 1); // Start of the next year

    // Set default selection to span the entire year of the last event
    defaultSelection = [x2(lastEventYearStart), x2(nextYearStart)];

    console.log("defaultSelection", defaultSelection);

    mainChart.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("path, line")
        .style("stroke", "#c5c2c2")
        .style("stroke-width", "1");

    mainChart.append("g")
        .attr("class", "axis axis--x-top")
        .attr("transform", "translate(0,0)")
        .call(xAxisTop)
        .selectAll("path, line")
        .style("stroke", "#c5c2c2")
        .style("stroke-width", "1");

    mainChart.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis_left)
        .selectAll("path, line")
        .style("stroke", "#c5c2c2")
        .style("stroke-width", "1");
        

    mainChart.append("g")
        .attr("class", "axis axis--y")
        .attr("transform", "translate(" + width + ",0)")
        .call(yAxis_right)
        .selectAll("path, line")
        .style("stroke", "#c5c2c2")
        .style("stroke-width", "1");

    mainChart.selectAll(".tick line")
        .attr("class", "tick-line")
        .style("stroke", "rgb(221, 221, 221)")
        .style("stroke-dasharray", "2, 2")
        .style("stroke-width", "1");

    mainChartContent.selectAll(".dot")
        .data(formattedData)
        .enter().append("foreignObject")
        .attr("class", "dot") // Assign a class for styling
        .attr("x", d => x(d.date)) // Use x for the center x position
        .attr("y", d => d.rowNumber * 35) // Use y for the center y position
        .attr("width", 20) 
        .attr("height", 20)
        .append("xhtml:i")
        .style("font-size", "20px")
        .style("display", "flex")
        .style("align-items", "center")
        .style("justify-content", "center")
        .style("height", "100%")
        .style("color", function(d) { return colorScale(d.category); })
        .attr("class", d => "mdi " + d.iconUrl)
        .style("font-family", "Material Design Icons")
        // .data(formattedData)
        // .enter().append("image") 
        // .attr("class", "dot") // Assign a class for styling
        // .attr("href", function(d) { return d.iconUrl; })
        // .attr("x", d => x(d.date)) // Use x for the center x position
        // .attr("y", d => d.rowNumber * 35) // Use y for the center y position
        // .attr("width", 20) 
        // .attr("height", 20)
        .on("mouseover", function(event, d) {
            d3.select(this).style("cursor", "pointer")

            const tooltipText = "<span style='background-color: purple; color: white; border-radius: 4px; padding: 3px; display: inline-block;'>Status: Completed</span>" + "<br/>" +
            "Date: " + d3.timeFormat("%B %d, %Y")(d.date);

            // Update tooltip content
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(tooltipText)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseout", function(d) {
            d3.select(this).style("cursor", "default")
            
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });


    mainChartContent.selectAll(".dotText")
        .data(formattedData)
        .enter().append("text")
        .attr("class", "dotText")
        .attr("x", d => x(d.date))
        .attr("y", d => d.rowNumber * 35 + 30) // Align the text vertically with the circle
        // .attr("text-anchor", "middle") // Center the text around its x position
        .text(function(d) { return d.name; })
        .on("click", function(event, d) {
            console.log('dotText clicked', d);
            openModal('.timeline-container', d.name, d.description);
        })
        .on("mouseover", function(event, d) {
            d3.select(this)
                .style("fill", function(d) { return colorScale(d.category); })
                .style("cursor", "pointer");
        })
        .on("mouseout", function(event, d) {
            d3.select(this)
                .style("fill", "black") // Revert to original color on mouseout
                .style("cursor", "default");
        })
        .style("fill", "black")
        .style("font-size", "10px")
        .style("font-family", "sans-serif");


    drawMainChartRectangles(currentData);
    drawCurrentDateMarker();
  

    navChartContent.selectAll(".dotContext")
        .data(formattedData)
        .enter().append("circle") 
        .attr("class", "dotContext") // Assign a class for styling
        .attr("cx", d => x2(d.date))
        .attr("cy", d => d.rowNumber * 7)
        .attr("r", 2)
        .style("fill", function(d) { return colorScale(d.category); })
        .style("stroke", "#fff");

    drawNavChartRectangles(currentData);

    navChart.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2)
        .selectAll("path, line")
        .style("stroke", "#c5c2c2")
        .style("stroke-width", "1");

    const navBrush = navChart.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, defaultSelection);

    // style brush resize handle
    const brushHandlePath = d => {
        const e = +(d.type === "e"),
        x = e ? 1 : -1,
        y = height2;
        return (
        "M" + 0.5 * x + "," + y + "A6,6 0 0 " + e + " " + 6.5 * x + "," + (y + 6) + "V" + (2 * y - 6) + "A6,6 0 0 " + e + " " + 0.5 * x + "," +
        2 * y + "Z" + "M" + 2.5 * x + "," + (y + 8) + "V" + (2 * y - 8) + "M" + 4.5 * x + "," + (y + 8) + "V" + (2 * y - 8)
        );
    };

    brushHandle = navBrush
        .selectAll(".handle--custom")
        .data([{ type: "w" }, { type: "e" }])
        .enter()
        .append("path")
        .attr("class", "handle--custom")
        .attr("stroke", "#000")
        .attr("cursor", "ew-resize")
        .attr("d", brushHandlePath)
        .attr("transform", function(d, i) {
            return "translate(" + [defaultSelection[i], -height2] + ")"
        });



    // Add wheel event listener to the brush area
    navBrush.on("wheel", function(event) {
        // Prevent page scrolling
        event.preventDefault();

        // Calculate the change in brush size based on the wheel event
        const zoomIntensity = 0.001;
        const delta = event.deltaY * zoomIntensity;

        // Calculate new selection range
        let [x0, x1] = d3.brushSelection(this) || defaultSelection;
        let move = (x1 - x0) * delta;
        x0 -= move;
        x1 += move;

        // Constrain the new selection to the maximum and minimum extents
        const maxExtent = x2.range()[1];
        const minExtent = 0;
        if (x0 < minExtent) x0 = minExtent;
        if (x1 > maxExtent) x1 = maxExtent;

        // Apply the new brush selection
        d3.select(this).call(brush.move, [x0, x1]);
    });


    navBrush.selectAll('.overlay')
        .on('mousedown touchstart', function(event) { // Listen for start of interaction
            // Prevent default brush behavior
            event.stopImmediatePropagation();
            // Get click position
            const clickX = d3.pointer(event, this)[0];
            // Recenter brush
            recenterBrushOnClick(clickX);
        });


    // Tooltip setup
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("padding", "10px")
        .style("background", "rgb(255,255,255)")
        .style("border", "1px solid black")
        .style("border-radius", "5px")
        .style("pointer-events", "none") // Ensure the tooltip doesn't interfere with mouse events
        .style("z-index", "10000")
        .style("font-size", "10px")
        .style("height", "auto") 
        .style("overflow", "hidden") 
        .style("word-wrap", "break-word");



    function getYearFraction(startDate, endDate) {
        const oneYearInDays = 365.25; // Average considering leap years
        const diffInDays = (endDate - startDate) / (1000 * 60 * 60 * 24); // Convert milliseconds to days
        const diffInYears = diffInDays / oneYearInDays;
        return Math.round(diffInYears);
    }

    function updateAxis(event) {
        let selection = event.selection || defaultSelection;

        let startDate = x2.invert(selection[0]), // Convert pixel coordinates back to dates
        endDate = x2.invert(selection[1]);

        x.domain([startDate, endDate]); // Update x domain with new dates
        let yearsDiff = getYearFraction(startDate, endDate);

        // Dynamically adjust ticks based on date range
        if (yearsDiff <= 1) {
            xAxis.ticks(d3.timeMonth.every(1));
        } else if (yearsDiff <= 2) {
            xAxis.ticks(d3.timeMonth.every(2));
        } else if (yearsDiff <= 4) {
            xAxis.ticks(d3.timeMonth.every(3));
        } else if (yearsDiff <= 8) {
            xAxis.ticks(d3.timeMonth.every(6));
        } else {
            xAxis.ticks(d3.timeYear.every(1));
        }

        // Apply the updated xAxis with a transition
        mainChart.select(".axis--x")
          .transition()
          .duration(500)
          .call(xAxis);

      }
      


    function brushed(event) {
        let selection = event.selection || defaultSelection;
        
        const minSelectionSize = 1; // Minimum selection size in pixels
        if (selection[1] - selection[0] < minSelectionSize) {
            if (selection[0] === defaultSelection[0]) {
                
                selection[1] = selection[0] + minSelectionSize;
            } else {
               
                selection[0] = selection[1] - minSelectionSize;
            }
            d3.select(this).call(brush.move, selection);
        }

        mainChartContent.selectAll(".dot")
            .attr("x", d => x(d.date)) // Use cx for the center x position
            .attr("y", d => d.rowNumber * 35) // Use cy for the center y position
            .attr("width", 20) 
            .attr("height", 20)

        // Calculate the scale factor based on the domain of the x-axis
        const currentDomain = x.domain();
        const totalDomain = x2.domain();
        const scaleFactor = (totalDomain[1] - totalDomain[0]) / (currentDomain[1] - currentDomain[0]);
        const textSizeScaleFactor = Math.min(10, scaleFactor);

        mainChartContent.selectAll(".dotText")
            .attr("x", d => x(d.date))
            .attr("y", d => d.rowNumber * 35 + 30)
            // .attr("text-anchor", "middle") // Center the text around its x position
            .style("font-size", textSizeScaleFactor + "px")
            .style("display", textSizeScaleFactor <= 3 ? "none" : null);
        
        mainChart.selectAll(".tick line")
            .attr("class", "tick-line")
            .style("stroke", "rgb(222, 221, 221)")
            .style("stroke-dasharray", "2, 2")
            .style("stroke-width", "1");

        if (selection) {
            brushHandle = navChart.selectAll(".handle--custom")
                                    .data([{ type: "w" }, { type: "e" }])
                                    .attr("transform", function(d, i) { 
                                        return "translate(" + [selection[i], -height2] + ")"; 
                                    });
                                
        }

        updateCurrentDateMarker();
        drawMainChartRectangles(currentData);
        updateAxis(event);
          
    }



    

    function recenterBrushOnClick(clickX) {
        const brushWidth = defaultSelection[1] - defaultSelection[0]; // Width of the brush in pixels
        const halfBrushWidth = brushWidth / 2;
        let newBrushStart = clickX - halfBrushWidth;
        let newBrushEnd = clickX + halfBrushWidth;
    
        // Ensure chart boundaries
        const [X0, X1] = x2.range();
        
        // Adjust the start and end if they go out of bounds
        if (newBrushStart < X0) {
            newBrushStart = X0;
            newBrushEnd = newBrushStart + brushWidth;
        } else if (newBrushEnd > X1) {
            newBrushEnd = X1;
            newBrushStart = newBrushEnd - brushWidth;
        }

        // Move the brush to the new position
        navChart.select(".brush").call(brush.move, [newBrushStart, newBrushEnd]);
    }
    
    

    function updateChart(selectedOption) {
        if (selectedOption) {
            currentData = formattedData.filter(d => d.category === selectedOption)
        } else {
            currentData = formattedData;
        }

        if (currentData.length > 0) {
            let lastEventDate = currentData[currentData.length - 1].date;
            let lastEventYearStart = d3.timeYear.floor(lastEventDate);
            let nextYearStart = d3.timeYear.offset(lastEventYearStart, 1); 
    
            // Set new defaultSelection based on updated dates
            defaultSelection = [x2(lastEventYearStart), x2(nextYearStart)];
    
            // Update the x domain based on the new defaultSelection for the main chart
            x.domain([d3.timeYear.floor(lastEventYearStart), d3.timeYear.ceil(nextYearStart)]);
    
            // Redraw the x axis with the updated domain
            mainChart.select(".axis--x").call(xAxis);
    
        }

        console.log("filteredData", currentData);
        console.log("New defaultSelection", defaultSelection);

        updateMainChart('.timeline-container', currentData);
        updateNavChart(currentData);
        drawMainChartRectangles(currentData);
        drawNavChartRectangles(currentData);
      

        // Update the brush to reflect the new defaultSelection
        navChart.select(".brush").call(brush.move, defaultSelection);
    }



    function updateMainChart(selector,filteredData) {
        // Clear existing elements
        const mainChartContent = d3.select(".mainChartContent");
        mainChartContent.selectAll(".dot, .dotText").remove();

        mainChartContent.selectAll(".dot")
            .data(filteredData)
            .enter().append("foreignObject")
            .attr("class", "dot") // Assign a class for styling
            .attr("x", d => x(d.date)) // Use x for the center x position
            .attr("y", d => d.rowNumber * 35) // Use y for the center y position
            .attr("width", 20) 
            .attr("height", 20)
            .append("xhtml:i")
            .style("font-size", "20px")
            .style("display", "flex")
            .style("align-items", "center")
            .style("justify-content", "center")
            .style("height", "100%")
            .style("color", function(d) { return colorScale(d.category); })
            .attr("class", d => "mdi " + d.iconUrl)
            .style("font-family", "Material Design Icons")
            // .enter().append("image") 
            // .attr("class", "dot") // Assign a class for styling
            // .attr("href", function(d) { return d.iconUrl; })
            // .attr("x", d => x(d.date)) // Use x for the center x position
            // .attr("y", d => d.rowNumber * 35) // Use y for the center y position
            // .attr("width", 20) 
            // .attr("height", 20)
            .on("mouseover", function(event, d) {
                d3.select(this).style("cursor", "pointer")

                const tooltipText = "<span style='background-color: purple; color: white; border-radius: 4px; padding: 3px; display: inline-block;'>Status: Completed</span>" + "<br/>" +
                "Date: " + d3.timeFormat("%B %d, %Y")(d.date);
    
                // Update tooltip content
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(tooltipText)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY + 10) + "px");
            })
            .on("mouseout", function(d) {
                d3.select(this).style("cursor", "default")
                
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });


        mainChartContent.selectAll(".dotText")
            .data(filteredData)
            .enter().append("text")
            .attr("class", "dotText")
            .attr("x", d => x(d.date))
            .attr("y", d => d.rowNumber * 35 + 30)
            .text(function(d) { return d.name; })
            // .attr("text-anchor", "middle") // Center the text around its x position
            .style("fill", "black")
            .style("font-size", "10px")
            .style("font-family", "sans-serif")
            .on("click", function(event, d) {
                openModal(selector, d.name, d.description);
            }.bind(this))
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .style("fill", function(d) { return colorScale(d.category); })
                    .style("cursor", "pointer");
            })
            .on("mouseout", function(event, d) {
                d3.select(this)
                    .style("fill", "black") // Revert to original color on mouseout
                    .style("cursor", "default");
            });

    }



    function updateNavChart(filteredData) {
        // Clear existing elements
        const navChartContent = d3.select(".navChartContent");
        navChartContent.selectAll(".dotContext").remove();
    
        // Add new elements based on filtered data
        navChartContent.selectAll(".dotContext")
            .data(filteredData)
            .enter().append("circle")
            .attr("class", "dotContext")
            .attr("cx", d => x2(d.date))
            .attr("cy", d => d.rowNumber * 7)
            .attr("r", 2)
            .style("fill", function(d) { return colorScale(d.category); });
        
    }



    function openModal(selector, name, description) {
        const modal = Modal();
        modal.createModal(selector, {
            show: true,
            name: name,
            description: description,
        });
    }



    function assignRowNumber(data) {
        // Sort events by date
        data.sort((a, b) => new Date(a.date) - new Date(b.date));
    
        const rows = {};
        let rowEndDate = {};

        const currentDate = new Date();
    
        // Group paired events by their pairEventId
        const eventPairs = {};
        data.forEach(event => {
            if (event.eventType === "paired") {
                if (!eventPairs[event.pairEventId]) {
                    eventPairs[event.pairEventId] = [event];
                } else {
                    eventPairs[event.pairEventId].push(event);
                }
            }
        });
    
        // Helper function to find the row number of the paired event
        const findPairedEventRow = (pairedEventId) => {
            for (const row in rows) {
                if (rows[row].some(event => event.pairEventId === pairedEventId)) {
                    return row;
                }
            }
            return null;
        };
    
        // Iterate through events to assign them to rows
        data.forEach(event => {
            let placed = false;
    
            // Check if this is a paired event and if its pair has already been placed in a row
            if (event.eventType === "paired") {
                const pairedRow = findPairedEventRow(event.pairEventId);
                if (pairedRow) {
                    rows[pairedRow].push(event);
                    // rowEndDate[pairedRow] = new Date(Math.max(new Date(rowEndDate[pairedRow]), new Date(event.date), new Date(event.estimatedCompleteDate || event.date)));
                    let newEndDate = new Date(Math.max(new Date(rowEndDate[pairedRow]), new Date(event.date), new Date(event.estimatedCompleteDate || event.date)));
                    newEndDate.setDate(newEndDate.getDate() + 12); // Add 12 days
                    rowEndDate[pairedRow] = newEndDate;
                    placed = true;
                }
            }
    
            // Check all rows to find a place for the current event
            for (let rowNum = 1; rowNum <= Object.keys(rows).length + 1 && !placed; rowNum++) {
                if (!rows[rowNum]) {
                    rows[rowNum] = [];
                    rowEndDate[rowNum] = new Date(0); // Initialize with a past date
                }
    
                // Check if the event can be placed in this row based on rowEndDate
                if (new Date(event.date) > rowEndDate[rowNum]) {
                    rows[rowNum].push(event);
                    // rowEndDate[rowNum] = new Date(event.date);
                    let newEndDate = new Date(event.date);
                    newEndDate.setDate(newEndDate.getDate() + 12); // Add 12 days
                    rowEndDate[rowNum] = newEndDate;
                    placed = true;
    
                    // If the event is paired and its pair is not yet placed, place it in the same row
                    if (event.eventType === "paired" && eventPairs[event.pairEventId].length === 2) {
                        const pair = eventPairs[event.pairEventId].find(e => e.id !== event.id);
                        if (pair) {
                            rows[rowNum].push(pair);
                            // rowEndDate[rowNum] = new Date(Math.max(new Date(rowEndDate[rowNum]), new Date(pair.date), new Date(pair.estimatedCompleteDate || pair.date)));
                            let newEndDate = new Date(Math.max(new Date(rowEndDate[rowNum]), new Date(pair.date), new Date(pair.estimatedCompleteDate || pair.date)));
                            newEndDate.setDate(newEndDate.getDate() + 12); // Add 12 days
                            rowEndDate[rowNum] = newEndDate;
                        }
                    }
                    if (event.eventType === "paired" && eventPairs[event.pairEventId].length === 1) {
                        rows[rowNum].push(event);
                        // rowEndDate[rowNum] = new Date(Math.max(new Date(rowEndDate[rowNum]), new Date(event.date), new Date(event.estimatedCompleteDate || event.date), new Date(currentDate)));
                        let newEndDate = new Date(Math.max(new Date(rowEndDate[rowNum]), new Date(event.date), new Date(event.estimatedCompleteDate || event.date), new Date(currentDate)));
                        newEndDate.setDate(newEndDate.getDate() + 12); // Add 12 days
                        rowEndDate[rowNum] = newEndDate;
                    }
                }
            }
        });
    
        // Assign row numbers to events based on their placement in rows
        Object.keys(rows).forEach(rowNum => {
            rows[rowNum].forEach(event => {
                event.rowNumber = rowNum;
            });
        });
    
        return data;
    }


    
    function drawMainChartRectangles(data) {
        // Remove any existing rectangles
        mainChartContent.selectAll(".event-rect").remove();
    
        const drawRectangle = (startDate, endDate, startY, rectClass, fillColor, adjustEndX = true, isCurrentDate = false, addToolTip = true) => { 
            const startX = x(startDate); 
            let endX;

            if (isCurrentDate) {
                const endDate = new Date();
                endX = x(endDate) + (adjustEndX ? 20 : 0);
            } else {
                endX = x(endDate) + (adjustEndX ? 20 : 0);
            }
            const opacity = 0.3;
            

         
            const rect = mainChartContent.append("rect")
                    .attr("class", rectClass)
                    .attr("x", startX)
                    .attr("y", startY + 10)
                    .attr("width", endX - startX)
                    .attr("height", 20) 
                    .attr("fill", fillColor)
                    .attr("rx", 2)
                    .attr("ry", 2)
                    .style("opacity", opacity)

            if (addToolTip) {
                    rect.on("mouseover", function(event, d) {
                        d3.select(this).style("cursor", "pointer");

                        const endDateText = isCurrentDate ? "<span style='color: red;'>Estimated End:</span> "  : "End: ";
                        const statusText = isCurrentDate ? "Status: In Progress" : "Status: Completed";
                        const tooltipText = "<span style='background-color: purple; color: white; border-radius: 4px; padding: 3px; display: inline-block;'>" + statusText + "</span>" +
                                            "<br/>" + "Start: " + d3.timeFormat("%B %d, %Y")(startDate) +
                                            "<br/>" + endDateText + d3.timeFormat("%B %d, %Y")(endDate);
                    
                        // Update tooltip content
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", .9);
                        tooltip.html(tooltipText)
                            .style("left", (event.pageX) + "px")
                            .style("top", (event.pageY + 10) + "px");
                    })
                    .on("mouseout", function(d) {
                        d3.select(this).style("cursor", "default");

                        tooltip.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });
            }
            
            
        };
    
        // Process events to find pairs and draw rectangles
        const eventPairs = {};
        data.forEach(event => {
            if (event.eventType === "paired") {
                if (!eventPairs[event.pairEventId]) {
                    eventPairs[event.pairEventId] = [event];
                } else {
                    eventPairs[event.pairEventId].push(event);
                }
            }
        });
    
        Object.values(eventPairs).forEach(pair => {
            const startY = pair[0].rowNumber * 35 - 10;
    
            if (pair.length === 2) {
                drawRectangle(pair[0].date, pair[1].date, startY, "event-rect", colorScale(pair[0].category), true, false, true);
            } else if (pair.length === 1) {
            
                // If there's an estimatedCompleteDate, draw a rectangle from the start date to the estimated date
                if (pair[0].estimatedCompleteDate && pair[0].estimatedCompleteDate > new Date()) {
                    drawRectangle(pair[0].date, pair[0].estimatedCompleteDate, startY, "event-rect", "#cccccc", false, false, false);
                    drawRectangle(pair[0].date, pair[0].estimatedCompleteDate, startY, "event-rect", colorScale(pair[0].category), false, true, true);
                    
                } else {
                    drawRectangle(pair[0].date, pair[0].estimatedCompleteDate, startY, "event-rect", colorScale(pair[0].category), false, true, true);
                }
            }
        });
    }



    function drawNavChartRectangles(data) {
    
        navChartContent.selectAll(".nav-event-rect").remove(); // Clear existing rectangles
    
        const drawRectangle = (startDate, endDate, startY, rectClass, fillColor, adjustEndX = true, isCurrentDate = false) => {
            const startX = x2(startDate); 
            let endX;

            if (isCurrentDate) {
                const endDate = new Date();
                endX = x2(endDate) + (adjustEndX ? 1 : 0);
            } else {
                endX = x2(endDate) + (adjustEndX ? 1 : 0); 
            }

            const opacity = 0.5;
    
            navChartContent.append("rect")
                .attr("class", rectClass)
                .attr("x", startX)
                .attr("y", startY)
                .attr("width", endX - startX)
                .attr("height", 2)
                .attr("fill", fillColor)
                .style("opacity", opacity);
        };

        // Process events to find pairs and draw rectangles
        const eventPairs = {};
        data.forEach(event => {
            if (event.eventType === "paired") {
                if (!eventPairs[event.pairEventId]) {
                    eventPairs[event.pairEventId] = [event];
                } else {
                    eventPairs[event.pairEventId].push(event);
                }
            }
        });
    
        Object.values(eventPairs).forEach(pair => {
            const startY = pair[0].rowNumber * 7 - 1;
    
            if (pair.length === 2) {
                drawRectangle(pair[0].date, pair[1].date, startY, "nav-event-rect", colorScale(pair[0].category), true, false);
            } else if (pair.length === 1) {

                // If there's an estimatedCompleteDate, draw a rectangle from the start date to the estimated date
                if (pair[0].estimatedCompleteDate && pair[0].estimatedCompleteDate > new Date()) {
                    drawRectangle(pair[0].date, pair[0].estimatedCompleteDate, startY, "nav-event-rect", "#cccccc", false, false);
                    drawRectangle(pair[0].date, pair[0].estimatedCompleteDate, startY, "nav-event-rect", colorScale(pair[0].category), false, true);
                } else {
                    drawRectangle(pair[0].date, pair[0].estimatedCompleteDate, startY, "nav-event-rect", colorScale(pair[0].category), false, true);
                }
            }
        });
    }



    function drawCurrentDateMarker() {
        const currentDate = new Date();
        const currentDateX = x(currentDate);
    
        // Append a line for the current date
        mainChartContent.append('line')
            .attr('x1', currentDateX)
            .attr('x2', currentDateX)
            .attr('y1', 0)
            .attr('y2', height) 
            .attr('stroke', 'red')
            .attr('class', 'current-date-line-marker');

    }
    


    function updateCurrentDateMarker() {
        const currentDate = new Date();
        const currentDateX = x(currentDate);
    
        // Update the position of the line
        mainChartContent.select('.current-date-line-marker')
            .attr('x1', currentDateX)
            .attr('x2', currentDateX);

        drawCurrentDateAnnotation();
    }



    function drawCurrentDateAnnotation() {
        const currentDate = new Date();
        const currentDateX = x(currentDate);
        const dateFormat = d3.timeFormat("%B %d, %Y");
    
        // Remove existing annotation
        mainChartContent.selectAll('.current-date-annotation').remove();
    
        // Append a text element for the current date annotation
        mainChartContent.append('text')
            .attr('x', currentDateX)
            .attr('y', height) 
            .attr('dy', '-0.5em')
            .attr('text-anchor', 'start')
            .attr('fill', 'red')
            .attr('class', 'current-date-annotation')
            .text("Today " + dateFormat(currentDate))
            .style("font-size", "10px");
    }
    
    
    return {
        dom: container.node(),
        update: updateChart
    }
}


export {createTimeline, SelectionButton, Table, Event};





