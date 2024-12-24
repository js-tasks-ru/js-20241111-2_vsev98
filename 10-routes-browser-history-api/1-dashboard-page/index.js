import RangePicker from "./components/range-picker/src/index.js";
import SortableTable from "./components/sortable-table/src/index.js";
import ColumnChart from "./components/column-chart/src/index.js";
import header from "./bestsellers-header.js";

import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru/";

export default class Page {
  subElements = {};

  constructor() {
   
    this.createComponents();
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
      return new ColumnChart({
        label: url,
        link: "#",
        range: this.range,
        url: `/api/dashboard/${url}`,
      });
    });

    this.sortableTable = new SortableTable(header, {
      url: "/api/dashboard/bestsellers",
      // url: `api/dashboard/bestsellers?from=${this.range.from.toISOString()}&to=${this.range.to.toISOString()}`,
    });
  }

    async render() {
    this.element = document.createElement("div");

    this.rangePicker.element.dataset.element = "rangePicker";
    const topPanel = document.createElement("div");
    topPanel.classList.add("content__top-panel");
    topPanel.append(this.rangePicker.element);

    this.element.append(topPanel);

    const div = document.createElement("div");
    div.dataset.element = "chartsRoot"
    div.classList.add("dashboard__charts");

    this.columnCharts[0].element.classList.add("dashboard__chart_orders");
    div.append(this.columnCharts[0].element);

    this.columnCharts[1].element.classList.add("dashboard__chart_sales");
    div.append(this.columnCharts[1].element);

    this.columnCharts[2].element.classList.add("dashboard__chart_customers");
    div.append(this.columnCharts[2].element);

    this.element.append(div);

    const wrap = document.createElement("div");
    wrap.dataset.element = "sortableTable";

    wrap.append(this.sortableTable.element);
    this.element.append(wrap);

    document.body.appendChild(this.element);

    this.selectSubElements();
    this.createEventListener();


    return this.element;
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

  handleRangePickerChange(event) {
    const { from, to } = event.detail;

    if (from && to) {
      this.range = {
        from: from,
        to: to,
      };
   
    }
  }

 

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
