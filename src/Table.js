import * as d3 from 'd3';
import { globalColorScale } from './colorScale.js';

export function Table() {
    
    let container;
    let table;
    let thead;
    let tbody;
    let rows;

    function createTable(selector, data) {
        const categories = Array.from(new Set(data.map(d => d.category)));
        const colorScale = globalColorScale(categories);
        data = sortData(data);

        container = d3.select(selector)
            .append("div")
            .attr("class", "table-view-container")
            .style("display", "none")
            .append("div")
            .attr("class", "table-container")
            .style("width", "900px")
            .style("height", "470px")
            .style("overflow-y", "auto")
            .style("margin-left", "30px")
            .style("margin-right", "30px")
            .style("margin-top", "20px")
            .style("margin-bottom", "20px");
        
        table = container.append('table')
            .attr('class', 'table')
            .style('width', '100%')
            .style('border-collapse', 'collapse')
            .style('font-size', '13px');

        thead = table.append('thead')
            .attr('class', 'thead-dark')
            .style('background-color', '#f2f2f2');

        thead.append('tr')
                .selectAll('th')
                .data(['Event', 'Date', 'Category'])
                .enter()
                .append('th')
                .text(d => d)
                .style('padding', '8px')
                .style('text-align', 'left')
                .style('border', '1px solid #ddd')
    
        tbody = table.append('tbody');
    
        rows = tbody.selectAll('tr')
            .data(data)
            .enter()
            .append('tr');
    
        rows.selectAll('td')
            .data(event => [event.name, event.date, event.category])
            .enter()
            .append('td')
            // .text(d => d)
            .html(function(d, i) {
                // Check if this is the category cell
                if (i === 2) {
                    return `<span class="dot" style="height: 10px; width: 10px; background-color: ${colorScale(d)}; border-radius: 50%; display: inline-block; margin-right: 5px;"></span>${d}`;
                } else {
                    return d;
                }
            })
            .style('padding', '8px')
            .style('text-align', 'left')
            .style('border', '1px solid #ddd')
            .style('max-width', '250px')
            .style('white-space', 'normal')
            .style('word-wrap', 'break-word');
    }


    function updateTable(selector, data, category) {
        let filteredData;

        if (category) {
            filteredData = data.filter(d => d.category === category)
        }
        else {
            filteredData = data;
        }

        const categories = Array.from(new Set(filteredData.map(d => d.category)));
        const colorScale = globalColorScale(categories);
        filteredData = sortData(filteredData);
     
        let tbody = d3.select(selector).select("tbody");
    
        let rows = tbody.selectAll("tr")
                        .data(filteredData);
    
        rows.exit().remove();

        let enterRows = rows.enter().append("tr");
    
        // Merge enter and update selections for rows
        rows = enterRows.merge(rows);
    
        // Now bind cell data for each row
        let cells = rows.selectAll("td")
                        .data(function(event) {
                            return [event.name, event.date, event.category];
                        });
    
        cells.exit().remove();
    
        cells.enter().append("td")
                    .merge(cells)
                    // .text(function(d) { return d; })
                    .html(function(d, i) {
                        if (i === 2) { // Category column
                            return `<span class="dot" style="height: 10px; width: 10px; background-color: ${colorScale(d)}; border-radius: 50%; display: inline-block; margin-right: 5px;"></span>${d}`;
                        } else {
                            return d;
                        }
                    })
                    .style("padding", "8px")
                    .style("text-align", "left")
                    .style("border", "1px solid #ddd")
                    .style('max-width', '200px')
                    .style('white-space', 'normal')
                    .style('word-wrap', 'break-word');
    }


    function sortData(data){
        data.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Group paired events together and single events individually
        const groupedEvents = data.reduce((acc, event) => {
            let key;
            if (event.eventType === 'paired') {
                // Use pairEventId for paired events
                key = `paired-${event.pairEventId}`;
            } else {
                // Use a combination of id and eventType for single events
                key = `single-${event.id}`;
            }

            if (!acc[key]) {
                acc[key] = { events: [event], earliestDate: new Date(event.date) };
            } else {
                acc[key].events.push(event);
                if (new Date(event.date) < acc[key].earliestDate) {
                    acc[key].earliestDate = new Date(event.date);
                }
            }

            return acc;
        }, {});

        // // Convert the grouped events into an array and sort it
        // const sortedGroups = Object.values(groupedEvents).sort((a, b) => a.earliestDate - b.earliestDate);

        // // Flatten the sorted groups back into a single array of events
        // const sortedData = sortedGroups.flatMap(group => group.events);

        // return sortedData;


        // Merge paired events and sort groups
        let mergedData = Object.values(groupedEvents).map(group => {
            if (group.events.length > 1 && group.events[0].eventType === 'paired') {
                let startEvent = group.events.find(e => e.status === 'started');
                let endEvent = group.events.find(e => e.status === 'completed');
                return {
                    ...group.events[0], // base the merged object on the first event
                    name: `${startEvent.name} -- ${endEvent.name}`,
                    date: `Start: ${startEvent.date} -- End: ${endEvent.date}`,
                    isMergedEvent: true // A flag to indicate this is a merged paired event
                };
            } else {
                return group.events[0]; // Single events or unpaired events are unchanged
            }
        });

        return mergedData;

    }
    
     
    return {createTable, updateTable}

}