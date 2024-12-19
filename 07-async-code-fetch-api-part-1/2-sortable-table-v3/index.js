import fetchJson from "./utils/fetch-json.js";
import SortableTableV2 from "../../06-events-practice/1-sortable-table-v2/index.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class SortableTableV3 extends SortableTableV2 {
  constructor(
    headersConfig,
    {
      data = [],
      sorted = {},
      url = "api/rest/products",
      isSortLocally = false,
    } = {}
  ) {
    super(headersConfig, data);

    this.rowStart = 0;
    this.rowEnd = 30;
    this.isLoading = false;
    this.isSortLocally = isSortLocally;

    this.url = url;
    this.element = this.createElement(this.createProductsContainer());

    this.selectSubElements();
    this.createListeners();
    this.render();
  }

  createProductsContainer() {
    return `
    <div data-element="productsContainer" class="products-list__container">
      ${this.createTableTemplate()}
    </div>`;
  }

  async fetchData() {
    try {
      this.renderLoadingLine();
      this.data = await fetchJson(this.createUrl());

      if (!this.data.length) {
        this.messageError();
        return;
      }

      this.selectSubElements();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  createUrl() {
    const url = new URL(this.url, BACKEND_URL);
    url.searchParams.append("_embed", "subcategory.category");
    url.searchParams.append("_sort", `${this.id ?? "title"}`);
    url.searchParams.append("_order", `${this.order ?? "asc"}`);
    url.searchParams.append("_start", `${this.rowStart}`);
    url.searchParams.append("_end", `${this.rowEnd}`);

    return url.toString();
  }

  sortCommon(sortField, sortOrder) {
    if (this.isSortLocally) {
      this.sortOnClient(sortField, sortOrder);
    } else {
      this.sortOnServer(sortField, sortOrder);
    }
  }

  sortOnClient(id, order) {
    super.sortOnClient(id, order);
    this.render();
  }

  sortOnServer(id, order) {
    this.id = id;
    this.order = order;
    this.fetchData();
    this.render();
  }

  async render() {
    this.data = await this.loadData();
    
    super.update();
  }

  async loadData() {
    const data = await fetchJson(this.createUrl()); 
    return data;
  }

  messageError() {
    this.subElements.body.innerHTML = `
    <div>
        <h2>Ошибка при загрузке товаров</h2>
        <p>По заданному критерию запроса данные отсутствуют</p>
    </div>`;
  }

  renderLoadingLine() {
    this.subElements.body.insertAdjacentHTML(
      "beforeend",
      `
        <div data-elem="loading" class="loading-line sortable-table__loading-line"></div>
    `
    );
  }

  handleProductsContainerScroll = (e) => {
    const windowBottom =
      document.documentElement.getBoundingClientRect().bottom;
    const windowHeight = document.documentElement.clientHeight;

    if (windowBottom < windowHeight * 1.8 && !this.isLoading) {
      this.isLoading = true;

      this.rowStart = this.rowEnd;
      this.rowEnd += 30;

      this.fetchData().finally(() => {
        this.isLoading = false;
        this.subElements.body.insertAdjacentHTML(
          "beforeend",
          this.createTableBodyTemplate()
        );
      });
    }
  };

  createListeners() {
    this.subElements.header.addEventListener(
      "pointerdown",
      this.handleHeaderCellPointerdown
    );
    window.addEventListener("scroll", this.handleProductsContainerScroll);
  }

  destroyListeners() {
    super.destroyListeners();
    //  window.destroyListeners("scroll", this.handleProductsContainerScroll);
  }

  destroy() {
    super.destroy();
  }
}
