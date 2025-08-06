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
          --mdc-theme-primary: var(--primary-color);
        }
        .package-entry {
          margin-bottom: 1em;
          padding-bottom: 1em;
          border-bottom: 1px solid var(--divider-color);
        }
        .remove-btn {
          --mdc-theme-primary: var(--error-color);
        }
        ha-icon {
          margin-right: 4px;
        }
        .status {
          display: flex;
          align-items: center;
          font-weight: bold;
          margin: 4px 0;
        }
        .header-row {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          align-items: center;
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
            <mwc-textfield id="trackingInput" label="Tracking ID" outlined></mwc-textfield>
            <mwc-button raised id="addButton" icon="mdi:plus" label="Add"></mwc-button>
          </div>
    `;

    if (entities.length === 0) {
      html += `<p>No DHL tracking entities found.</p>`;
    } else {
      for (const entity of entities) {
        const data = entity.attributes;
        html += `
          <div class="package-entry">
            <div class="status">
              <ha-icon icon="mdi:package-variant"></ha-icon>
              Tracking ID: ${data.tracking_id || entity.entity_id}
            </div>
            <div class="status">
              <ha-icon icon="mdi:truck"></ha-icon>
              Status: ${entity.state} — ${data.description || "-"}
            </div>
            <div class="status">
              <ha-icon icon="mdi:map-marker"></ha-icon>
              From: ${data.origin || "-"} → ${data.destination || "-"}
            </div>
            <div class="status">
              <ha-icon icon="mdi:calendar-clock"></ha-icon>
              ETA: ${data.estimated_delivery || "-"}
            </div>
            <div class="status">
              <ha-icon icon="mdi:update"></ha-icon>
              Last Updated: ${data.last_updated || "-"}
            </div>
            <a href="${data.url}" target="_blank">
              <ha-icon icon="mdi:link"></ha-icon>Track on DHL.de
            </a><br>
            <mwc-button
              class="remove-btn"
              data-id="${data.tracking_id}"
              icon="mdi:delete"
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
