import * as d3 from 'd3';
import Event from './Event.js'; 
import {Modal} from './Modal.js';


function createTimeline(data) {
    let x, x2, xTop, y, y2, mainChart, navChart, width, height, height2, xAxis, xAxisTop, xAxis2, yAxis_left, 
    yAxis_right, brush, container,svg, margin, margin2, defaultSelection, formattedData, minDate, maxDate, mainChartContent, navChartContent;


    // Parse dates
    const parseDate = d3.timeParse("%Y-%m-%d");
    const formatMonthYear = d3.timeFormat("%b %Y");

    formattedData = data.events.map(
        (event) => new Event(event.id, event.name, parseDate(event.date), event.description, event.iconUrl, event.pairEventId,
                             event.eventType, event.status, parseDate(event.estimatedCompleteDate))
    );

    let currentData = [];
    currentData = formattedData;

    console.log("FormattedData", formattedData);
    console.log("CurrentData", currentData);

    container = d3.create("div")
        .attr("class", "timeline-container")
        .style("position", "relative")
        .style("height", "550px")
        .style("width", "960px")
        .style("background-color", "#ffffff")
        .style("border-width", "1px")
        .style("border-style", "ridge")
        .style("border-color", "rgba(0, 0, 0, 0.12)");

    width = 960;
    height = 500;
    svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "timeline-svg");


    margin = {top: 20, right: 20, bottom: 110, left: 20},
    margin2 = {top: 420, right: 20, bottom: 30, left: 20},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    height2 = +svg.attr("height") - margin2.top - margin2.bottom,

    x = d3.scaleTime().range([0, width]),
    x2 = d3.scaleTime().range([0, width]),
    xTop = d3.scaleTime().range([0, width]), 
    y = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height2, 0]);

    xAxis = d3.axisBottom(x)
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

    // Add a count for each month to keep track of events in the same month
    const monthEventCount = {};

    // Loop through the formatted data and update y-coordinate based on the count
    formattedData.forEach(function(d) {
        const monthKey = formatMonthYear(d.date);
        // Extract the second day of the month
        const secondDayOfMonth = new Date(d.date);
        secondDayOfMonth.setDate(2);

        // Add the second day of the month as a new property which will be used to align the events vertically
        d.secondDayOfMonth = secondDayOfMonth;

        if (!monthEventCount[monthKey]) {
            monthEventCount[monthKey] = 1;
        } else {
            monthEventCount[monthKey]++;
        }
        d.verticalOffset = monthEventCount[monthKey]; // New property to store vertical offset
    });

    let lastEventDate = formattedData[formattedData.length - 1].secondDayOfMonth;

    // Calculate next month after last event and five months before that
    let nextMonthAfterLastEvent = d3.utcMonth.offset(lastEventDate, 1);
    let fiveMonthsBeforeNext = d3.utcMonth.offset(nextMonthAfterLastEvent, -6);

    // Ensure fiveMonthsBeforeNext is not before the min date
    if (fiveMonthsBeforeNext < minDate) {
        fiveMonthsBeforeNext = minDate;
        // Adjust nextMonthAfterLastEvent to maintain 6 month range
        nextMonthAfterLastEvent = d3.utcMonth.offset(fiveMonthsBeforeNext, 6);
    }

    let endOfTimeline = d3.timeYear.offset(d3.timeYear.ceil(maxDate), 1);

    // Ensure nextMonthAfterLastEvent is not beyond the max date
    if (nextMonthAfterLastEvent > endOfTimeline) {
        nextMonthAfterLastEvent = endOfTimeline;
        // Adjust fiveMonthsBeforeNext to maintain 6 month range
        fiveMonthsBeforeNext = d3.utcMonth.offset(nextMonthAfterLastEvent, -6);
    }

    // Set default selection
    defaultSelection = [x2(fiveMonthsBeforeNext), x2(nextMonthAfterLastEvent)];

    console.log("defaultSelection", defaultSelection);

    mainChart.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    mainChart.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis_left);

    mainChart.append("g")
        .attr("class", "axis axis--y")
        .attr("transform", "translate(" + width + ",0)")
        .call(yAxis_right);

    mainChart.selectAll(".tick line")
        .attr("class", "tick-line")
        .style("stroke", "rgb(221, 221, 221)")
        .style("stroke-dasharray", "7, 5")
        .style("stroke-width", "1");

    mainChartContent.selectAll(".dot")
    .data(formattedData)
    .enter().append("circle") // Use circle instead of image
    .attr("class", "dot") 
    .attr("cx", d => x(d.date)) // Use cx for the center x position
    .attr("cy", d => d.verticalOffset * 40) // Use cy for the center y position
    .attr("r", 8) 
    .style("fill", function(d) { return d.color; })
    .style("stroke", "#fff");


    mainChartContent.selectAll(".dotText")
        .data(formattedData)
        .enter().append("text")
        .attr("class", "dotText")
        .attr("x", d => x(d.date))
        .attr("y", d => d.verticalOffset * 40 + 20) // Align the text vertically with the circle
        .attr("text-anchor", "middle") // Center the text around its x position
        .text(function(d) { return d.name; })
        .on("click", function(event, d) {
            console.log('dotText clicked', d);
            openModal('.timeline-container', d.name, d.description);
        })
        .on("mouseover", function(event, d) {
            d3.select(this)
                .style("fill", function(d) { return d.color; });
        })
        .on("mouseout", function(event, d) {
            d3.select(this)
                .style("fill", "black"); // Revert to original color on mouseout
        })
        .style("fill", "black")
        .style("font-size", "10px")
        .style("font-family", "sans-serif");


    drawRectangles(currentData);
    drawCurrentDateMarker();
  

    navChartContent.selectAll(".dotContext")
        .data(formattedData)
        .enter().append("circle") 
        .attr("class", "dotContext") // Assign a class for styling
        .attr("cx", d => x2(d.date))
        .attr("cy", d => height2 / 4 + d.verticalOffset * 7)
        .attr("r", 3)
        .style("fill", function(d) { return d.color; })
        .style("stroke", "#fff");

    navChart.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);

    navChart.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, defaultSelection);

    svg.append("g")
        .attr("class", "axis axis--x-top")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(xAxisTop);

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
    .style("font-size", "10px");


   
    function brushed(event) {
        let s = event.selection || defaultSelection;
        let fixedBrushWidth = defaultSelection[1] - defaultSelection[0];
    
        if (s[1] - s[0] !== fixedBrushWidth) {
            if (event.sourceEvent && event.sourceEvent.type === "mousemove") {
                // Adjust the brush position while maintaining the fixed size
                let newStart = s[0];
                let newEnd = newStart + fixedBrushWidth;
    
                // Prevent the brush from exceeding the right boundary
                if (newEnd > x2.range()[1]) {
                    newEnd = x2.range()[1];
                    newStart = newEnd - fixedBrushWidth;
                }
    
                // Update the selection
                s = [newStart, newEnd];
                d3.select(".navChart .brush").call(brush.move, s);
            }
        }
    
        x.domain(s.map(x2.invert, x2));

        
        mainChartContent.selectAll(".dot")
            .attr("cx", d => x(d.date)) // Use cx for the center x position
            .attr("cy", d => d.verticalOffset * 40) // Use cy for the center y position
            .attr("r", 8)

    
        mainChartContent.selectAll(".dotText")
            .attr("x", d => x(d.date))
            .attr("y", d => d.verticalOffset * 40 + 20)
            .attr("text-anchor", "middle"); // Center the text around its x position
    
        mainChart.select(".axis--x").call(xAxis);
    
        mainChart.selectAll(".tick line")
            .attr("class", "tick-line")
            .style("stroke", "rgb(222, 221, 221)")
            .style("stroke-dasharray", "7, 5")
            .style("stroke-width", "1");


        updateCurrentDateMarker();
        drawRectangles(currentData);
          
    }


    function updateChart(selectedOption) {
        if (selectedOption) {
            currentData = formattedData.filter(d => d.category === selectedOption)
        } else {
            currentData = formattedData;
        }

        if (currentData.length > 0) {
            let lastEventDate = currentData[currentData.length - 1].secondDayOfMonth;
            
            let nextMonthAfterLastEvent = d3.utcMonth.offset(lastEventDate, 1);
            let fiveMonthsBeforeNext = d3.utcMonth.offset(nextMonthAfterLastEvent, -6);
    
            // Ensure fiveMonthsBeforeNext is not before the min date
            if (fiveMonthsBeforeNext < minDate) {
                fiveMonthsBeforeNext = minDate;
                // Adjust nextMonthAfterLastEvent to maintain 6 month range
                nextMonthAfterLastEvent = d3.utcMonth.offset(fiveMonthsBeforeNext, 6);
            }
    
            let endOfTimeline = d3.timeYear.offset(d3.timeYear.ceil(maxDate), 1);
    
            // Ensure nextMonthAfterLastEvent is not beyond the max date
            if (nextMonthAfterLastEvent > endOfTimeline) {
                nextMonthAfterLastEvent = endOfTimeline;
                // Adjust fiveMonthsBeforeNext to maintain 6 month range
                fiveMonthsBeforeNext = d3.utcMonth.offset(nextMonthAfterLastEvent, -6);
            }
    
            // Set new defaultSelection based on updated dates
            defaultSelection = [x2(fiveMonthsBeforeNext), x2(nextMonthAfterLastEvent)];
        }

        console.log("filteredData", currentData);
        console.log("New defaultSelection", defaultSelection);

        updateMainChart('.timeline-container',currentData);
        updateNavChart(currentData);
        drawRectangles(currentData);

        // Update the brush to reflect the new defaultSelection
        navChart.select(".brush").call(brush.move, defaultSelection);
    }


    function updateMainChart(selector,filteredData) {
        // Clear existing elements
        const mainChart = d3.select(".mainChartContent");
        mainChart.selectAll(".dot, .dotText").remove();

        mainChart.selectAll(".dot")
            .data(filteredData)
            .enter().append("circle") // Use circle instead of image
            .attr("class", "dot") 
            .attr("cx", d => x(d.date)) // Use cx for the center x position
            .attr("cy", d => d.verticalOffset * 40) // Use cy for the center y position
            .attr("r", 8) 
            .style("fill", function(d) { return d.color; })
            .style("stroke", "#fff");


        mainChart.selectAll(".dotText")
            .data(filteredData)
            .enter().append("text")
            .attr("class", "dotText")
            .attr("x", d => x(d.date))
            .attr("y", d => d.verticalOffset * 40 + 20)
            .text(function(d) { return d.name; })
            .attr("text-anchor", "middle") // Center the text around its x position
            .style("fill", "black")
            .style("font-size", "10px")
            .style("font-family", "sans-serif")
            .on("click", function(event, d) {
                openModal(selector, d.name, d.description);
            }.bind(this))
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .style("fill", function(d) { return d.color; });
            })
            .on("mouseout", function(event, d) {
                d3.select(this)
                    .style("fill", "black"); // Revert to original color on mouseout
            });
    }


    function updateNavChart(filteredData) {
        // Clear existing elements
        const navChart = d3.select(".navChartContent");
        navChart.selectAll(".dotContext").remove();
    
        // Add new elements based on filtered data
        navChart.selectAll(".dotContext")
            .data(filteredData)
            .enter().append("circle")
            .attr("class", "dotContext")
            .attr("cx", d => x2(d.secondDayOfMonth))
            .attr("cy", d => height2 / 4 + d.verticalOffset * 7)
            .attr("r", 3)
            .style("fill", function(d) { return d.color; });
    
    }


    function openModal(selector, name, description) {
        const modal = Modal();
        modal.createModal(selector, {
            show: true,
            name: name,
            description: description,
        });
    }


    function drawRectangles(data) {
        // Remove any existing rectangles
        mainChartContent.selectAll(".event-rect").remove();
    
        const drawRectangle = (startDate, endDate, startY, rectClass, fillColor, adjustEndX = true, isEstimatedEndDate = false, isSingleEvent = false) => {
            const startX = x(startDate) - 8; 
            let endX = x(endDate) + (adjustEndX ? 8 : 0);
            const opacity = isSingleEvent ? 0.5 : 0.3;

            mainChartContent.append("rect")
                .attr("class", rectClass)
                .attr("x", startX)
                .attr("y", startY)
                .attr("width", endX - startX)
                .attr("height", 20) 
                .attr("fill", fillColor)
                .attr("rx", 2)
                .attr("ry", 2)
                .style("opacity", opacity)
                .on("mouseover", function(event, d) {
                    d3.select(this).attr("fill", "orange"); // Highlight color
                    
                    const endDateText = isEstimatedEndDate ? "Estimated End: " : "End: ";
                    const tooltipText = "Start: " + d3.timeFormat("%B %d, %Y")(startDate) +
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
                    d3.select(this).attr("fill", fillColor); // Reset to original color
                    
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
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
            const startY = pair[0].verticalOffset * 40 - 10;
    
            if (pair.length === 2) {
                drawRectangle(pair[0].date, pair[1].date, startY, "event-rect", pair[0].color, true, false, false);
            } else if (pair.length === 1) {
                // Check if the end date is the estimatedCompleteDate
                const isCurrentDate = !pair[0].estimatedCompleteDate;
                // For a single event extending to the current date, adjustEndX is false, and check if it's estimated
                drawRectangle(pair[0].date, new Date(), startY, "event-rect", pair[0].color, false, isCurrentDate, true);
                // If there's an estimatedCompleteDate, draw a rectangle from the start date to the estimated date
                if (pair[0].estimatedCompleteDate) {
                    drawRectangle(pair[0].date, pair[0].estimatedCompleteDate, startY, "event-rect", pair[0].color, true, true, true);
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
        const dateFormat = d3.timeFormat("%Y-%m-%d");
    
        // Remove existing annotation
        mainChartContent.selectAll('.current-date-annotation').remove();
    
        // Append a text element for the current date annotation
        mainChartContent.append('text')
            .attr('x', currentDateX)
            .attr('y', height) 
            .attr('dy', '-0.5em')
            .attr('text-anchor', 'middle')
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


export {createTimeline};





