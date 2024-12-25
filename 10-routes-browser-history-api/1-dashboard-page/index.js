import RangePicker from "./components/range-picker/src/index.js";
import SortableTable from "./components/sortable-table/src/index.js";
import ColumnChart from "./components/column-chart/src/index.js";
import header from "./bestsellers-header.js";

import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru/";

export default class Page {
  subElements = {};

  constructor() {
    this.element = this.createElement(this.createElementTemplate());
    this.selectSubElements();

    this.createComponents();
    this.createEventListener();
  }

  createComponents() {
    const now = new Date();
    this.range = {
      from: new Date(now.setMonth(now.getMonth() - 1)),
      to: new Date(),
    };

    this.rangePicker = new RangePicker(this.range);

    const urls = ["orders", "sales", "customers"];
    this.columnCharts = urls.map((url) => {
      const isSales = url === "sales";
      const isOrders = url === "orders";

      return new ColumnChart({
        label: url,
        link: isOrders ? "#" : "",
        range: this.range,
        url: `/api/dashboard/${url}`,
        ...(isSales && { formatHeading: (data) => `$${data}` }),
      });
    });

    this.sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?from=${this.range.from.toISOString()}&to=${this.range.to.toISOString()}`,
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
                <div data-element="rangePicker"></div>
            </div>
            <div data-element="chartsRoot" class="dashboard__charts">
                <div data-element="ordersChart" class="dashboard__chart_orders"></div>
                <div data-element="salesChart" class="dashboard__chart_sales"></div>
                <div data-element="customersChart" class="dashboard__chart_customers"></div>
            </div>
            <h3 class="block-title">Best sellers</h3>
            <div data-element="sortableTable"></div>
        </div>
     `;
  }

  async render() {
    this.subElements.rangePicker.append(this.rangePicker.element);

    this.subElements.sortableTable.append(this.sortableTable.element);

    this.columnCharts.forEach((chart) => {
      this.subElements[chart.label + "Chart"].append(chart.element);
    });
    // this.createEventListener();

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
    this.subElements.rangePicker.addEventListener(
      "date-select",
      this.handleRangePickerChange
    );
  }

  removeEventListener() {
    this.subElements.rangePicker.removeEventListener(
      "date-select",
      this.handleRangePickerChange
    );
  }

  handleRangePickerChange = (event) => {
    const { from, to } = event.detail;

    this.updateDashboard(from, to);
  };

  async fetchData(from, to) {
    const url = this.sortableTable.url;
    url.searchParams.set("_start", 1);
    url.searchParams.set("_end", 20);
    url.searchParams.set("from", from.toISOString());
    url.searchParams.set("to", to.toISOString());
    const response = await fetchJson(url);

    return response;
  }

  async updateDashboard(from, to) {
    try {
      this.columnCharts.forEach((chart) => {
        chart.loadData(from, to);
      });

      const data = await this.fetchData(from, to);

      this.sortableTable.renderRows(data);
    } catch (error) {
      throw new Error(error);
    }
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.removeEventListener();
  }
}
