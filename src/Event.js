class Event {
    constructor(type, date, description, iconUrl) {
      this.type = type;
      this.date = date;
      this.description = description;
      this.iconUrl = iconUrl;
      this.formattedDate = this.formatDate();
      this.color = this.setColor();
      this.category = this.setCategory();
    }

    setColor() {
        const typeToColorMapping = {
            "Application Submitted": "#699BF7",
            "Medical Records Requested": "#699BF7",
            "Medical Records Received": "#699BF7",
            "Decision Date": "#699BF7",
            "Evaluation Started": "#006400",
            "Sequence Data Received": "#006400",
            "Evaluation Completed": "#006400",
            "Wrap Up Documents": "#006400",
            "Diagnosis entered": "#FF0000",
            "Samples sent to MOSC": "#FF0000",
            "Results Received": "#FF0000",
          };
      
          // Set the color based on the event type
          return typeToColorMapping[this.type] || null;

      
    }

    formatDate() {
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        const eventDate = new Date(this.date);
        const month = months[eventDate.getMonth()];
        const year = eventDate.getFullYear();

        return `${month} ${year}`;
    }

    setCategory() {
        const typeToCategoryMapping = {
            "Application Submitted": "Application",
            "Medical Records Requested": "Application",
            "Medical Records Received": "Application",
            "Decision Date": "Application",
            "Evaluation Started": "Evaluation",
            "Sequence Data Received": "Evaluation",
            "Evaluation Completed": "Evaluation",
            "Wrap Up Documents": "Evaluation",
            "Diagnosis entered": "Diagnosis",
            "Samples sent to MOSC": "Diagnosis",
            "Results Received": "Diagnosis",
          };
      
          // Set the category based on the event type
          return typeToCategoryMapping[this.type] || null;
    }
  }
  
  export default Event;
  