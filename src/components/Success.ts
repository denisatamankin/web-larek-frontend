import { ComponentView } from "./base/ComponentView";
import { ensureElement } from "../utils/utils";
import { IOrderResult } from "../types";

interface ISuccessActions {
    onClick: () => void;
}

export class SuccessView extends ComponentView<IOrderResult> {
    protected _close: HTMLButtonElement;
    protected _description: HTMLElement;

    constructor(container: HTMLElement, actions: ISuccessActions) {
        super(container);

        this._close = ensureElement<HTMLButtonElement>('.order-success__close', this.container);
        this._description = ensureElement<HTMLElement>('.order-success__description',this.container);
        
        if (actions?.onClick) {
            this._close.addEventListener('click', actions.onClick);
        }
    }

    set total(value: number) {
        this.setText(this._description, `Списано ${value} синапсов`)
    }

    set id(value: string) {
		this.container.dataset.id = value;
	}
}