import RangePicker from "./components/range-picker/src/index.js";
import SortableTable from "./components/sortable-table/src/index.js";
import ColumnChart from "./components/column-chart/src/index.js";
import header from "./bestsellers-header.js";

import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru/";


export default class Page {
  subElements = {};

  constructor() {
    const now = new Date();
    this.range = {
      from: new Date(now.setMonth(now.getMonth() - 1)),
      to: new Date(),
    };

    this.rangePicker = new RangePicker(this.range);

    const urls = ["orders", "sales", "customers"];
    this.columnCharts = urls.map((url) => {
      return new ColumnChart({
        label: url,
        link: "#",
        range: this.range,
        url: `/api/dashboard/${url}`,
      });
    });

    this.sortableTable = new SortableTable(header, {
    //   range: this.range,
      url: "/api/dashboard/bestsellers",
      // url: `api/dashboard/bestsellers?from=${this.range.from.toISOString()}&to=${this.range.to.toISOString()}`,
    });


  }

  createElement(template) {
    const element = document.createElement("div");
    element.innerHTML = template;
    return element.firstElementChild;
  }

   createElementTemplate() {
    return `
        <div class="dashboard">
            <div class="content__top-panel">
                <h2 class="page-title">Dashboard</h2>
                <div data-element="rangePicker">
                  ${this.rangePicker.element.outerHTML}
                </div>
            </div>

            <div data-element="chartsRoot" class="dashboard__charts">
                <div data-element="ordersChart" class="dashboard__chart_orders">
                  ${ this.columnCharts[0].element.outerHTML}
                </div>
                <div data-element="salesChart" class="dashboard__chart_sales">
                  ${ this.columnCharts[1].element.outerHTML}
                </div>
                <div data-element="customersChart" class="dashboard__chart_customers">
                   ${ this.columnCharts[2].element.outerHTML}
                </div>
            </div>

            <h3 class="block-title">Best sellers</h3>

            <div data-element="sortableTable">
                 ${ this.sortableTable.element.outerHTML}
                <!-- SortableTable will be rendered here -->
            </div>
        </div>
     `;
  }

  async render() {
    this.element = this.createElement(this.createElementTemplate());
    this.selectSubElements();

    return this.element;
  }

  createColumnChart() {
    const element = document.createElement("div");
    element.innerHTML = this.columnCharts[0].element;

    return element.firstElementChild;
  }

  selectSubElements() {
    this.element.querySelectorAll("[data-element]").forEach((element) => {
      this.subElements[element.dataset.element] = element;
    });
  }

  createEventListener() {
    this.subElements.rangePicker.addEventListener('date-select', this.handleRangePickerChange);
  }

  removeEventListener() {
    this.subElements.rangePicker.removeEventListener('date-select', this.handleRangePickerChange);
  }

  handleRangePickerChange(event) {
    const { from, to } = event.detail;

    if (from && to) {
      this.range = {
        from: from,
        to: to
      };

      this.updateDashboard();
    }
  }

  updateDashboard() {
    const { from, to } = this.range;

    this.columnCharts.forEach((chart) => {
      chart.loadData(from, to);
    });

    this.subElements.sortableTable.replaceWith(this.sortableTable.element);
    this.subElements.sortableTable = this.sortableTable.element;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
