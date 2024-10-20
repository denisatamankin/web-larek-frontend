export interface IProduct {
    id: string;
	description: string;
	image: string;
	title: string;
	category: ProductCategory;
	price: number | null;
}

export interface IOrder {
    payment: string;
	email: string;
	phone: string;
	address: string;
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
	basket: IProduct[];
}

export interface IForm {
    payment: PaymentMethod;
    address: string;
	email: string;
	phone: string;	
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;
export type ProductCategory = 'софт-скил' | 'хард-скил' | 'кнопка' | 'другое' | 'дополнительное';
export type PaymentMethod = 'card' | 'cash';