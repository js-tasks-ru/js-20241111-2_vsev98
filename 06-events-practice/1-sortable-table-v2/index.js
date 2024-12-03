import { default as SortableTableV1 } from "/05-dom-document-loading/2-sortable-table-v1/index.js";
// import SortableTable from "/05-dom-document-loading/2-sortable-table-v1/index.js";

export default class SortableTableV2 extends SortableTableV1 {
  constructor(headersConfig, { data = [], sorted = {} } = {}) {
    super(headersConfig, data);

    this.data = data;
    this.headersConfig = headersConfig;
    this.sorted = sorted;
    this.id = this.sorted.id;
    this.order = this.sorted.order;
    // this.element = this.createElement(this.createTableTemplate());

    // { this.id, this.order } = this.sorted;
    this.createListeners();
  }
  handleHeaderCellClick = (e) => {
    // const { id, order } = this.sorted;
    const cellElement = e.target.closest(".sortable-table__cell");

    if (!cellElement) return;
    if (!cellElement.dataset.sortable) return;

    console.log(cellElement.dataset.sortable);

    {
      console.log(cellElement);
    }
    const sortField = cellElement.dataset.id;
    const sortOrder = cellElement.dataset.sortable;

    // debugger;
    this.sort(sortField, sortOrder).bind(this.element);
  };

  sort(sortField, sortOrder) {
    if (this.isSortLocally) {
      //
      this.sortOnClient(sortField, sortOrder);
    } else {
      this.sortOnServer();
    }
  }

  sortOnClient(sortField, sortOrder) {
    sort.super(sortField, sortOrder);
  }
  sortOnServer() {}

  createListeners() {
    this.subElements.header.addEventListener(
      "click",
      this.handleHeaderCellClick
    );
  }

  destroyListeners() {
    this.subElements.header.removeEventListener(
      "click",
      this.handleHeaderCellClick
    );
  }

  destroy() {
    super.destroy();
    this.destroyListeners();
  }
}
