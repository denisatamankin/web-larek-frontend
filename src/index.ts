import './scss/styles.scss';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { EventEmitter } from './components/base/events';
import { IProduct, IPage, IOrderForm, BasketProduct } from './types';
import { StoreApi } from './components/StoreApi';
import { Basket, Catalog, Order } from './components/AppData';
import { Modal } from './components/common/Modal';
import { PageView } from './components/Page';
import { CardView, CardModalView } from './components/Card';
import { BasketView } from './components/Basket';
import { ContactFormView, PaymentFormView } from './components/Order';
import { SuccessView } from './components/Success';

// Все шаблоны 
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardModalTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const paymentFormTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactFormTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Модель данных приложения
const api = new StoreApi(CDN_URL, API_URL);
const events = new EventEmitter();
const catalog = new Catalog(events);
const basket = new Basket(events);
const order = new Order(events);
// Глобальные контейнеры
const pageView = new PageView(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
// Переиспользуемые части интерфейса
const basketView = new BasketView(cloneTemplate(basketTemplate), events);
const paymentFormView = new PaymentFormView(cloneTemplate(paymentFormTemplate), events);
const contactFormView = new ContactFormView(cloneTemplate(contactFormTemplate), events);
const successView = new SuccessView(cloneTemplate(successTemplate), {
    onClick: () => modal.close(),
});

// Получение всех товаров
const getProducts = () =>
api.getProductList()
    .then((data) => {
        catalog.setCatalog(data);
    })
    .catch(console.error);
getProducts();

events.on('catalog:changed', (data: IPage) => {
   pageView.catalog = data.catalog.map((product) => {
    const card = new CardView('card', cloneTemplate(cardCatalogTemplate), {
        onClick: () => events.emit('card:open', product),
    });
    return card.render({
        id: product.id,
        title: product.title,
        image: product.image,
        price: product.price,
        category: product.category,
    });
   });
});

events.on('card:open', (product: IProduct) => {
    const cardModal = new CardModalView('card', cloneTemplate(cardModalTemplate), {
        onClick: () => {
            product.inBasket = !product.inBasket;
            if (product.inBasket) {
                events.emit('product:add', product);
            } else {
                events.emit('product:remove', product);
            }
        },
    });
    modal.render({
        content: cardModal.render({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                description: product.description,
                category: product.category,
                inBasket: product.inBasket,
        }), 
    });
});

events.on('product:add', (product: IProduct) => {
    basket.addProduct(product);
    modal.close();
});

events.on('product:remove', (product: IProduct) => {
    basket.removeProduct(product);
});

events.on('counter:changed', () => {
    pageView.counter = basket.changeBasketCounter();
});

events.on('basket:open', () => {
    const basketData = basket.getBasket().basket;
    const _cardBasketTemplate = basketData.map((product) => {
        const cardBasket = new CardView('card', cloneTemplate(cardBasketTemplate), {
            onClick: () => {
                product.inBasket = !product.inBasket;
                events.emit('product:remove', product);
                events.emit('basket:open');
            },
        });
        return cardBasket.render({
            id: product.id,
			title: product.title,
			price: product.price,
        });
    });
    const basketRender = {
        content: basketView.render({
            products: _cardBasketTemplate,
            totalPrice: basket.getTotalPrice(),
        }),
    };
    modal.render(basketRender);
});

events.on('order:open', () => {
    order.items = basket.getProductIds();
    order.total = basket.getTotalPrice();
    modal.render({
        content: paymentFormView.render({            
			payment: order.order.payment,
            address: order.order.address,
			valid: order.validateOrder(),
			errors: [],
        }),
    });
    paymentFormView.selectButton();
});

events.on('orderErrors:changed', (errors: Partial<IOrderForm>) => {
    const { payment, address, email, phone } = errors;
    paymentFormView.valid = !payment && !address;
    paymentFormView.errors = Object.values({ payment, address })
                    .filter((i) => !!i)
                    .join('; ');
    contactFormView.valid = !email && !phone;
    contactFormView.errors = Object.values({ email, phone })
                    .filter((i) => !!i)
                    .join('; '); 
});

events.on('paymentForm:changed', 
    (data: { field: keyof IOrderForm; value: IOrderForm[keyof IOrderForm] }) => {
    order.setOrderField(data.field, data.value);
});

events.on('paymentForm:submit', () => {
    modal.render({
        content: contactFormView.render({
            email: order.order.email,
            phone: order.order.phone,
            valid: order.validateOrder(),
            errors: [],
        }),
    });
});

events.on('contactForm:changed', 
    (data: { field: keyof IOrderForm; value: IOrderForm[keyof IOrderForm] }) => {
    order.setOrderField(data.field, data.value);
});

events.on('contactForm:submit', () => {
    const { payment, address, email, phone } = order.order;
    api.orderProducts({
            payment,
            address,
            email,
            phone,        
            total: order.total,
            items: order.items,
        })
        .then((data) => {
            basket.clearBasket();
            order.clearOrder();
            events.emit('counter:changed');            
            modal.render({
                content: successView.render({                    
					total: data.total,
                }),
            });
            getProducts();             
        })
        .catch((err) => {
			console.error(err);
		});
});

events.on('modal:open', () => {
    pageView.pageLock = true;
});

events.on('modal:close', () => {
    pageView.pageLock = false;
});