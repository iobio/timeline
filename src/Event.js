class Event {
    constructor(id, name, date, description, iconUrl, pairEventId, eventType, status, estimatedCompleteDate ) {
      this.id = id
      this.name = name;
      this.date = date;
      this.description = description;
      this.iconUrl = iconUrl;
      this.pairEventId = pairEventId;
      this.eventType = eventType;
      this.status = status;
      this.estimatedCompleteDate = estimatedCompleteDate;
      this.formattedDate = this.formatDate();
      this.category = this.setCategory();
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
      
          // Set the category based on the event name
          return typeToCategoryMapping[this.name] || null;
    }
  }
  
  export default Event;
  