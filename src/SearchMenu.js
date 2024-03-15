import * as d3 from 'd3';

export function SearchMenu() {
    let selectedOption = '';
    let container;
    let select;

    function createSearchMenu(selector, onOptionSelected, data) {
        // Extract unique categories from data
        const uniqueCategories = Array.from(new Set(data.map(d => d.category)));

        // Create options array including a default 'None' option
        const defaultOption = { text: 'None', value: '' };
        const categoryOptions = uniqueCategories.map(category => ({
            text: category,
            value: category
        }));
        const options = [defaultOption, ...categoryOptions];

        container = d3.select(selector)
            .append("div")
            .attr("class", "search-menu")
            .style("display", "flex")
            .style("justify-content", "center")
            .style("align-items", "center")
            .style("height", "40px");
          
        container.append("p")
            .attr("class", "title-text")
            .text("Filter:")
            .style("padding", "10px")
            .style("font-size", "13px");
            
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
            const filteredData = selectedOption ? 
            data.filter(d => d.category === selectedOption) : data;

            onOptionSelected(selectedOption, filteredData);
            
        });
    }

    return {
        createSearchMenu
    }

}