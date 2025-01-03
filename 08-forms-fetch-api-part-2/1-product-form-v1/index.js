import escapeHtml from "./utils/escape-html.js";
import fetchJson from "./utils/fetch-json.js";

const IMGUR_CLIENT_ID = "28aaa2e823b03b1";
const BACKEND_URL = "https://course-js.javascript.ru";

export default class ProductForm {
  element;
  subElements = {};

  constructor(productId) {
    this.productId = productId;
    this.urlProduct = "api/rest/products";
    this.urlCategory = "api/rest/categories";
  }

  createElement(template) {
    const element = document.createElement("div");
    element.innerHTML = template;
    return element.firstElementChild;
  }

  createElementTemplate() {
    return `
           <div class="product-form">
            <form  name ="productForm" data-element="productForm" class="form-grid">
             ${this.createProductNameTemplate()}
             ${this.createProductDescriptionTemplate()}
             ${this.createProductPhotoTemplate()}
             ${this.createProductCategoryTemplate()}
             ${this.createProductPriceTemplate()}
             ${this.createProductQuantityTemplate()}
             ${this.createProductStatusTemplate()}
            <div class="form-buttons">
              <button type="submit" name="save" class="button-primary-outline">
                Сохранить товар
              </button>
            </div>
            </form>
          </div>
     `;
  }

  createProductNameTemplate() {
    return `
            <div class="form-group form-group__half_left">
              <fieldset>
                <label class="form-label">Название товара</label>
                <input data-element="productName"
                 required="" type="text" name="title" id="title" class="form-control" placeholder="Название товара">
              </fieldset>
            </div>`;
  }

  createProductDescriptionTemplate() {
    return `
            <div class="form-group form-group__wide">
                <label class="form-label">Описание</label>
                <textarea required="" class="form-control" name="description" id="description" data-element="productDescription" placeholder="Описание товара"></textarea>
            </div>`;
  }

  createProductPhotoTemplate() {
    return `
            <div class="form-group form-group__wide" data-element="sortable-list-container">
              <label class="form-label">Фото</label>
              <div data-element="imageListContainer">
              <ul class="sortable-list">
              
              </ul>
              </div>
                <button type="button" name="uploadImage" data-element="uploadImage" class="button-primary-outline fit-content">
                  <span>Загрузить</span>
                </button>
            </div>`;
  }

  createPhotoListTemplate() {
    if (!this.dataProduct || !this.dataProduct.images) {
      return "";
    }

    const images = this.dataProduct.images;

    return images
      .map((image) => {
        const imageName = image.source || "";
        const imageSource = image.url || "";

        return this.createImageItem(imageSource, imageName);
      })
      .join("");
  }

  createImageItem(url, name) {
    return ` 
        <li class="products-edit__imagelist-item sortable-list__item">
        <span>
            <img src="icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" 
            alt="${escapeHtml(name)}" src="${escapeHtml(url)}">
            <span>${escapeHtml(name)}</span>
        </span>
        <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>`;
  }

  createProductCategoryTemplate() {
    return `
            <div class="form-group form-group__half_left">
              <label class="form-label">Категория</label>
              <select class="form-control" data-element="productCategory" id="subcategory" name="subcategory">
              </select>
            </div>`;
  }

  createProductPriceTemplate() {
    return `
            <div class="form-group form-group__half_left form-group__two-col">
              <fieldset>
                <label class="form-label">Цена ($)</label>
                <input required="" type="number" name="price" id="price" class="form-control" placeholder="100">
              </fieldset>
              <fieldset>
                <label class="form-label">Скидка ($)</label>
                <input required="" type="number" name="discount" id="discount" class="form-control" placeholder="0">
              </fieldset>
            </div>`;
  }

  createProductQuantityTemplate() {
    return `
            <div class="form-group form-group__part-half">
              <label class="form-label">Количество</label>
              <input required="" type="number" class="form-control" name="quantity" id="quantity" placeholder="1">
            </div>`;
  }

  createProductStatusTemplate() {
    return `
            <div class="form-group form-group__part-half">
                <label class="form-label">Статус</label>
                <select class="form-control" name="status" id="status">
                  <option value="1">Активен</option>
                  <option value="0">Неактивен</option>
                </select>
            </div>`;
  }

  async fetchData() {
    try {
      this.dataCategory = await fetchJson(this.createUrlCategory());
      const dataProduct = await fetchJson(this.createUrlProduct());
      this.dataProduct = dataProduct[0];

      this.element = this.createElement(this.createElementTemplate());

      this.selectSubElements();
      this.updateForm();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  createUrlCategory() {
    const url = new URL(this.urlCategory, BACKEND_URL);
    url.searchParams.append("_sort", "weight");
    url.searchParams.append("_refs", "subcategory");
    return url.toString();
  }

  createUrlProduct() {
    const url = new URL(this.urlProduct, BACKEND_URL);
    url.searchParams.append("id", this.productId);
    return url.toString();
  }

  selectSubElements() {
    this.element.querySelectorAll("[data-element]").forEach((element) => {
      this.subElements[element.dataset.element] = element;
    });
  }

  async render() {
    if (this.productId) {
      await this.fetchData();
    } else {
      this.element = this.createElement(this.createElementTemplate());
      this.selectSubElements();
    }

    const { productForm, uploadImage } = this.subElements;

    productForm.addEventListener("submit", this.save);
    uploadImage.addEventListener("pointerdown", this.handleUploadImage);

    return this.element;
  }

  async updateForm() {
    this.updateProducts();

    this.updateImages();

    this.updateCategories();
  }

  updateProducts() {
    if (!this.dataProduct) {
      return;
    }

    const form = this.subElements.productForm;

    for (const key in this.dataProduct) {
      if (form.elements[key]) {
        form.elements[key].value = this.dataProduct[key];
      }
    }
  }

  async updateImages() {
    this.subElements.imageListContainer.firstElementChild.innerHTML =
      this.createPhotoListTemplate();
  }

  updateCategories() {
    const subcategorySelect = this.subElements.productCategory;
    subcategorySelect.innerHTML = "";

    const subcategoryProd = this.dataProduct.subcategory;
    const fragment = document.createDocumentFragment();

    this.dataCategory.forEach((category) => {
      category.subcategories.forEach((subcategory) => {
        const textOption = `${escapeHtml(category.title)} > ${escapeHtml(
          subcategory.title
        )}`;
        const isSelected = subcategoryProd === subcategory.id;
        const option = new Option(
          textOption,
          subcategory.id,
          isSelected,
          isSelected
        );
        fragment.append(option);
      });
    });
    subcategorySelect.append(fragment);
  }

  handleUploadImage = (e) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";

    fileInput.onchange = async () => {
      const [file] = fileInput.files;

      if (file) {
        const formData = new FormData();
        const { uploadImage, imageListContainer } = this.subElements;

        formData.append("image", file);

        uploadImage.classList.add("is-loading");
        uploadImage.disabled = true;

        const result = await fetchJson("https://api.imgur.com/3/image", {
          method: "POST",
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
          body: formData,
        });

        const div = document.createElement("div");
        div.innerHTML = this.createImageItem(result.data.link, file.name);

        imageListContainer.firstElementChild.append(div.firstElementChild);

        uploadImage.classList.remove("is-loading");
        uploadImage.disabled = false;

        fileInput.remove();
      }
    };

    // must be in body for IE
    fileInput.hidden = true;
    document.body.appendChild(fileInput);
    fileInput.click();
  };

  save = async (event) => {
    event.preventDefault();

    const form = this.subElements.productForm;
    const formData = new FormData(form);
    const escapedData = {};
    const images = [];
    let objImage = {};

    for (const [key, value] of formData.entries()) {
      escapedData[key] = isNaN(value) ? escapeHtml(value.trim()) : +value;

      if (key === "url" || key === "source") {
        objImage[key] = escapedData[key];

        if (key === "source") {
          images.push(objImage);
          objImage = {};
        }
      }
    }
    escapedData.id = this.productId;
    escapedData.images = images;
    delete escapedData.url;
    delete escapedData.source;

    try {
      const method = this.productId ? "PATCH" : "POST";
      const response = await fetchJson(new URL(this.urlProduct, BACKEND_URL), {
        method,
        body: JSON.stringify(escapedData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      this.element.dispatchEvent(
        new CustomEvent("product-updated", {
          detail: { productId: escapedData.id, status: "updated" },
        })
      );
      this.element.dispatchEvent(
        new CustomEvent("product-saved", {
          detail: { productId: escapedData.id, status: "saved" },
        })
      );
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
