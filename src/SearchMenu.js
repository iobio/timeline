import * as d3 from 'd3';
import {Table} from './Table.js';

export function SearchMenu() {

    const options = [
        { text: 'None', value: '' },
        { text: 'Application', value: 'Application' },
        { text: 'Evaluation', value: 'Evaluation' },
        { text: 'Diagnosis', value: 'Diagnosis' }
    ];

    let selectedOption = '';

    let container;
    let select;

    function createSearchMenu(selector, onOptionSelected, data) {
        container = d3.select(selector)
            .append("div")
            .attr("class", "search-menu");

        container.append("p")
            .attr("class", "title-text")
            .text("Filter:");

        select = container.append("select")
            .style("background-color", "#efefef");

        select.append('option')
            .text('Please select a category')
            .attr('value', '')
            .attr('disabled', true)
            .attr('selected', true);

        select.selectAll('null')
        .data(options) 
        .enter() 
        .append('option')
        .text(d => d.text)
        .attr('value', d => d.value);

        select.on('change', function() {
            selectedOption = d3.select(this).node().value; // Update the selectedOption with the current value
            onOptionSelected(selectedOption);

            const filteredData = selectedOption ? 
            data.filter(d => d.category === selectedOption) : data;
            
            const d3Table = Table();
            const tableContainer = document.querySelector('.timeline-container')
            d3Table.updateTable(tableContainer, filteredData);
            
        });
    }

    return {
        createSearchMenu
    }

}