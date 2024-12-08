export default class DoubleSlider {
  subElements = {};
  constructor({
    min = 100,
    max = 200,
    selected: { from = min, to = max } = {},
    formatValue = (value) => `$${value}`,
  } = {}) {
    this.minRange = min;
    this.maxRange = max;
    this.formatValue = formatValue;

    this.fromPointer = this.percentValue(from, min, max);
    this.toPointer = this.percentValue(to, max, min);

    this.min = from; //?? min //min && from;
    this.max = to; //max;

    this.element = this.createElement(this.createElementTemplate());

    this.selectSubElements();

    this.createListeners();
  }

  percentValue(currentValue, rangeStart, rangeEnd) {
    const rangeDifference = Math.abs(rangeStart - rangeEnd);
    if (rangeDifference === 0) {
      return "0%";
    }

    return (
      Math.round(
        (Math.abs(currentValue - rangeStart) / rangeDifference) * 100
      ) + "%"
    );
  }

  createElement(template) {
    const element = document.createElement("div");
    element.innerHTML = template;
    return element.firstElementChild;
  }

  createElementTemplate() {
    return `
      <div class="range-slider">
          <span data-element="from">${this.formatValue(this.min)}</span>
          <div data-element="inner" class="range-slider__inner">
              ${this.createProgressTemplate()}
              ${this.createThumbLeftTemplate()}
              ${this.createThumbRightTemplate()}
          </div>
          <span data-element="to">${this.formatValue(this.max)}</span>
      </div>`;
  }

  createProgressTemplate() {
    return `
       <span data-element="progress" class="range-slider__progress"  style="left:${this.fromPointer}; right:${this.toPointer}"></span>`;
  }

  createThumbLeftTemplate() {
    return `
        <span data-element="thumbLeft" class="range-slider__thumb-left" style="left:${this.fromPointer}"></span>`;
  }

  createThumbRightTemplate() {
    return `
       <span  data-element="thumbRight" class="range-slider__thumb-right" style="right:${this.toPointer}"></span>`;
  }

  getPercentages(element, clientX, sideRange) {
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

  handlePointerDown = (e) => {
    const target = e.target;

    this.element.addEventListener("range-select", this.handleRangeSelect);

    const eventThumb = new CustomEvent("range-select", {
      detail: {
        from: this.min,
        to: this.max,
      },
      bubbles: true,
    });

    this.element.dispatchEvent(eventThumb);

    if (target.classList.contains("range-slider__thumb-left")) {
      const lineProcess = target.closest(".range-slider__inner");

      //   lineProcess.setPointerCapture(e.pointerId);

      lineProcess.onpointermove = (e) => {
        this.fromPointer = this.getPercentages(lineProcess, e.clientX, "left");

        this.min = (this.minRange * (100 + parseInt(this.fromPointer))) / 100;

        if (parseInt(this.toPointer) + parseInt(this.fromPointer) > 100) {
          this.stopMovingThumb(lineProcess);
          return;
        }

        this.updateElement("from");
      };

      this.stopMovingThumb(lineProcess);
    }

    if (target.classList.contains("range-slider__thumb-right")) {
      const lineProcess = target.closest(".range-slider__inner");

      //   lineProcess.setPointerCapture(e.pointerId);

      lineProcess.onpointermove = (e) => {
        this.toPointer = this.getPercentages(lineProcess, e.clientX, "right");

        this.max = (this.maxRange * (100 - parseInt(this.toPointer))) / 100;

      

        if (parseInt(this.toPointer) + parseInt(this.fromPointer) > 100) {
          this.stopMovingThumb(lineProcess);
          return;
        }

        this.updateElement("to");

        this.stopMovingThumb(lineProcess);
      };
    }

  };

  handleRangeSelect() {}

  updateElement(datasetElement) {
    const value =
      datasetElement === "from"
        ? this.minRange +
          (parseInt(this.fromPointer) / 100) * (this.maxRange - this.minRange)
        : this.maxRange -
          (parseInt(this.toPointer) / 100) * (this.maxRange - this.minRange);

    const formattedValue = this.formatValue(value);

    if (datasetElement === "from") {
      this.element.querySelector('span[data-element="from"]').textContent =
        formattedValue;
      this.element.querySelector(".range-slider__thumb-left").style.left =
        this.fromPointer;
    } else if (datasetElement === "to") {
      this.element.querySelector('span[data-element="to"]').textContent =
        formattedValue;
      this.element.querySelector(".range-slider__thumb-right").style.right =
        this.toPointer;
    }

    this.updateProgressElement();
  }

  updateProgressElement() {
    this.element.querySelector(
      ".range-slider__progress"
    ).style.cssText = `left:${this.fromPointer}; right:${this.toPointer}`;
  }

  stopMovingThumb(element) {
    element.onpointerup = (e) => {
      element.onpointermove = null;
      element.onpointerup = null;
      this.element.removeEventListener("range-select", this.handleRangeSelect);
    };
  }

  createListeners() {
    this.element.addEventListener("pointerdown", this.handlePointerDown);
    this.subElements.thumbRight.addEventListener(
      "range-select",
      this.handleRangeSelect
    );
  }

  destroyListeners() {
    this.element.removeEventListener("pointerdown", this.handlePointerDown);
    this.element.removeEventListener("range-select", this.handleRangeSelect);
  }

  selectSubElements() {
    this.element.querySelectorAll("[data-element]").forEach((element) => {
      this.subElements[element.dataset.element] = element;
    });
  }

  destroy() {
    this.element.remove();
    this.destroyListeners();
  }
}
