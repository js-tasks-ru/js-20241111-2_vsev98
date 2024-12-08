export default class DoubleSlider {
  subElements = {};
  constructor({
    min = 100,
    max = 200,
    selected: { from = 110, to = 190 } = {},
    formatValue = (value) => `$${value}`,
  } = {}) {
   
    this.valueSign = "$";
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;

    this.fromPointer = this.percentValue(from, min, max);
    this.toPointer = this.percentValue(to, max, min);

    this.minRange = this.formatValue(from);
    this.maxRange = this.formatValue(to);

    this.element = this.createElement(this.createElementTemplate());

    this.selectSubElements();
    this.createListeners();
  }

  formatValue(value) {
    return this.valueSign + value;
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
        <span data-element="from">${this.minRange}</span>
        <div data-element="inner" class="range-slider__inner">
            ${this.createProgressTemplate()}
            ${this.createThumbLeftTemplate()}
            ${this.createThumbRightTemplate()}
        </div>
        <span data-element="to">${this.maxRange}</span>
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
    if (target.classList.contains("range-slider__thumb-left")) {
      const lineProcess = target.closest(".range-slider__inner");

        lineProcess.setPointerCapture(e.pointerId);

      lineProcess.onpointermove = (e) => {
        this.fromPointer = this.getPercentages(lineProcess, e.clientX, "left");

        this.minRange = this.formatValue(
          (this.min * (100 + parseInt(this.fromPointer))) / 100
        );

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

        lineProcess.setPointerCapture(e.pointerId);

      lineProcess.onpointermove = (e) => {
        this.toPointer = this.getPercentages(lineProcess, e.clientX, "right");

        this.maxRange = this.formatValue(
          (this.max * (100 - parseInt(this.toPointer))) / 100
        );

        if (parseInt(this.toPointer) + parseInt(this.fromPointer) > 100) {
          this.stopMovingThumb(lineProcess);
          return;
        }

        this.updateElement("to");

        this.stopMovingThumb(lineProcess);
      };
    }
  };

  updateElement(datasetElement) {
    const value =
      datasetElement === "from"
        ? this.min + (parseInt(this.fromPointer) / 100) * (this.max - this.min)
        : this.max - (parseInt(this.toPointer) / 100) * (this.max - this.min);

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
    element.onpointerup = function (e) {
      element.onpointermove = null;
      element.onpointerup = null;
    };
  }


  createListeners() {
    this.element.addEventListener("pointerdown", this.handlePointerDown);

  }

  destroyListeners() {
    this.element.removeEventListener("pointerdown", this.handlePointerDown);

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
