import { default as SortableTableV1 } from "../../05-dom-document-loading/2-sortable-table-v1/index.js";

export default class SortableTableV2 extends SortableTableV1 {
  constructor(headersConfig, { data = [], sorted = {} } = {}) {
    super(headersConfig, data);

    this.data = data;
    this.headersConfig = headersConfig;
    this.sorted = sorted;
    this.isSortLocally = false;
    this.arrowElement = this.createArrowElement();
    this.sortByDefault();
    this.createListeners();
  }
  handleHeaderCellPointerdown = (e) => {
    const cellElement = e.target.closest(".sortable-table__cell");

    if (!cellElement || !cellElement.dataset.sortable) return;

    const currentOrder = cellElement.dataset.order;
    const newOrder = currentOrder === "desc" ? "asc" : "desc";
    cellElement.dataset.order = newOrder;

    const sortField = cellElement.dataset.id;
    cellElement.appendChild(this.arrowElement);

    this.sortCommon(sortField, newOrder);
  };

  sortByDefault() {
    const { id, order = "asc" } = this.sorted;
    const cellElement = this.element.querySelector(`[data-id = "${id}"]`);
  
    if (!cellElement) {
      // console.error(`No header found with id: ${id}`);
      return;
    }
  
    cellElement.dataset.order = order;
    cellElement.appendChild(this.arrowElement);
  
    this.sortOnClient(id, order);
  }

  sortCommon(sortField, sortOrder) {
    if (this.isSortLocally) {
      this.sortOnClient(sortField, sortOrder);
    } else {
      this.sortOnServer();
    }
  }

  sortOnClient(sortField, sortOrder) {
    super.sort(sortField, sortOrder);
  }

  sortOnServer() {}

  createArrowElement() {
    const tempElement = document.createElement("div");
    tempElement.innerHTML = this.createArrowTemplate();
    return tempElement.firstElementChild;
  }

  createArrowTemplate() {
    return `<span data-element="arrow" class="sortable-table__sort-arrow">
             <span class="sort-arrow"></span>
           </span>`;
  }

  createListeners() {
    this.subElements.header.addEventListener(
      "pointerdown",
      this.handleHeaderCellPointerdown
    );
  }

  destroyListeners() {
    this.subElements.header.removeEventListener(
      "pointerdown",
      this.handleHeaderCellPointerdown
    );
  }

  destroy() {
    super.destroy();
    this.destroyListeners();
  }
}
