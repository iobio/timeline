import * as d3 from 'd3';

export const globalColorScale = (() => {
    let scale;
    return (categories) => {
        if (!scale) { // Initialize the scale if it hasn't been created yet
            const colors = ["#699BF7", "#006400", "#FF0000"];
            if (categories.length > colors.length) {
                scale = d3.scaleOrdinal()
                    .domain(categories)
                    .range(colors.concat(d3.schemeCategory10));
            } else {
                scale = d3.scaleOrdinal()
                    .domain(categories)
                    .range(colors);
            }
        }
        return scale;
    };
})();
