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
            .attr("class", "table-view-container")
            .style("display", "none")
            .append("div")
            .attr("class", "table-container")
            .style("width", "900px")
            .style("height", "450px")
            .style("overflow-y", "auto")
            .style("margin-left", "30px")
            .style("margin-right", "30px")
            .style("margin-top", "20px");
        
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
            .text(d => d)
            .style('padding', '8px')
            .style('text-align', 'left')
            .style('border', '1px solid #ddd');
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
                    .text(function(d) { return d; })
                    .style("padding", "8px")
                    .style("text-align", "left")
                    .style("border", "1px solid #ddd");
    }
    
    
    return {createTable, updateTable}

}