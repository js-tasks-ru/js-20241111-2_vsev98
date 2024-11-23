export default class NotificationMessage {
  element;
  constructor(
    message = "",
    { duration = 2000, type = "success" } = { duration: 2000, type: "success" }
  ) {
    this.duration = duration;
    this.message = message;
    this.type = type;
    this.element = this.createElement(this.createElementTemplate());
  }

  createElement(template) {
    const element = document.createElement("div");
    element.innerHTML = template;

    return element.firstElementChild;
  }

  createElementTemplate() {
    return `<div class="${this.type}" style="--value:20s">
              <div class="timer"></div>
              <div class="inner-wrapper">
                  <div class="notification-header">${this.type}</div>
                  <div class="notification-body">
                    ${this.message}
                  </div>
              </div>
            </div>`;
  }

  show(parentElement) {
    this.element = this.createElement(this.createElementTemplate());

    if (!!parentElement) {
      parentElement.append(this.element);
    }
    setTimeout(this.remove.bind(this), this.duration);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
