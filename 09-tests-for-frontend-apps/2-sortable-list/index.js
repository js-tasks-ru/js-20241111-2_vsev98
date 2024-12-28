export default class SortableList {
  element;
  subElements = [];

  constructor({ items = [] } = {}) {
    this.items = items;

    this.element = this.createElement(this.createElementTemplate());
    this.createEventListener();
  }

  createElement(template) {
    const element = document.createElement("div");
    element.innerHTML = template;

    return element.firstElementChild;
  }
  createElementTemplate() {
    return `
            <ul class='sortable-list'>
              ${this.createListItems()}
            </ul>
        `;
  }

  createListItems() {
    return `${this.items
      .map((item) => {
        item.classList.add("sortable-list__item");
        return item.outerHTML;
      })
      .join("")}`;
  }

  createPlaceHolderElement() {
    const placeHolder = document.createElement("li");
    placeHolder.classList.add(
      "sortable-list__item",
      "sortable-list__placeholder"
    );

    return placeHolder;
  }

  handlePointerDownItem = (e) => {
    const target = e.target;

    // удаление элемента 
    if (target.hasAttribute("data-delete-handle")) {
      target.closest(".sortable-list__item").remove();
    }

    // захват элемента
    if (target.hasAttribute("data-grab-handle")) {
      this.elementDrag = target.closest(".sortable-list__item");

      this.shiftX = e.clientX - this.elementDrag.getBoundingClientRect().left;
      this.shiftY = e.clientY - this.elementDrag.getBoundingClientRect().top;


      const width = this.elementDrag.getBoundingClientRect().width; 
      this.elementDrag.style.width = `${width}px`;
      this.elementDrag.classList.add("sortable-list__item_dragging");

      // создание шаблона placeholder
      this.placeHolder = this.createPlaceHolderElement();
      this.elementDrag.after(this.placeHolder);

      this.currentDroppable = null;

      document.addEventListener("pointermove", this.handlePointerMove);

      document.addEventListener("pointerup", () => {
        this.elementDrag.className = "sortable-list__item";
        this.elementDrag.style = "";

        this.placeHolder.replaceWith(this.elementDrag);

        document.removeEventListener("pointermove", this.handlePointerMove);
      });
    }
  };

  handlePointerMove = (e) => {
    this.elementDrag.style.left = e.pageX - this.shiftX + "px";
    this.elementDrag.style.top = e.pageY - this.shiftY + "px";

    this.elementDrag.hidden = true;

    let elemBelow = this.determiningTransferLocation(e);

    this.elementDrag.hidden = false;

    if (!elemBelow) return;

    let droppableBelow = elemBelow.closest(".sortable-list__item");

    if (this.currentDroppable != droppableBelow) {
      if (this.currentDroppable) {
        // если вышли из области
        this.placeHolder.remove();
      }

      this.currentDroppable = droppableBelow;

      if (this.currentDroppable) {
        //если вошли в область
        this.insertPlaceHolder();
      }
    }
  };

  // Определение области над которой переносим элемент
  determiningTransferLocation(e) {
    return document.elementsFromPoint(e.clientX, e.clientY).find((item) => {
      if (
        item.classList.contains("sortable-list__item") &&
        item.classList.length === 1
      ) {
        return item;
      }
    });
  }

  insertPlaceHolder() {
    const allItems = this.element.children;

    const indexElement = Array.from(allItems).findIndex(
      (child) => child === this.currentDroppable
    );

    indexElement === 0
      ? this.currentDroppable.before(this.placeHolder)
      : this.currentDroppable.after(this.placeHolder);
  }

  createEventListener() {
    this.element.addEventListener("pointerdown", this.handlePointerDownItem);
  }
  removeEventListener() {
    this.element.addEventListener("pointerdown", this.handlePointerDownItem);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.removeEventListener();
  }
}
