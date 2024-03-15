import * as d3 from 'd3';

export function SelectionButton() {

    let container;

    function createButton(selector) {
        container = d3.select(selector)
            .append("div")
            .attr("class", "tabs-container")
            .style("display", "flex")
            .style("justify-content", "center")
            .style("align-items", "center")
            .style("height", "40px");
    
        container.append("p")
            .attr("class", "title-text")
            .text("Switch View:")
            .style("padding", "10px")
            .style("font-size", "13px");
    
        const timelineButton = container.append("button")
            .attr("class", "button timeline-view-button")
            .text("Timeline")
            .on("click", function() {
                updateButtonHighlight(this);
                showView('timeline');
            })
            .style("width", "70px")
            .style("height", "20px")
            .style("display", "inline-block")
            .style("text-align", "center")
            .style("vertical-align", "middle")
            .style("line-height", "13px");
    
        container.append("button")
            .attr("class", "button table-view-button")
            .text("Table")
            .on("click", function() {
                updateButtonHighlight(this);
                showView('table');  
            })
            .style("width", "70px")
            .style("height", "20px")
            .style("display", "inline-block")
            .style("text-align", "center")
            .style("vertical-align", "middle")
            .style("line-height", "13px");

        // Highlight the timeline button by default
        updateButtonHighlight(timelineButton.node());
    }

    function updateButtonHighlight(clickedButton) {
        const selector = ".tabs-container";
        
        d3.selectAll(selector + " .button")
            .classed("selected-button", false)             
            .style("background-color", null)
            .style("color", null); 

        d3.select(clickedButton)
            .classed("selected-button", true)
            .style("background-color", "#0f60c3")
            .style("color", "#ffffff");        
    }

    function showView(viewType) {
        const timeline_view = document.querySelector('.timeline-svg');
        const table_view = document.querySelector('.table-view-container');

        if (viewType=== 'timeline') {
            timeline_view.style.display = 'block';
            table_view.style.display = 'none';
        } else if (viewType === 'table'){
            timeline_view.style.display = 'none';
            table_view.style.display = 'block';
        }
    }

    return {createButton}
    
}