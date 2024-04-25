import * as d3 from 'd3';

export function Modal() {
    let modal;
    
    function createModal(selector, {title, fields}) {
        // Remove any existing modal first
        d3.select(selector).selectAll(".modal").remove();

        // if (!show) return;

        modal = d3.select(selector)
            .append("div")
            .attr("class", "modal")
            // .style("display", show ? "flex" : "none")
            .style("display", "flex")
            .style("position", "absolute")
            .style("top", 0)
            .style("left", 0)
            .style("width", "100%")
            .style("height", "100%")
            .style("background-color", "rgba(0, 0, 0, 0.5)")
            .style("justify-content", "center")
            .style("align-items", "center")
            .style("z-index", 9999);

        const content = modal.append("div")
            .attr("class", "modal-content")
            .style("background-color", "#fff")
            // .style("padding", "20px")
            // .style("border-radius", "8px")
            .style("box-shadow", "0 0 10px rgba(0, 0, 0, 0.25)")
            // .style("max-width", "400px")
            // .style("width", "100%");

        content.append("span")
            .attr("class", "close")
            .html("&times;")
            .style("color", "#aaa")
            .style("float", "right")
            .style("font-size", "28px")
            .style("font-weight", "bold")
            .style("cursor", "pointer")
            .on("click", function() {
                modal.remove(); // Close the modal
            });

        content.append("h3").text(title);

        // Append each field in the fields
        fields.forEach(field => {
            content.append("p")
                .html(`<strong>${field.label}:</strong> ${field.value}`);
                // .style("font-size", "12px");  
        });
    }
    
    return {createModal};
    
}
