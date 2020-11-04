window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const rec = new SpeechRecognition();
rec.interimResults = true;

rec.addEventListener("result", function(e) {
  var text = Array.from(e.results)
    .map(result => result[0])
    .map(result => result.transcript)
    .join('');
  
  Keyboard.properties.speech = text;
})

rec.addEventListener("end", function(e) {
  if (Keyboard.properties.speech.trim()) {
    let value = Keyboard.properties.value ? " " + Keyboard.properties.speech : Keyboard.properties.speech;

    Keyboard.properties.value = Keyboard.properties.value.substr(0, Keyboard.properties.cursor - 1) + value + Keyboard.properties.value.substr(Keyboard.properties.cursor - 1);
    Keyboard.properties.speech = "";
    Keyboard._triggerEvent("oninput");
  }
  
  if (Keyboard.properties.mic === "on") {
    rec.start();
  }
});

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
    volume: "on",
    mic: "off",
    speech: "",
    cursor: 0,
  },

  _moveCursor(cursor = this.properties.cursor) {
    let textarea = document.querySelector(".use-keyboard-input");
    this.properties.cursor = cursor;

    if (this.properties.cursor < 0) {
      this.properties.cursor = 0;
      cursor = 0;
    }

    if (this.properties.cursor > this.properties.value.length) {
      this.properties.cursor = this.properties.value.length;
      cursor = this.properties.value.length;
    }

    textarea.value = this.properties.value;
    textarea.focus();
    textarea.selectionStart = cursor;
    textarea.selectionEnd = cursor;
  },

  init() {
    this.elements.main = document.createElement("div");
    this.elements.keysContainer = document.createElement("div");

    this.elements.main.classList.add("keyboard", "keyboard--hidden");
    this.elements.keysContainer.classList.add("keyboard__keys");
    this.elements.keysContainer.appendChild(this._createKeys());

    this.elements.keys = this.elements.keysContainer.querySelectorAll(".keyboard__key");

    this.elements.main.appendChild(this.elements.keysContainer);
    document.body.appendChild(this.elements.main);

    document.querySelectorAll(".use-keyboard-input").forEach(element => {
      element.addEventListener("click", () => {
        this._moveCursor(element.selectionStart);
      })

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
    "volume", "shift", "space", "Eng", "<", ">", "mic",
  ],

  _createKeys(keyLayoutParameter = this.keyLayoutEn) {
    let textarea = document.querySelector(".use-keyboard-input");

    const fragment = document.createDocumentFragment();
    const keyLayout = keyLayoutParameter;

    const createIconHTML = (icon_name) => {
      return `<i class="material-icons">${icon_name}</i>`;
    };

    keyLayout.forEach(key => {
      const keyElement = document.createElement("button");
      let insertLineBreak = ["backspace", "p", "enter", "?"].indexOf(key) !== -1;

      if (this.properties.language === "rus") {
        insertLineBreak = ["backspace", "ъ", "enter", "."].indexOf(key) !== -1;
      }
      
      keyElement.setAttribute("type", "button");
      keyElement.classList.add("keyboard__key");

      switch (key) {
        case "backspace":
          keyElement.classList.add("keyboard__key--wide");
          keyElement.innerHTML = createIconHTML("backspace");

          keyElement.addEventListener("click", () => {
            Keyboard.properties.cursor--;
            textarea.focus();
            this.properties.value = this.properties.value.substring(0, this.properties.cursor) + this.properties.value.substring(this.properties.cursor + 1);
            this._moveCursor();
            this._triggerEvent("oninput");
            this.soundForKeys.backspace();
          });

          break;

        case "caps":
          keyElement.classList.add("keyboard__key--wide", "keyboard__key--activatable");
          keyElement.innerHTML = createIconHTML("keyboard_capslock");
          if (this.properties.capsLock) {
            keyElement.classList.toggle("keyboard__key--active", this.properties.capsLock);
          }

          keyElement.addEventListener("click", () => {
            textarea.focus();
            this._toggleCapsLock();
            keyElement.classList.toggle("keyboard__key--active", this.properties.capsLock);
            this.soundForKeys.caps();
          });

          break;

        case "enter":
          keyElement.classList.add("keyboard__key--wide");
          keyElement.innerHTML = createIconHTML("keyboard_return");

          keyElement.addEventListener("click", () => {
            textarea.focus();
            Keyboard.properties.cursor++;
            this.properties.value = this.properties.value.substr(0, this.properties.cursor - 1) + "\n" + this.properties.value.substr(this.properties.cursor - 1);
            this._moveCursor();
            this._triggerEvent("oninput");
            this.soundForKeys.enter();
          });

          break;

        case "shift":
          keyElement.classList.add("keyboard__key--wide", "keyboard__key--activatable");
          keyElement.innerHTML = "<span>Shift</span>";

          keyElement.addEventListener("click", () => {
            textarea.focus();
            this._toggleShift();
            keyElement.classList.toggle("keyboard__key--active", this.properties.shift);
            this.soundForKeys.shift();
          });

          break;

        case "space":
          keyElement.classList.add("keyboard__key--extra-wide");
          keyElement.innerHTML = createIconHTML("space_bar");

          keyElement.addEventListener("click", () => {
            textarea.focus();
            Keyboard.properties.cursor++;
            this.properties.value = this.properties.value.substr(0, this.properties.cursor - 1) + " " + this.properties.value.substr(this.properties.cursor - 1);
            this._moveCursor();
            this._triggerEvent("oninput");
            this.soundForKeys.default();
          });

          break;

        case "Eng":
          keyElement.classList.add("keyboard__key--wide");
          keyElement.innerHTML = "<span>Eng</span>";
  
          keyElement.addEventListener("click", () => {
            textarea.focus();
            this._changeLanguage();
            keyElement.classList.toggle("keyboard__key--active", this.properties.shift);
            this.soundForKeys.default();
          });

          rec.stop();
  
          break;

         case "Рус":
          keyElement.classList.add("keyboard__key--wide");
          keyElement.innerHTML = "<span>Рус</span>";
    
          keyElement.addEventListener("click", () => {
            textarea.focus();
            this._changeLanguage();
            keyElement.classList.toggle("keyboard__key--active", this.properties.shift);
            this.soundForKeys.default();
          });

          rec.stop();
    
          break;

        case "done":
          keyElement.classList.add("keyboard__key--wide", "keyboard__key--dark");
          keyElement.innerHTML = createIconHTML("check_circle");

          keyElement.addEventListener("click", () => {
            this.close();
            this._triggerEvent("onclose");
            this.soundForKeys.default();
          });

          break;
        
        case "<":
          keyElement.innerHTML = createIconHTML("keyboard_arrow_left");

          keyElement.addEventListener ("click", () => {
            Keyboard.properties.cursor--;
            this._moveCursor();
            this.soundForKeys.default();
          })

          break;

        case ">":
          keyElement.innerHTML = createIconHTML("keyboard_arrow_right");

          keyElement.addEventListener ("click", () => {
            Keyboard.properties.cursor++;
            this._moveCursor();
            this.soundForKeys.default();
          })

          break;

        case "volume":
          keyElement.classList.add("keyboard__key--wide");
          if (this.properties.volume === "on") {
            keyElement.innerHTML = createIconHTML("volume_up");
          } else if (this.properties.volume === "off") {
            keyElement.innerHTML = createIconHTML("volume_off");
          }

          keyElement.addEventListener("click", () => {
            textarea.focus();
            this._volume(keyElement);
            this.soundForKeys.default();
          })

          break;

        case "mic":
          if (this.properties.mic === "on") {
            keyElement.innerHTML = createIconHTML("mic");
          } else if (this.properties.mic === "off") {
            keyElement.innerHTML = createIconHTML("mic_off");
          }
          

          keyElement.addEventListener("click", () => {
            textarea.focus();
            this.soundForKeys.default();
            this._mic(keyElement);
          })

          if (this.properties.language === "eng") rec.lang = 'en-US';
          if (this.properties.language === "rus") rec.lang = 'ru-RU';

          break;

        default:
          keyElement.textContent = this.properties.capsLock ? key.toUpperCase() : key.toLowerCase();

          keyElement.addEventListener("click", () => {
            textarea.focus();
            this.properties.cursor++;

            let capsOrShift = this.properties.capsLock || this.properties.shift;

            let capsAndShift = true;
            if (this.properties.capsLock === true && this.properties.shift === true) capsAndShift = false;

            keyValue = capsOrShift && capsAndShift ? key.toUpperCase() : key.toLowerCase();
            this.properties.value = this.properties.value.substr(0, this.properties.cursor - 1) + keyValue + this.properties.value.substr(this.properties.cursor - 1);

            this.soundForKeys.default();
            this._moveCursor();
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
      this.eventHandlers[handlerName](this.properties.value + this.properties.speech);
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

    if (this.properties.language === "eng") {
      keyLayoutShift = ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")"];
    } else if (this.properties.language === "rus") {
      keyLayoutShift = ["!", '"', "№", ";", "%", ":", "?", "*", "(", ")"];
    }
    
    keyLayoutEnNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

    if (this.properties.shift) {
      for (let i = 0; i < 10; i++) {
        this.elements.keysContainer.removeChild(this.elements.keysContainer.firstChild)
      }
      this.elements.keysContainer.prepend(this._createKeys(keyLayoutShift));
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
      if (e.key == "ArrowLeft") eventKey = 'keyboard_arrow_left';
      if (e.key == "ArrowRight") eventKey = 'keyboard_arrow_right';

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
      if (e.key == "ArrowLeft") eventKey = 'keyboard_arrow_left';
      if (e.key == "ArrowRight") eventKey = 'keyboard_arrow_right';

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

  _changeLanguage () {
    if (this.properties.language === "eng") {
      this.properties.language = "rus";
      keyLayoutRU = [
        "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "backspace",
        "й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з", "х", "ъ",
        "caps", "ф", "ы", "в", "а", "п", "р", "о", "л", "д", "ж", "э", "enter",
        "done", "я", "ч", "с", "м", "и", "т", "ь", "б", "ю", ".",
        "volume", "shift", "space", "Рус", "<", ">", "mic",
      ];

      this.elements.keysContainer.innerHTML = "";
      this.elements.keysContainer.appendChild(this._createKeys(keyLayoutRU));
    } else if (this.properties.language === "rus") {
      this.properties.language = "eng";

      this.elements.keysContainer.innerHTML = "";
      this.elements.keysContainer.appendChild(this._createKeys());
    }

    this.elements.keys = this.elements.keysContainer.querySelectorAll(".keyboard__key");
  },

  _volume (keyElement) {
    if (this.properties.volume === "on") {
      this.properties.volume = "off"
      keyElement.innerHTML = `<i class="material-icons">volume_off</i>`;
    } else {
      this.properties.volume = "on";
      keyElement.innerHTML = `<i class="material-icons">volume_up</i>`;
    }
  },

  _mic (keyElement) {
    if (this.properties.mic === "off") {
      this.properties.mic = "on";
      keyElement.innerHTML = `<i class="material-icons">mic</i>`;
      rec.start();
    } else if (this.properties.mic === "on") {
      this.properties.mic = "off";
      keyElement.innerHTML = `<i class="material-icons">mic_off</i>`;
      rec.stop();
    }
  },

  soundForKeys : {
    default () {
      if (Keyboard.properties.volume === "on") {
        if (Keyboard.properties.language === "eng") {
          new Audio("./assets/sounds/default_en.mp3").play()
        } else if (Keyboard.properties.language === "rus") {
          new Audio("./assets/sounds/default_ru.mp3").play()
        }
      }
    },
    backspace () {
      if (Keyboard.properties.volume === "on") {
        new Audio("./assets/sounds/backspace.mp3").play();
      }
    },
    shift () {
      if (Keyboard.properties.volume === "on") {
        new Audio("./assets/sounds/shift.mp3").play();
      }
    },
    caps () {
      if (Keyboard.properties.volume === "on") {
        new Audio("./assets/sounds/caps.mp3").play()
      }
    },
    enter () {
      if (Keyboard.properties.volume === "on") {
        new Audio("./assets/sounds/enter.wav").play()
      }
    },
  },
}

window.addEventListener("DOMContentLoaded", function () {
  Keyboard.init();
});