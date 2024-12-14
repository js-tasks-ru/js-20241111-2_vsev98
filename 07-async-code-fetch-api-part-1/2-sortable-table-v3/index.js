import fetchJson from "./utils/fetch-json.js";
import SortableTableV2 from "../../06-events-practice/1-sortable-table-v2/index.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class SortableTableV3 extends SortableTableV2 {
  constructor(
    headersConfig,
    { data = [], sorted = {} } = {},
    url = "api/rest/products"
  ) {
    super(headersConfig, data);

    // this.sorted = sorted;

    this.rowStart = 0;
    this.rowEnd = 30;
    this.isLoading = false;
    // this.data = data;
    // this.headersConfig = headersConfig;
    this.url = url;
    this.element = this.createElement(this.createProductsContainer());

    // this.isSortLocally = false;
    // fetchJson(this.createUrl())
    // console.log(this.subElements);

    this.fetchData();
    this.selectSubElements();
    this.createListeners();
  }

  createProductsContainer() {
    return `
    <div data-element="productsContainer" class="products-list__container">
      ${this.createTableTemplate()}
    </div>`;
  }

  // selectSubElements() {
  //   this.element.parentElement.querySelectorAll("[data-element]").forEach((element) => {
  //     this.subElements[element.dataset.element] = element;
  //   });
  // }

  async fetchData() {
    try {
      this.data = await fetchJson(this.createUrl());

      // console.log(this.data);

      // this.update();
      if (this.rowStart === 0) {
        this.render();
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  }

  createUrl() {
    const url = new URL(this.url, BACKEND_URL);
    url.searchParams.append("_embed", "subcategory.category");
    url.searchParams.append("_sort", `${this.id ?? "title"}`);
    url.searchParams.append("_order", `${this.order ?? "asc"}`);
    url.searchParams.append("_start", `${this.rowStart}`); //this.to.toISOString());
    url.searchParams.append("_end", `${this.rowEnd}`);
    console.log(url.href);

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

  render() {
    super.update();
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
        this.subElements.body.innerHTML +=
          this.createTableBodyTemplate();
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
