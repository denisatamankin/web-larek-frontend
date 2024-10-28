import { IEvents } from "./base/events";
import { ensureAllElements } from "../utils/utils";
import { Form } from "./common/Form";
import { IOrderForm, PaymentMethod } from "../types";

export class PaymentFormView extends Form<Partial<IOrderForm>> {
    protected _payment:  HTMLButtonElement[];

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
        this._submit.addEventListener('click', () => {
            this.events.emit('paymentForm:submit');
        });
        this._payment = ensureAllElements('.order__buttons button', container);
        this._payment.forEach((item) => {
            item.addEventListener('click', (event) => {
                this.selectButton();
                item.classList.add('button_alt-active');
                const payment = (event.target as HTMLButtonElement).name;
                this.paymentSelection(payment as PaymentMethod);
            });
        });
    }

    selectButton() {
        if (this._payment) {
            this._payment.forEach((item) => {
                item.classList.remove('button_alt-active');
            });
        }
    }

    paymentSelection(method: PaymentMethod) {
        this.events.emit('paymentForm:changed', {field: 'payment', value: method});
    }

    protected onInputChange(field: keyof IOrderForm, value: string): void {
        this.events.emit('paymentForm:changed', {field, value});
    }

    set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}
}

export class ContactFormView extends Form<Partial<IOrderForm>> {
    constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);
		this._submit.addEventListener('click', () => {
			this.events.emit('contactForm:submit');
		});
	}

    set phone(value: string) {
		(this.container.elements.namedItem('phone') as HTMLInputElement).value =
			value;
	}

	set email(value: string) {
		(this.container.elements.namedItem('email') as HTMLInputElement).value =
			value;
	}

    protected onInputChange(field: keyof IOrderForm, value: string): void {
        this.events.emit('contactForm:changed', {field, value});
    }
}