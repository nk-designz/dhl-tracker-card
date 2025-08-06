class DHLTrackerCard extends HTMLElement {
  set hass(hass) {
    if (!this._config) return;
    const root = this.shadowRoot;

    if (!this.content) {
      this.content = document.createElement("div");
      const style = document.createElement("style");
      style.textContent = `
        mwc-textfield {
          margin-right: 8px;
          width: 100%;
          --mdc-theme-primary: var(--primary-color);
        }
        .card-content {
          display: flex;
          flex-direction: column;
        }
        .header-row {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }
        .package-entry {
          margin-bottom: 1em;
          padding-bottom: 1em;
          border-bottom: 1px solid var(--divider-color);
        }
        .package-entry:last-child {
          border-bottom: none;
        }
        .remove-btn {
          margin-top: 8px;
          align-self: flex-start;
        }
      `;
      root.appendChild(style);
      root.appendChild(this.content);
    }

    const entities = Object.values(hass.states).filter(
      (state) => state.entity_id.startsWith("sensor.dhl_package_")
    );

    let html = `
      <ha-card header="DHL Tracker">
        <div class="card-content">
          <div class="header-row">
            <mwc-textfield id="trackingInput" label="Tracking ID" outlined value=""></mwc-textfield>
            <mwc-button raised id="addButton" label="Add"></mwc-button>
          </div>
    `;

    if (entities.length === 0) {
      html += `<p>No DHL tracking entities found.</p>`;
    } else {
      for (const entity of entities) {
        const data = entity.attributes;
        const status = entity.state || "unknown";

        html += `
          <div class="package-entry">
            <div><strong>Tracking ID:</strong> ${data.tracking_id || entity.entity_id}</div>
            <div><strong>Status:</strong> ${status}</div>
        `;

        if (status !== "unavailable" && status !== "unknown") {
          html += `
            <div><strong>Description:</strong> ${data.description || "-"}</div>
            <div><strong>From:</strong> ${data.origin || "-"}</div>
            <div><strong>To:</strong> ${data.destination || "-"}</div>
            <div><strong>ETA:</strong> ${data.estimated_delivery || "-"}</div>
            <div><strong>Last Updated:</strong> ${data.last_updated || "-"}</div>
          `;
        }

        html += `
            <mwc-button
              class="remove-btn"
              data-id="${data.tracking_id}"
              
              label="Remove"
              outlined
            ></mwc-button>
          </div>
        `;
      }
    }

    html += `</div></ha-card>`;
    this.content.innerHTML = html;

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
