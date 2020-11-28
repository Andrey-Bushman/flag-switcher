// flag-switcher.js

// Символы для создания приватных свойств и функций класса FlagSwitcher.
const shadow = Symbol("flag-switcher.shadow-dom");
const render = Symbol("flag-switcher.render");
const getSvg = Symbol("flag-switcher.getSvg");
const getSvgContainerId = Symbol("softline.flag-switcher.getSvgContainerId");

/** Веб-компонент флага, показывающего наличие или отсутствие рисков или преимуществ. */
export class FlagSwitcher extends HTMLElement {

    /** Наименование HTML-тега, под которым регистрируется веб-компонент. */
    static get tagName() {
        return 'flag-switcher';
    }

    /** Значение, указывающее на то, что ни один из флагов не включен. */
    static get none() {
        return "none";
    }

    /** Наименование HTML-атрибута, содержащего информацию о текущем состоянии флагов. */
    static get valueAttributeName() {
        return "value"
    };

    /** Наименование HTML-атрибута, добавлением/удалением которого устанавливается блокировка/разблокировка
     * веб-компонента. Значение блокированного компонента не может быть изменено. */
    static get disabledAttributeName() {
        return "disabled";
    }

    /** Информация о допустимых значениях, которые должны использоваться в атрибуте, имя которого указано в свойстве
     * valueAttributeName. */
    static get allowedValues() {
        return {
            [FlagSwitcher.none]: { // Значение
                tooltip: "Риски и преимущества не выявлены.", // Подсказка
                color: "#b3b3b3", // Цвет SVG-изображения
            },
            flag: { // Значение
                tooltip: "Имеется риск.", // Подсказка
                color: "#ff0000",
            },
            dumbbell: { // Значение
                tooltip: "Имеется преимущество.", // Подсказка
                color: "#008000", // Цвет SVG-изображения
            },
        };
    }

    /** Перечень имён пользовательских событий, используемых в веб-компоненте. */
    static get allowedEvents() {
        return ["disabling-change"];
    }

    /** Конструктор класса. */
    constructor() {
        super();

        const fragment = document.createDocumentFragment();
        const root = document.createElement("div");
        root.id = "root";
        root.title = FlagSwitcher.allowedValues[FlagSwitcher.none].tooltip;
        fragment.appendChild(root);

        // Обработчик клика мышки вешаем на общего родителя флажков
        const switchValue = event => {
            if (this.disabled) return;
            // Получаем Id контейнера, на флажке которого кликнули мышкой
            const svgContainerId = Object.getOwnPropertyNames(FlagSwitcher.allowedValues)
                .map(n=>FlagSwitcher[getSvgContainerId](n)).find(n => event.path.map(m=>m.id).includes(n));

            if(svgContainerId) {
                const svgId = event.path.find(n=>n.id === svgContainerId).firstChild.id;
                // Id svg-изображения совпадает с интересующим нас значением
                this.value = this.value === svgId ? FlagSwitcher.none : svgId;
            }
        }

        root.addEventListener("click", switchValue);

        for (let value of Object.getOwnPropertyNames(FlagSwitcher.allowedValues).filter(n => n !== FlagSwitcher.none)) {

            const svg = FlagSwitcher[getSvg](value);
            svg.id = value;

            const svgPath = svg.getElementsByTagName("path")[0];
            const color = FlagSwitcher.allowedValues[FlagSwitcher.none].color;
            svgPath.setAttribute("style", `fill:${color}`);

            const svgContainer = document.createElement("div");
            svgContainer.id = FlagSwitcher[getSvgContainerId](svg.id);
            svgContainer.appendChild(svg);
            root.appendChild(svgContainer);
        }

        this[shadow] = this.attachShadow({mode: "closed"});
        this[shadow].innerHTML =
`<style>
* {
    margin: 0;
    padding: 0;
}
#root {
    display: inline-flex;
}
svg {
    width: 1em;
}
.disabled {
    border: 1px solid #B3B3B3;
    border-radius: 0.25em;
}
</style>`;

        this[shadow].appendChild(fragment);
    }

    /** Получить имя активного флага или значение, указанное в none, если флаг не установлен. */
    get value() {
        return this.hasAttribute(FlagSwitcher.valueAttributeName) ?
            this.getAttribute(FlagSwitcher.valueAttributeName) : FlagSwitcher.none;
    }

    /** Установить флаг.
     * @param {string} value - устанавливаемый флаг. Информацию о допустимых значениях см. в свойстве
     * FlagSwitcher.allowedValues. */
    set value(value) {
        if (this.disabled) {
            throw "Вы не можете редактировать свойство 'value' заблокированного "
            + "экземпляра класса FlagSwitcher (см. значение свойства 'disabled').";
        }

        if (this.value === value) return;

        if (Object.getOwnPropertyNames(FlagSwitcher.allowedValues).find(n => n === value)) {
            this.setAttribute(FlagSwitcher.valueAttributeName, value);
        } else {
            throw `Недопустимое значение свойства ${FlagSwitcher.valueAttributeName} экземпляра FlagSwitcher: `
            + `${value}. Перечень допустимых значений: `
            + `${Object.getOwnPropertyNames(FlagSwitcher.allowedValues).join(", ")}`;
        }
    }

    /** Проверка на то, заблокирован ли веб-компонент. */
    get disabled() {
        return this.hasAttribute(FlagSwitcher.disabledAttributeName);
    }

    /** Блокировка/разблокировка веб-компонента. У блокированного компонента нельзя менять значение свойства,
     * указанного в FlagSwitcher.valueAttributeName. */
    set disabled(value) {
        if (value === this.disabled) return;

        if (value) {
            this.setAttribute(FlagSwitcher.disabledAttributeName, "");
        } else {
            this.removeAttribute(FlagSwitcher.disabledAttributeName);
        }
    }

    /** Приватная функция, выполняющая перерисовку веб-компонента. */
    [render]() {
        const root = this[shadow].getElementById("root");
        root.title = FlagSwitcher.allowedValues[this.value].tooltip;
        root.className = this.disabled ? "disabled" : null;

        for (let value of Object.getOwnPropertyNames(FlagSwitcher.allowedValues)
            .filter(n => n !== FlagSwitcher.none)) {

            const svg = this[shadow].getElementById(value);
            const svgColor = FlagSwitcher.allowedValues[this.value === value ?
                value : FlagSwitcher.none].color;

            const svgPath = svg.getElementsByTagName("path")[0];
            svgPath.setAttribute("style", `fill:${svgColor}`);
        }
    }

    connectedCallback() {
        for (let eventName of FlagSwitcher.allowedEvents) {
            const eventAttName = `on${eventName}`;
            if (this.hasAttribute(eventAttName)) {
                const code = this.getAttribute(eventAttName);
                if (code) {
                    const eventHandler = new Function(code);
                    this.addEventListener(eventName, eventHandler);
                }
            }
        }
        this[render]();
    }

    static get observedAttributes() {
        return [FlagSwitcher.valueAttributeName, FlagSwitcher.disabledAttributeName];
    }

    attributeChangedCallback(attName, oldValue, newValue) {
        if (attName === FlagSwitcher.valueAttributeName) {
            const event = new CustomEvent("change", {detail: {value: this.value}});
            this.dispatchEvent(event);
        } else if (attName === FlagSwitcher.disabledAttributeName) {
            const event = new CustomEvent("disabling-change", {detail: {disabled: this.disabled}});
            this.dispatchEvent(event);
        }
        this[render]();
    }

    /** Получить id контейнера, в котором содержится svg-объект в составе shadow DOM.
     * @param {string} svgId - Идентификатор svg-объекта (совпадает с наименованием флага).
     */
    static [getSvgContainerId](svgId) {
        return `${svgId}-container`;
    }

    /** Получить svg-элемент по имени флага. Информацию о допустимых значениях см. в свойстве
     * FlagSwitcher.allowedValues. */
    static [getSvg](name) {
        if (!Object.getOwnPropertyNames(FlagSwitcher.allowedValues).find(n => n === name)) {
            throw `Недопустимое значение параметра name: '${name}'. `
            + `Перечень допустимых значений: `
            + `${Object.getOwnPropertyNames(FlagSwitcher.allowedValues).join(", ")}`;
        }

        const svgImages = {
            flag:
`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
   xmlns:dc="http://purl.org/dc/elements/1.1/"
   xmlns:cc="http://creativecommons.org/ns#"
   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
   xmlns:svg="http://www.w3.org/2000/svg"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
   version="1.1"
   x="0px"
   y="0px"
   viewBox="0 0 32 32"
   style="enable-background:new 0 0 32 32;"
   xml:space="preserve"
   sodipodi:docname="flag.svg"
   inkscape:version="1.0.1 (3bc2e813f5, 2020-09-07)"><metadata
   id="metadata11"><rdf:RDF><cc:Work
       rdf:about=""><dc:format>image/svg+xml</dc:format><dc:type
         rdf:resource="http://purl.org/dc/dcmitype/StillImage" /></cc:Work>
   </rdf:RDF></metadata><defs
   id="defs9" /><sodipodi:namedview
   pagecolor="#ffffff"
   bordercolor="#666666"
   borderopacity="1"
   objecttolerance="10"
   gridtolerance="10"
   guidetolerance="10"
   inkscape:pageopacity="0"
   inkscape:pageshadow="2"
   inkscape:window-width="1920"
   inkscape:window-height="1147"
   id="namedview7"
   showgrid="false"
   inkscape:zoom="30.625"
   inkscape:cx="16"
   inkscape:cy="16"
   inkscape:window-x="-8"
   inkscape:window-y="-8"
   inkscape:window-maximized="1"
   inkscape:current-layer="Icons" />
<style
   type="text/css"
   id="style2">
\t.st0{fill:none;stroke:#000000;stroke-width:2;stroke-linecap:round;
stroke-linejoin:round;stroke-miterlimit:10;}
</style>
<path
   d="M26.5,4.8c-0.3-0.2-0.7-0.2-1,0c-3.5,2.2-6.1,0.8-9-0.8c-3-1.6-6.5-3.4-11-0.7C5.2,3.6,5,3.9,5,
   4.3V18v0.3V29  c0,0.6,0.4,1,1,1s1-0.4,1-1V18.9c3.3-1.8,5.7-0.5,8.5,1c1.9,1,4,2.1,6.4,2.1c1.4,0,
   3-0.4,4.6-1.4c0.3-0.2,0.5-0.5,0.5-0.9v-14  C27,5.3,26.8,5,26.5,4.8z"
   id="path4"
   style="fill:#ff0000" />
</svg>`,
            dumbbell:
`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
   xmlns:dc="http://purl.org/dc/elements/1.1/"
   xmlns:cc="http://creativecommons.org/ns#"
   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
   xmlns:svg="http://www.w3.org/2000/svg"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
   viewBox="0 0 24 24"
   version="1.1"
   sodipodi:docname="dumbbell.svg"
   inkscape:version="1.0.1 (3bc2e813f5, 2020-09-07)">
  <metadata
     id="metadata10">
    <rdf:RDF>
      <cc:Work
         rdf:about="">
        <dc:format>image/svg+xml</dc:format>
        <dc:type
           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
      </cc:Work>
    </rdf:RDF>
  </metadata>
  <defs
     id="defs8" />
  <sodipodi:namedview
     pagecolor="#ffffff"
     bordercolor="#666666"
     borderopacity="1"
     objecttolerance="10"
     gridtolerance="10"
     guidetolerance="10"
     inkscape:pageopacity="0"
     inkscape:pageshadow="2"
     inkscape:window-width="1920"
     inkscape:window-height="1147"
     id="namedview6"
     showgrid="false"
     inkscape:zoom="40.833333"
     inkscape:cx="12"
     inkscape:cy="12"
     inkscape:window-x="-8"
     inkscape:window-y="-8"
     inkscape:window-maximized="1"
     inkscape:current-layer="svg4" />
  <path
     d="M17.48,6.55v0h0L14.64,3.71a1,1,0,0,0-1.42,0,1,1,0,0,0,0,1.41l2.12,2.12-8.1,8.1L5.12,13.22a1,1,0,
     0,0-1.41,0,1,1,0,0,0,0,1.42l2.81,2.81v0h0l2.81,2.81a1,1,0,0,0,.71.3,1,1,0,0,0,.71-1.71L8.66,
     16.76l8.1-8.1,2.12,2.12a1,1,0,1,0,1.41-1.42ZM3.71,17.46a1,1,0,0,0-1.42,1.42l2.83,2.83a1,1,0,0,
     0,.71.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.42Zm18-12.34L18.88,2.29a1,1,0,0,0-1.42,1.42l2.83,2.83a1,
     1,0,0,0,1.42,0A1,1,0,0,0,21.71,5.12Z"
     id="path2"
     style="fill:#008000" />
</svg>`,
        }

        const template = document.createElement("template");
        template.innerHTML = svgImages[name];
        return template.content.firstElementChild;
    }
}
// Сообщить в консоль об успешной регистрации веб-компонента.
window.customElements.whenDefined(FlagSwitcher.tagName).then(() => {
    window.console.log(`Веб-компонент '${FlagSwitcher.tagName}' зарегистрирован.`);
});

// Регистрация веб-компонента
if (!window.customElements.get(FlagSwitcher.tagName)) {
    window.customElements.define(FlagSwitcher.tagName, FlagSwitcher);
}