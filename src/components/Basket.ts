import { ComponentView } from "./base/ComponentView";
import { ensureElement, createElement } from "../utils/utils";
import { IEvents } from "./base/events";

interface IBasketView {
    products: HTMLElement[];
    totalPrice: number;
}

export class BasketView extends ComponentView<IBasketView> {
    protected _list: HTMLElement;
    protected _totalPrice: HTMLElement;
    protected _button: HTMLButtonElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this._list = ensureElement<HTMLElement>('.basket__list', this.container);
        this._totalPrice = ensureElement<HTMLElement>('.basket__price', this.container);
        this._button = ensureElement<HTMLButtonElement>('.basket__button', this.container);

        this._button.addEventListener('click',() => {
            events.emit('order:open');
        });
        
        this.products = [];        
    }

    set products(products: HTMLElement[]) {
        if (products.length) {
            this._list.replaceChildren(...products);
            this.setVisible(this._totalPrice);
            this.setDisabled(this._button, false);
        } else {
            this._list.replaceChildren(createElement<HTMLParagraphElement>('p', {
                textContent: 'Корзина пуста'
            }));
            this.setHidden(this._totalPrice);
            this.setDisabled(this._button, true);
        }
    }

    set totalPrice(value: number) {
        this.setText(this._totalPrice, value);
    }
}