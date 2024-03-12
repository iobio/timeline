class Event {
    constructor(id, name, date, description, category, iconUrl, pairEventId, eventType, status, estimatedCompleteDate ) {
      this.id = id
      this.name = name;
      this.date = date;
      this.description = description;
      this.category = category;
      this.iconUrl = iconUrl;
      this.pairEventId = pairEventId;
      this.eventType = eventType;
      this.status = status;
      this.estimatedCompleteDate = estimatedCompleteDate;
      this.formattedDate = this.formatDate();
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
  }
  
  export default Event;
  