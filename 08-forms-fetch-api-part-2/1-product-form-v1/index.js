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

    this.element = this.createElement(this.createElementTemplate());
    this.render();
    this.selectSubElements();
  }

  createElement(template) {
    const element = document.createElement("div");
    element.innerHTML = template;
    return element.firstElementChild;
  }

  createElementTemplate() {
    return `
           <div class="product-form">
            <form id="productForm" data-element="productForm" class="form-grid">
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
                <input data-element="productName" required="" type="text" name="title" id="title" class="form-control" placeholder="Название товара">
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
              ${this.productId ? this.createPhotoListTemplate() : ""}
              </ul>
              </div>
                <button type="button" name="uploadImage" class="button-primary-outline fit-content">
                  <span>Загрузить</span>
                </button>
            </div>`;
  }

  createPhotoListTemplate() {
    if (!this.dataProduct || !this.dataProduct[0].images) {
      return "";
    }

    const images = this.dataProduct[0].images;

    return images
      .map((image) => {
        const imageUrl = image.source || "";
        const imageSource = image.url || "";

        return `
            <li class="products-edit__imagelist-item sortable-list__item">
            <input type="hidden" name="url" value="${imageSource}">
            <input type="hidden" name="source" value="${imageUrl}">
            <span>
                <img src="icon-grab.svg" data-grab-handle="" alt="grab">
                <img class="sortable-table__cell-img" alt="Image" src="${imageSource}">
                <span>${imageUrl}</span>
            </span>
            <button type="button">
                <img src="icon-trash.svg" data-delete-handle="" alt="delete">
            </button>
        </li>`;
      })
      .join("");
  }

  createProductCategoryTemplate() {
    return `
            <div class="form-group form-group__half_left">
              <label class="form-label">Категория</label>
              <select class="form-control" data-element="productCategory" id="subcategory" name="subcategory">
              ${this.productId ? this.createCategoryOptionTemplate() : ""}
              </select>
            </div>`;
  }

  createCategoryOptionTemplate() {
    if (!this.dataCategory) {
      return "";
    }

    return this.dataCategory
      .map((category) => {
        return category.subcategories
          .map((subcategory) => {
            const textOption = `${category.title} > ${subcategory.title}`;
            return `<option value="${subcategory.id}">${textOption}</option>`;
          })
          .join("");
      })
      .join("");
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
      const productData = await fetchJson(this.createUrlProduct());
      const categoryData = await fetchJson(this.createUrlCategory());

      this.dataProduct = productData;
      this.dataCategory = categoryData;

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
    }

    return this.element;
  }

  async updateForm() {
    if (!this.dataProduct || !this.dataProduct.length) {
      return;
    }

    const product = this.dataProduct[0];
    const form = this.subElements.productForm;

    for (const key in product) {
      if (form.elements[key]) {
        form.elements[key].value = product[key];
      }
    }

    this.updateImages();
    this.updateCategories();
  }

  async updateImages() {
    this.subElements.imageListContainer.innerHTML =
      this.createPhotoListTemplate();
  }

  async updateCategories() {
    const subcategorySelect = this.subElements.productCategory;
    subcategorySelect.innerHTML = "";

    this.dataCategory.forEach((category) => {
      category.subcategories.forEach((subElem) => {
        const textOption = `${category.title} > ${subElem.title}`;
        const option = new Option(textOption, subElem.id);
        subcategorySelect.append(option);
      });
    });
  }

  async save() {}

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

// import escapeHtml from "./utils/escape-html.js";
// import fetchJson from "./utils/fetch-json.js";

// const IMGUR_CLIENT_ID = "28aaa2e823b03b1";
// const BACKEND_URL = "https://course-js.javascript.ru";

// export default class ProductForm {
//   element;
//   subElements = {};

//   constructor(productId) {
//     this.productId = productId;
//     this.urlProduct = "api/rest/products";
//     this.urlCategory = "api/rest/categories";

//     if (this.productId) {
//       this.fetchData();
//     }
//     // this.element = this.render();
//     // this.element =  this.fetchData();
//   }

//   createElement(template) {
//     const element = document.createElement("div");
//     element.innerHTML = template;
//     return element.firstElementChild;
//   }

//   createElementTemplate() {
//     return `
//            <div class="product-form">
//             <form id="productForm" data-element="productForm" class="form-grid">
//              ${this.createProductNameTemplate()}
//              ${this.createProductDescriptionTemplate()}
//              ${this.createProductPhotoTemplate()}
//              ${this.createProductCategoryTemplate()}
//              ${this.createProductPriceTemplate()}
//              ${this.createProductQuantityTemplate()}
//              ${this.createProductStatusTemplate()}
//             <div class="form-buttons">
//               <button type="submit" name="save" class="button-primary-outline">
//                 Сохранить товар
//               </button>
//             </div>
//             </form>
//           </div>
//      `;
//   }

//   createProductNameTemplate() {
//     return `
//             <div class="form-group form-group__half_left">
//               <fieldset>
//                 <label class="form-label">Название товара</label>
//                 <input data-element="productName" required="" type="text" name="title" id="title" class="form-control" placeholder="Название товара">
//               </fieldset>
//             </div>`;
//   }

//   createProductDescriptionTemplate() {
//     return `
//             <div class="form-group form-group__wide">
//                 <label class="form-label">Описание</label>
//                 <textarea required="" class="form-control" name="description" id="description" data-element="productDescription" placeholder="Описание товара"></textarea>
//             </div>`;
//   }

//   createProductPhotoTemplate() {
//     return `
//             <div class="form-group form-group__wide" data-element="sortable-list-container">
//               <label class="form-label">Фото</label>
//               <div data-element="imageListContainer">
//               <ul class="sortable-list">
//               ${this.productId ? this.createPhotoListTemplate() : ""}
//               </ul>
//               </div>
//                 <button type="button" name="uploadImage" class="button-primary-outline fit-content">
//                   <span>Загрузить</span>
//                 </button>
//             </div>`;
//   }

//   createPhotoListTemplate() {
//     if (!this.dataProduct || !this.dataProduct[0].images) {
//       return "";
//     }

//     const images = this.dataProduct[0].images;

//     return images
//       .map((image) => {
//         const imageUrl = image.source || "";
//         const imageSource = image.url || "";

//         return `
//             <li class="products-edit__imagelist-item sortable-list__item">
//             <input type="hidden" name="url" value="${imageSource}">
//             <input type="hidden" name="source" value="${imageUrl}">
//             <span>
//                 <img src="icon-grab.svg" data-grab-handle="" alt="grab">
//                 <img class="sortable-table__cell-img" alt="Image" src="${imageSource}">
//                 <span>${imageUrl}</span> 
//             </span>
//             <button type="button">
//                 <img src="icon-trash.svg" data-delete-handle="" alt="delete">
//             </button>
//         </li>`;
//       })
//       .join("");
//   }

//   createProductCategoryTemplate() {
//     return `
//             <div class="form-group form-group__half_left">
//               <label class="form-label">Категория</label>
//               <select class="form-control" data-element="productCategory" id="subcategory" name="subcategory">
//               ${this.productId ? this.createCategoryOptionTemplate() : ""}
//               </select>
//             </div>`;
//   }

//   createCategoryOptionTemplate() {
//     if (!this.dataCategory) {
//       return "";
//     }

//     return this.dataCategory
//       .map((category) => {
//         return category.subcategories
//           .map((subcategory) => {
//             const textOption = `${category.title} > ${subcategory.title}`;
//             return `<option value="${subcategory.id}">${textOption}</option>`;
//           })
//           .join("");
//       })
//       .join("");
//   }

//   createProductPriceTemplate() {
//     return `
//             <div class="form-group form-group__half_left form-group__two-col">
//               <fieldset>
//                 <label class="form-label">Цена ($)</label>
//                 <input required="" type="number" name="price" id="price" class="form-control" placeholder="100">
//               </fieldset>
//               <fieldset>
//                 <label class="form-label">Скидка ($)</label>
//                 <input required="" type="number" name="discount" id="discount" class="form-control" placeholder="0">
//               </fieldset>
//             </div>`;
//   }

//   createProductQuantityTemplate() {
//     return `
//             <div class="form-group form-group__part-half">
//               <label class="form-label">Количество</label>
//               <input required="" type="number" class="form-control" name="quantity" id="quantity" placeholder="1">
//             </div>`;
//   }

//   createProductStatusTemplate() {
//     return `
//             <div class="form-group form-group__part-half">
//                 <label class="form-label">Статус</label>
//                 <select class="form-control" name="status" id="status">
//                   <option value="1">Активен</option>
//                   <option value="0">Неактивен</option>
//                 </select>
//             </div>`;
//   }

//   async fetchData() {
//     try {
//       const productData = await fetchJson(this.createUrlProduct());
//       const categoryData = await fetchJson(this.createUrlCategory());

//       this.dataProduct = productData;
//       this.dataCategory = categoryData;

//       this.updateForm();

//       // return this.createElement(this.createElementTemplate());
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   }

//   createUrlCategory() {
//     const url = new URL(this.urlCategory, BACKEND_URL);
//     url.searchParams.append("_sort", "weight");
//     url.searchParams.append("_refs", "subcategory");
//     return url.toString();
//   }

//   createUrlProduct() {
//     const url = new URL(this.urlProduct, BACKEND_URL);
//     url.searchParams.append("id", this.productId);
//     return url.toString();
//   }

//   selectSubElements() {
//     this.element.querySelectorAll("[data-element]").forEach((element) => {
//       this.subElements[element.dataset.element] = element;
//     });
//   }

//   async render() {
//     // if (!this.dataProduct && !this.dataCategory) {
      
//     //   return this.element;
//     // }
//     this.element = this.createElement(this.createElementTemplate());
//     this.selectSubElements();
//     return this.element;
//   }

//   async updateForm() {
//     if (!this.dataProduct || !this.dataProduct.length) {
//       return;
//     }

//     const product = this.dataProduct[0];
//     const form = this.subElements.productForm;

//     for (const key in product) {
//       if (form.elements[key]) {
//         form.elements[key].value = product[key];
//       }
//     }

//     this.updateImages();
//     this.updateCategories();
//   }

//   async updateImages() {
//     this.subElements.imageListContainer.innerHTML =
//       this.createPhotoListTemplate();
//   }

//   async updateCategories() {
//     const subcategorySelect = this.subElements.productCategory;
//     subcategorySelect.innerHTML = "";

//     this.dataCategory.forEach((category) => {
//       category.subcategories.forEach((subElem) => {
//         const textOption = `${category.title} > ${subElem.title}`;
//         const option = new Option(textOption, subElem.id);
//         subcategorySelect.append(option);
//       });
//     });
//   }

//   async save() {}

//   remove() {
//     this.element.remove();
//   }

//   destroy() {
//     this.remove();
//   }
// }