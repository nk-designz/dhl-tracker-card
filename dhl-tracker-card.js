class DHLTrackerCard extends HTMLElement {
  set hass(hass) {
    const config = this._config;
    const root = this.shadowRoot;

    if (!this.content) {
      this.content = document.createElement("div");
      this.content.style.padding = "16px";
      root.appendChild(this.content);

      // Input field for adding new tracking ID
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Enter tracking ID";
      input.id = "trackingInput";
      input.style.marginRight = "8px";

      const addButton = document.createElement("button");
      addButton.innerText = "Add";
      addButton.onclick = () => {
        const value = this.shadowRoot.getElementById("trackingInput").value;
        if (value) {
          hass.callService("dhl_tracker", "add_tracking_id", {
            tracking_id: value
          });
        }
      };

      this.content.appendChild(input);
      this.content.appendChild(addButton);
    }

    const entities = Object.values(hass.states).filter(
      (state) => state.entity_id.startsWith("sensor.dhl_package_")
    );

    if (entities.length === 0) {
      this.content.innerHTML += `<ha-card><div class="card-content">No DHL tracking entities found.</div></ha-card>`;
      return;
    }

    let html = `
      <ha-card header="DHL Tracker">
        <div class="card-content">
    `;

    for (const entity of entities) {
      const data = entity.attributes;
      html += `
        <div style="margin-bottom: 1em; padding-bottom: 1em; border-bottom: 1px solid #ccc;">
          <strong>Tracking ID:</strong> ${data.tracking_id || entity.entity_id}<br>
          <strong>Status:</strong> ${entity.state}<br>
          <strong>Description:</strong> ${data.description || "-"}<br>
          <strong>From:</strong> ${data.origin || "-"}<br>
          <strong>To:</strong> ${data.destination || "-"}<br>
          <strong>ETA:</strong> ${data.estimated_delivery || "-"}<br>
          <strong>Last Updated:</strong> ${data.last_updated || "-"}<br>
          <a href="${data.url}" target="_blank">Track on DHL.de</a><br>
          <button onclick='
            const id = "${data.tracking_id}";
            if (id) {
              hass.callService("dhl_tracker", "remove_tracking_id", {
                tracking_id: id
              });
            }
          '>Remove</button>
        </div>
      `;
    }

    html += `</div></ha-card>`;
    this.content.innerHTML += html;
  }

  setConfig(config) {
    this._config = config || {};
  }

  getCardSize() {
    return 1;
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
}

customElements.define("dhl-tracker-card", DHLTrackerCard);
