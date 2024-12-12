export default class DoubleSlider {
  element;
  min;
  max;

  subElements = {};
  constructor({
    min = 100,
    max = 200,
    selected = {},
    formatValue = (value) => `$${value}`,
  } = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.from = selected.from ?? min;
    this.to = selected.to ?? max;

    this.element = this.createElement(this.createElementTemplate());

    this.selectSubElements();
    this.createEventListeners();
  }

  createElement(template) {
    const element = document.createElement("div");
    element.innerHTML = template;
    return element.firstElementChild;
  }

  createElementTemplate() {
    const leftProgress = this.getLeftPercent() + "%";
    const rightProgress = this.getRightPercent() + "%";

    return `
      <div class="range-slider">
          <span data-element="from">${this.formatValue(this.from)}</span>
          <div data-element="inner" class="range-slider__inner">
            <span data-element="progress" class="range-slider__progress"  style="left:${leftProgress}; right:${rightProgress}"></span>
            <span data-element="thumbLeft" class="range-slider__thumb-left" style="left:${leftProgress}"></span>
            <span  data-element="thumbRight" class="range-slider__thumb-right" style="right:${rightProgress}"></span>
          </div>
          <span data-element="to">${this.formatValue(this.to)}</span> 
      </div>`;
  }

  getPercentages(clientX, sideRange) {
    const element = this.subElements.inner;
    const boundingRect = element.getBoundingClientRect();
    const elementWidth = Math.floor(boundingRect.width);
    const position = Math.floor(clientX - boundingRect.x);
    const newLeft = Math.max(0, Math.min(position, elementWidth));
    const calculation = (newLeft / elementWidth) * 100;
    const percentage = Math.trunc(
      sideRange === "right" ? 100 - calculation : calculation
    );

    return percentage + "%";
  }

  getLeftPercent() {
    const total = this.max - this.min;
    const value = this.from - this.min;

    return Math.round((value / total) * 100);
  }

  getRightPercent() {
    const total = this.max - this.min;
    const value = this.max - this.to;

    return Math.round((value / total) * 100);
  }

  processPointerMove = (e) => {
    const { left, width } = this.subElements.inner.getBoundingClientRect();

    const innerLeftX = left;
    const innerRightX = left + width;
    const pointerX = e.clientX;
    const normalizePointerX = Math.min(
      innerRightX,
      Math.max(innerLeftX, pointerX)
    );
    const percentPointerX = Math.round(
      ((normalizePointerX - innerLeftX) / (innerRightX - innerLeftX)) * 100
    );

    return this.min + ((this.max - this.min) * percentPointerX) / 100;
  };

  handlePointerDown = (e) => {
    this.activeThumb = e.target.dataset.element;
    document.addEventListener("pointermove", this.handleDocumentPointerMove);
    document.addEventListener("pointerup", this.handleDocumentPointerUp);
  };

  handleDocumentPointerMove = (e) => {
    if (this.activeThumb === "thumbLeft") {
      this.from = Math.min(this.to, this.processPointerMove(e));

      this.updateElement("from");
    }

    if (this.activeThumb === "thumbRight") {
      this.to = Math.max(this.from, this.processPointerMove(e));

      this.updateElement("to");
    }
  };

  updateElement(nameElement) {
    let side = "";
    let fn = null;
    if (nameElement === "to") {
      side = "right";
      fn = this.getRightPercent.bind(this);
    }
    if (nameElement === "from") {
      side = "left";
      fn = this.getLeftPercent.bind(this);
    }

    const thumbElement = `thumb${side.toUpperCase()[0] + side.slice(1)}`;

    this.subElements[`${nameElement}`].textContent = this.formatValue(
      this[`${nameElement}`]
    );
    this.subElements[`${thumbElement}`].style[`${side}`] = fn() + "%";
    this.subElements.progress.style[`${side}`] = fn() + "%";
  }

  handleDocumentPointerUp = (e) => {
    this.activeThumb = null;
    this.dispatchCustomEvent();
    document.removeEventListener("pointermove", this.handleDocumentPointerMove);
    document.removeEventListener("pointerup", this.handleDocumentPointerUp);
  };

  dispatchCustomEvent() {
    this.element.addEventListener("range-select", this.handleRangeSelect);

    const event = new CustomEvent("range-select", {
      detail: {
        from: this.from,
        to: this.to,
      },
      bubbles: true,
    });

    this.element.dispatchEvent(event);
  }

  createEventListeners() {
    this.subElements.thumbLeft.addEventListener(
      "pointerdown",
      this.handlePointerDown
    );
    this.subElements.thumbRight.addEventListener(
      "pointerdown",
      this.handlePointerDown
    );
  }

  destroyEventListeners() {
    this.subElements.thumbLeft.removeEventListener(
      "pointerdown",
      this.handlePointerDown
    );
    this.subElements.thumbRight.removeEventListener(
      "pointerdown",
      this.handlePointerDown
    );
  }

  selectSubElements() {
    this.element.querySelectorAll("[data-element]").forEach((element) => {
      this.subElements[element.dataset.element] = element;
    });
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.destroyEventListeners();
  }
}
