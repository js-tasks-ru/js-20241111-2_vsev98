export default class SortableTable {
  static columnSort;
  subElements = {}

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.element = this.createElement(this.createTableTemplate());
    this.selectSubElements();
  }

  createElement(template) {
    const element = document.createElement("div");
    element.innerHTML = template;
    return element.firstElementChild;
  }

  createTableTemplate() {
    return `
      <div class="sortable-table">
        ${this.createTableHeaderTemplate()}
        <div data-element="body" class="sortable-table__body">
            ${this.createTableBodyTemplate()}
        </div>
        
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>
            <p>No products satisfy your filter criteria</p>
            <button type="button" class="button-primary-outline">Reset all filters</button>
          </div>
        </div>
      </div>`;
  }

  createTableHeaderTemplate() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headerConfig
          .map(this.createTableHeaderCellTemplate.bind(this))
          .join("")}
      </div>`;
  }

  createTableHeaderCellTemplate({ id, sortable }) {
    const columnName = this.toUpperCaseFirstLetter(id);
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
        <span>${columnName}</span>
        ${sortable ? this.createArrowForSortableColumnTemplate() : ""}
      </div>`;
  }

  createArrowForSortableColumnTemplate() {
    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>`;
  }

  createTableBodyTemplate() {
    return this.data.map(this.createTableRowTemplate.bind(this)).join("");
  }

  createTableRowTemplate(product) {
    return `
      <a href="/products/${product.id}" class="sortable-table__row">
        ${this.headerConfig
          .map((columnConfig) =>
            this.createTableCellTemplate(product, columnConfig)
          )
          .join("")}
      </a>`;
  }

  createTableCellTemplate(product, { id, template }) {
    return template
      ? template(product[id])
      : `<div class="sortable-table__cell">${product[id]}</div>`;
  }

  sort(fieldName, order = "asc") {
    const sortColumn = this.headerConfig.find(
      (column) => column.id === fieldName
    );
    if (!sortColumn || !sortColumn.sortable) return;

    const sortDirection = order === "asc" ? 1 : -1;
    const nameColumn = this.element.querySelector(`[data-id="${fieldName}"]`);

    if (SortableTable.columnSort) {
      delete SortableTable.columnSort.dataset.order;
    }

    SortableTable.columnSort = nameColumn;
    SortableTable.columnSort.dataset.order = order;

    if (sortColumn.sortType === "string") {
      this.data.sort((a, b) =>
        this.sortAsString(a[fieldName], b[fieldName], sortDirection)
      );
    } else {
      this.data.sort((a, b) =>
        this.sortAsNumber(a[fieldName], b[fieldName], sortDirection)
      );
    }

    this.update();
  }

  sortAsString(a, b, direction) {
    return (
      direction *
      a.localeCompare(b, ["ru", "en"], {
        caseFirst: "upper",
        numeric: true,
      })
    );
  }

  sortAsNumber(a, b, direction) {
    return direction * (a - b);
  }

  update() {
    this.element.querySelector("[data-element='body']").innerHTML =
      this.createTableBodyTemplate();
  }

  toUpperCaseFirstLetter(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  selectSubElements() {
    this.element.querySelectorAll('[data-element]').forEach(element => {
      this.subElements[element.dataset.element] = element;
    });
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
