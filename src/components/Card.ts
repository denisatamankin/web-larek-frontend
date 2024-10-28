import { ComponentView } from "./base/ComponentView";
import { IProduct } from "../types";
import { ensureElement } from "../utils/utils";

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export class CardView extends ComponentView<IProduct> {
    protected _title: HTMLElement;
    protected _price: HTMLElement;
    protected _description?: HTMLElement;
    protected _category?: HTMLElement;
    protected _image?: HTMLImageElement;
    protected _button?: HTMLButtonElement;

    Category: { [key: string]: string } = {
		'софт-скил': 'card__category_soft',
		'хард-скил': 'card__category_hard',
		'дополнительное': 'card__category_additional',
		'другое': 'card__category_other',
		'кнопка': 'card__category_button',
	};

    constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {
        super(container);

        this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
        this._price = ensureElement<HTMLElement>(`.${blockName}__price`, container);
        this._description = container.querySelector(`.${blockName}__text`);
        this._category = container.querySelector(`.${blockName}__category`);
        this._image = container.querySelector(`.${blockName}__image`);
        this._button = container.querySelector(`.${blockName}__button`);

        if (actions?.onClick) {
            if (this._button) {
                this._button.addEventListener('click', actions.onClick);
            } else {
                container.addEventListener('click', actions.onClick);
            }
        }
    }

    set id(value: string) {
        this.container.dataset.id = value;
    }

    get id(): string {
        return this.container.dataset.id || '';
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    get title(): string {
        return this._title.textContent || '';
    }

    set price(value: number) {
        if (value) {
			this.setText(this._price, `${value} синапсов`);
		} else {			
            this.setText(this._price, `Бесценно`);
            this.setDisabled(this._button, true);
		}
    }

    set image(src: string) {
        this.setImage(this._image, src, this.title);
    }

    set description(value: string) {
        this.setText(this._description, value);
    }

    set category(value:string) {
        this.setText(this._category, value);
        this.toggleClass(this._category, this.Category[value], true);
    }
}

export class CardModalView extends CardView {
    private _inBasket: boolean;

    constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {
        super(blockName, container, actions)

        if (this._button) {
            this._button.addEventListener('click', () => {
                this.inBasket = !this.inBasket;
            })
        }
    }

    toggleButtonCondition(condition: boolean) {
        if (condition) {
            this.setText(this._button, 'Убрать из корзины');
        } else {
            this.setText(this._button, 'В корзину');
        }
    }

    set inBasket(value: boolean) {
        this.toggleButtonCondition(value);
        this._inBasket = value;
    }

    get inBasket(): boolean {
        return this._inBasket;
    }

    render(data: IProduct): HTMLElement {
        super.render(data);
        return this.container;
    }
}