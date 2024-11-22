export default class ColumnChart {
  element;
  chartHeight = 50;

  constructor({
    data = [],
    label = "",
    value = 0,
    link = "#",
    formatHeading = (value) => value,
  } = {}) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;
    this.element = this.createElement(this.createElementTemplate()); // = ?
  }

  createElement(template) {
    const element = document.createElement("div");
    element.innerHTML = template;

    return element.firstElementChild;
  }

  createLinkTemplate() {
    if (this.link) {
      return `
        <a class="column-chart__link" href=${this.link}>
          View all
        </a>`;
    } else return "";
  }

  getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = 50 / maxValue;

    return data.map((item) => {
      return {
        percent: ((item / maxValue) * 100).toFixed(0) + "%",
        value: String(Math.floor(item * scale)),
      };
    });
  }

  createChatBodyTemplate() {
    const arrData = this.getColumnProps(this.data);

    return arrData
      .map(({ value, percent }) => {
        return `<div style="--value: ${value}" data-tooltip="${percent}"></div>`;
      })
      .join("");
  }

  createChartClasses() {
    return this.data.length
      ? "column-chart"
      : "column-chart column-chart_loading";
  }

  createElementTemplate() {
    return `<div class="${this.createChartClasses()}" style="--chart-height: 50">
                <div class="column-chart__title">
                    ${this.label}
                </div>
                <div class="column-chart__container">
                <div data-element="header" class="column-chart__header">
                    ${this.formatHeading(this.value)}
                    ${this.createLinkTemplate()}
                </div>
                <div data-element="body" class="column-chart__chart">
                    ${this.createChatBodyTemplate(this.data)}
                </div>
                </div>
            </div>`;
  }

  update(newData) {
    this.data = newData;
    this.element.querySelector("[data-element=body]").innerHTML =
      this.createChatBodyTemplate();
  }
  remove() {
    this.element.remove();
  }
  destroy() {
    this.remove();
  }
}
