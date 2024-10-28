import { ComponentView } from "./base/ComponentView";
import { IEvents } from "./base/events";
import { ensureElement } from "../utils/utils";

interface IPage {
    counter: number;
    catalog: HTMLElement[];
    pageLock: boolean;
}

export class PageView extends ComponentView<IPage> {
    protected _counter: HTMLElement;
    protected _catalog: HTMLElement;
    protected _wrapper: HTMLElement;
    protected _buttonBasket: HTMLButtonElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);
        this._counter = ensureElement<HTMLElement>('.header__basket-counter', this.container);
        this._catalog = ensureElement<HTMLElement>('.gallery', this.container);
		this._wrapper = ensureElement<HTMLElement>('.page__wrapper', this.container);
		this._buttonBasket = ensureElement<HTMLButtonElement>('.header__basket', this.container);

        this._buttonBasket.addEventListener('click', () => {
            this.events.emit('basket:open');
        });
    }

    set catalog(products: HTMLElement[]) {
        this._catalog.replaceChildren(...products);
    }

    set counter(value: number) {
        this.setText(this._counter, value);
    }    

    set pageLock(value: boolean) {
        if (value) {
            this._wrapper.classList.add('page__wrapper_locked');
        } else {
            this._wrapper.classList.remove('page__wrapper_locked');
        }
    }

}