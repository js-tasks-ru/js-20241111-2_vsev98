import { default as ProductFormv1 } from "../../08-forms-fetch-api-part-2/1-product-form-v1/index.js";
import SortableList from "../2-sortable-list/index.js";
import escapeHtml from "./utils/escape-html.js";
import fetchJson from "./utils/fetch-json.js";

const IMGUR_CLIENT_ID = "28aaa2e823b03b1";
const BACKEND_URL = "https://course-js.javascript.ru";

export default class ProductForm extends ProductFormv1 {
  constructor(productId) {
    super(productId);

    this.productId = productId;
  }
  
  async updateImages() {
    const div = document.createElement("div");
    div.innerHTML = this.createPhotoListTemplate();
    const items = Array.from(div.children);

    const sortableList = new SortableList({ items });
    this.subElements.imageListContainer.textContent = "";
    this.subElements.imageListContainer.append(sortableList.element);
  }

}
