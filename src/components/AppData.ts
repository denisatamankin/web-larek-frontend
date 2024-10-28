import { IProduct,
    IBasket,
    BasketProduct,
    IOrder,
    IOrderForm,
    FormErrors,
    PaymentMethod } from "../types";
import { Model } from "./base/Model";
import { IEvents } from "./base/events";

export class Product extends Model<IProduct> {
	constructor(data: IProduct, events: IEvents) {
		super(data, events);
	}
}

export class Basket extends Model<BasketProduct[]> {
    protected productList: BasketProduct[] = [];

    constructor(events: IEvents) {
        super([], events);
    }

    getBasket(): IBasket {
        return { basket: this.productList};
    }

    changeBasketCounter() {
        return this.productList.length;
    }

    addProduct(product: IProduct): void {
        const productId = this.productList.findIndex((p) => p.id === product.id)
        if (productId === -1) {
            this.productList.push(product);
        }
        this.events.emit('counter:changed');
    }

    removeProduct(product: IProduct): void {
        const productId = product.id;
        this.productList = this.productList.filter((product) => {
            return product.id !== productId;
        })
        this.events.emit('counter:changed');        
    }
   
    clearBasket(): void {
        this.productList = [];
    }

    getTotalPrice() {
        return this.productList.reduce((totalPrice, product) => {
            return totalPrice + product.price;
        }, 0);
    }

    getProductIds(): string[] {
        return this.productList.map((product) => product.id)
    }

    makeOrder(): void {
        if (this.productList.length > 0) {
            this.emitChanges('basket:order');
        }
    }
}

export class Catalog extends Model<IProduct[]> {
    catalog: IProduct[] = [];

    constructor(events: IEvents) {
        super([], events);
    }

    setCatalog(products: IProduct[]) {
        this.catalog = products.map((product) => ({
            ...product,
            inBasket: false,
        }));
        this.emitChanges('catalog:changed', { catalog: this.catalog });
    }
}

export class Order extends Model<IOrder> {
    order: IOrderForm = {
        payment: '',
        address: '',
        email: '',
        phone: '',
    };
    total?: number = 0;
    items?: string[] = [];
    formErrors: FormErrors = {};

    constructor(events: IEvents) {
		super({}, events);
	}

    setOrderField(field: keyof IOrderForm, value: IOrderForm[keyof IOrderForm]) {
        if (field === 'payment') {
            this.order[field] = value as PaymentMethod;
        }
        if (field !== 'payment') {
            this.order[field] = value;
        }
        if (this.validateOrder()) {
            this.events.emit('order:ready', this.order)
        }
    }

    validateOrder() {
        const errors: typeof this.formErrors = {};
        if (!this.order.payment) {
            errors.payment = 'Выберите способ оплаты';
        }
        if (!this.order.address) {
            errors.address = 'Укажите адрес доставки';
        }
        if (!this.order.email) {
            errors.email = 'Укажите электронную почту';
        }
        if (!this.order.phone) {
            errors.phone = 'Укажите номер телефона';
        }
        this.formErrors = errors;
        this.events.emit('orderErrors:changed', this.formErrors);
        return Object.keys(errors).length === 0;
    }

    clearOrder(): IOrderForm {
		return (this.order = {
			payment: '',
			address: '',
			email: '',
			phone: '',
		});
	}
}