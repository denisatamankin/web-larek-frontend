export interface IProduct {
    id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
	inBasket?: boolean;
}

export interface IOrderForm {
    payment: PaymentMethod;
    address: string;
	email: string;
	phone: string;	
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;
export type PaymentMethod = 'card' | 'cash' | '';

export interface IOrder extends IOrderForm {
	total: number;
	items: string[];
}

export interface IOrderResult {
	id: string;
	total: number;
}

export interface IPage {
	counter: number;
	catalog: IProduct[];
	pageLock: boolean;	
}

export interface IBasket {
	basket: BasketProduct[];
}

export type BasketProduct = Pick<IProduct, 'id' | 'title' | 'price'> & {inBasket?: boolean};