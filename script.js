const Keyboard = {
  elements: {
    main: null,
    keysContainer: null,
    keys: []
  },

  eventHandlers: {
    oninput: null,
    onclose: null
  },

  properties: {
    value: "",
    capsLock: false,
    shift: false,
    language: "eng",
  },

  init() {
    // Create main elements
    this.elements.main = document.createElement("div");
    this.elements.keysContainer = document.createElement("div");

    // Setup main elements
    this.elements.main.classList.add("keyboard", "keyboard--hidden");
    this.elements.keysContainer.classList.add("keyboard__keys");
    this.elements.keysContainer.appendChild(this._createKeys());

    this.elements.keys = this.elements.keysContainer.querySelectorAll(".keyboard__key");

    // Add to DOM
    this.elements.main.appendChild(this.elements.keysContainer);
    document.body.appendChild(this.elements.main);

    document.addEventListener

    // Automatically use keyboard for elements with .use-keyboard-input
    document.querySelectorAll(".use-keyboard-input").forEach(element => {
      element.addEventListener("focus", () => {
        this.open(element.value, currentValue => {
          element.value = currentValue;
        });
      });
    });

    this.realKeyboard();
  },

  keyLayoutEn : [
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "backspace",
    "q", "w", "e", "r", "t", "y", "u", "i", "o", "p",
    "caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", "enter",
    "done", "z", "x", "c", "v", "b", "n", "m", ",", ".", "?",
    "shift", "space", "Eng"
  ],

  _createKeys(keyLayoutParameter = this.keyLayoutEn) {
    const fragment = document.createDocumentFragment();
    const keyLayout = keyLayoutParameter;

    // Creates HTML for an icon
    const createIconHTML = (icon_name) => {
      return `<i class="material-icons">${icon_name}</i>`;
    };

    keyLayout.forEach(key => {
      const keyElement = document.createElement("button");
      const insertLineBreak = ["backspace", "p", "enter", "?", "ъ", "ю"].indexOf(key) !== -1;

      // Add attributes/classes
      keyElement.setAttribute("type", "button");
      keyElement.classList.add("keyboard__key");

      switch (key) {
        case "backspace":
          keyElement.classList.add("keyboard__key--wide");
          keyElement.innerHTML = createIconHTML("backspace");

          keyElement.addEventListener("click", () => {
            this.properties.value = this.properties.value.substring(0, this.properties.value.length - 1);
            this._triggerEvent("oninput");
          });

          break;

        case "caps":
          keyElement.classList.add("keyboard__key--wide", "keyboard__key--activatable");
          keyElement.innerHTML = createIconHTML("keyboard_capslock");

          keyElement.addEventListener("click", () => {
            this._toggleCapsLock();
            keyElement.classList.toggle("keyboard__key--active", this.properties.capsLock);
          });

          break;

        case "enter":
          keyElement.classList.add("keyboard__key--wide");
          keyElement.innerHTML = createIconHTML("keyboard_return");

          keyElement.addEventListener("click", () => {
            this.properties.value += "\n";
            this._triggerEvent("oninput");
          });

          break;

        case "shift":
          keyElement.classList.add("keyboard__key--wide", "keyboard__key--activatable");
          keyElement.innerHTML = "<span>Shift</span>";

          keyElement.addEventListener("click", () => {
            this._toggleShift();
            keyElement.classList.toggle("keyboard__key--active", this.properties.shift);
          });

          break;

        case "space":
          keyElement.classList.add("keyboard__key--extra-wide");
          keyElement.innerHTML = createIconHTML("space_bar");

          keyElement.addEventListener("click", () => {
            this.properties.value += " ";
            this._triggerEvent("oninput");
          });

          break;

        case "Eng":
          keyElement.classList.add("keyboard__key--wide");
          keyElement.innerHTML = "<span>Eng</span>";
  
          keyElement.addEventListener("click", () => {
            this._toggleLanguage();
            keyElement.classList.toggle("keyboard__key--active", this.properties.shift);
          });
  
          break;

         case "Рус":
          keyElement.classList.add("keyboard__key--wide");
          keyElement.innerHTML = "<span>Рус</span>";
    
          keyElement.addEventListener("click", () => {
            this._toggleLanguage();
            keyElement.classList.toggle("keyboard__key--active", this.properties.shift);
          });
    
          break;

        case "done":
          keyElement.classList.add("keyboard__key--wide", "keyboard__key--dark");
          keyElement.innerHTML = createIconHTML("check_circle");

          keyElement.addEventListener("click", () => {
            this.close();
            this._triggerEvent("onclose");
          });

          break;

        default:
          keyElement.textContent = key.toLowerCase();

          keyElement.addEventListener("click", () => {
            this.properties.value += this.properties.capsLock || this.properties.shift ? key.toUpperCase() : key.toLowerCase();
            this._triggerEvent("oninput");
          });

          break;
      }

      fragment.appendChild(keyElement);

      if (insertLineBreak) {
        fragment.appendChild(document.createElement("br"));
      }
    });

    return fragment;
  },

  _triggerEvent(handlerName) {
    if (typeof this.eventHandlers[handlerName] == "function") {
      this.eventHandlers[handlerName](this.properties.value);
    }
  },

  _toggleCapsLock() {
    this.properties.capsLock = !this.properties.capsLock;

    for (const key of this.elements.keys) {
      if (key.childElementCount === 0) {
        if (this.properties.shift && !this.properties.capsLock) {
          key.textContent =  key.textContent.toUpperCase();
        }
        if (!this.properties.shift && !this.properties.capsLock) {
          key.textContent =  key.textContent.toLowerCase();
        }
        if (this.properties.shift && this.properties.capsLock) {
          key.textContent =  key.textContent.toLowerCase();
        }
        if (!this.properties.shift && this.properties.capsLock) {
          key.textContent =  key.textContent.toUpperCase();
        }
      }
    }
  },

  _toggleShift() {
    this.properties.shift = !this.properties.shift;

    keyLayoutEnShift = ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")"];
    keyLayoutEnNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

    if (this.properties.shift) {
      for (let i = 0; i < 10; i++) {
        this.elements.keysContainer.removeChild(this.elements.keysContainer.firstChild)
      }
      this.elements.keysContainer.prepend(this._createKeys(keyLayoutEnShift));
    } else {
      for (let i = 0; i < 10; i++) {
        this.elements.keysContainer.removeChild(this.elements.keysContainer.firstChild);
      }
      this.elements.keysContainer.prepend(this._createKeys(keyLayoutEnNumbers));
    }

    this.elements.keys = this.elements.keysContainer.querySelectorAll(".keyboard__key");
    
    for (const key of this.elements.keys) {
      if (key.childElementCount === 0) {
        if (this.properties.shift && !this.properties.capsLock) {
          key.textContent =  key.textContent.toUpperCase();
        }
        if (!this.properties.shift && !this.properties.capsLock) {
          key.textContent =  key.textContent.toLowerCase();
        }
        if (this.properties.shift && this.properties.capsLock) {
          key.textContent =  key.textContent.toLowerCase();
        }
        if (!this.properties.shift && this.properties.capsLock) {
          key.textContent =  key.textContent.toUpperCase();
        }
      }
    }
  },

  open(initialValue, oninput, onclose) {
    this.properties.value = initialValue || "";
    this.eventHandlers.oninput = oninput;
    this.eventHandlers.onclose = onclose;
    this.elements.main.classList.remove("keyboard--hidden");
  },

  close() {
    this.properties.value = "";
    this.eventHandlers.oninput = oninput;
    this.eventHandlers.onclose = onclose;
    this.elements.main.classList.add("keyboard--hidden");
  },

  realKeyboard() {
    document.addEventListener('keydown', (e) => {
      eventKey = e.key.toLowerCase();
      if (e.code == "Space") eventKey = 'space_bar';
      if (e.key == "Backspace") eventKey = 'backspace';
      if (e.key == "Enter") eventKey = 'keyboard_return';
      if (e.key == "CapsLock") eventKey = 'keyboard_capslock';
      if (e.key == "Shift") eventKey = 'Shift';

      for (key of this.elements.keys) {
        if (key.childElementCount === 0) {
          if (eventKey === key.innerHTML.toLowerCase()) {
            
            key.classList.add("keyboard__key--pressed");
            key.click();
          }
        }

        if (key.childElementCount === 1) {
          if (eventKey === key.firstChild.innerHTML) {
            key.classList.add("keyboard__key--pressed");
            key.click();
          }
        } 
      }

      e.preventDefault();
    });

    document.addEventListener('keyup', (e) => {
      eventKey = e.key.toLowerCase();
      if (e.code == "Space") eventKey = 'space_bar';
      if (e.key == "Backspace") eventKey = 'backspace';
      if (e.key == "Enter") eventKey = 'keyboard_return';
      if (e.key == "CapsLock") eventKey = 'keyboard_capslock';
      if (e.key == "Shift") eventKey = 'Shift';

      for (key of this.elements.keys) {
        if (key.childElementCount === 0) {
          if (eventKey === key.innerHTML.toLowerCase()) {
            key.classList.remove("keyboard__key--pressed");
          }
        }

        if (key.childElementCount === 1) {
          if (eventKey === key.firstChild.innerHTML) {
            key.classList.remove("keyboard__key--pressed");
            if (eventKey == "Shift") {
              this._toggleShift();
              key.classList.toggle("keyboard__key--active", this.properties.shift);
            }
          }
        } 
      }

      e.preventDefault();
    })
  },

  _toggleLanguage () {
    if (this.properties.language === "eng") {
      this.properties.language = "rus";
      keyLayoutRU = [
        "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "backspace",
        "й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з", "х", "ъ",
        "caps", "ф", "ы", "в", "а", "п", "р", "о", "л", "д", "ж", "э", "enter",
        "done", "я", "ч", "с", "м", "и", "т", "ь", "б", "ю",
        "shift", "space", "Рус",
      ];

      this.elements.keysContainer.innerHTML = "";
      this.elements.keysContainer.appendChild(this._createKeys(keyLayoutRU));
    } else if (this.properties.language === "rus") {
      this.properties.language = "eng";

      this.elements.keysContainer.innerHTML = "";
      this.elements.keysContainer.appendChild(this._createKeys());
    }
  },

}

window.addEventListener("DOMContentLoaded", function () {
  Keyboard.init();
});