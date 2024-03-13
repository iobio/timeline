import * as d3 from 'd3';

export function Table() {
    
    let container;
    let table;
    let thead;
    let tbody;
    let rows;

    function createTable(selector, data) {
        data.sort((a, b) => new Date(a.date) - new Date(b.date));

        container = d3.select(selector)
            .append("div")
            .attr("class", "table-view-container hide")
            .append("div")
            .attr("class", "table-container");
        
        table = container.append('table');

        thead = table.append('thead');
        thead.append('tr')
                .selectAll('th')
                .data(['Event', 'Date', 'Category'])
                .enter()
                .append('th')
                .text(d => d);
    
        tbody = table.append('tbody');
    
        rows = tbody.selectAll('tr')
            .data(data)
            .enter()
            .append('tr');
    
        rows.selectAll('td')
            .data(event => [event.name, event.date, event.category])
            .enter()
            .append('td')
            .text(d => d);
    }

    function updateTable(selector, filteredData) {
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
             .text(function(d) { return d; });
    }
    
    
    return {createTable, updateTable}

}