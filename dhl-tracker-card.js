class DHLTrackerCard extends HTMLElement {
  set hass(hass) {
    if (!this._config) return;

    const root = this.shadowRoot;

    if (!this.content) {
      this.content = document.createElement("div");
      root.appendChild(this.content);
    }

    const entities = Object.values(hass.states).filter(
      (state) => state.entity_id.startsWith("sensor.dhl_package_")
    );

    // Build card HTML
    let html = `
      <ha-card header="DHL Tracker">
        <div class="card-content">
          <input id="trackingInput" placeholder="Enter tracking ID" style="margin-right:8px;" />
          <button id="addButton">Add</button>
          <hr />
    `;

    if (entities.length === 0) {
      html += `<p>No DHL tracking entities found.</p>`;
    } else {
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
            <button data-id="${data.tracking_id}" class="remove-btn">Remove</button>
          </div>
        `;
      }
    }

    html += `
        </div>
      </ha-card>
    `;

    this.content.innerHTML = html;

    // Event listeners for add/remove
    const input = this.shadowRoot.getElementById("trackingInput");
    const addButton = this.shadowRoot.getElementById("addButton");

    if (addButton) {
      addButton.onclick = () => {
        const value = input?.value;
        if (value) {
          hass.callService("dhl_tracker", "add_tracking_id", {
            tracking_id: value
          });
          input.value = "";
        }
      };
    }

    const removeButtons = this.shadowRoot.querySelectorAll(".remove-btn");
    removeButtons.forEach((btn) => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        if (id) {
          hass.callService("dhl_tracker", "remove_tracking_id", {
            tracking_id: id
          });
        }
      };
    });
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
