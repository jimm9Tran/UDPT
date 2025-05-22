// src/types/OrderCreatedEvent.ts
import { OrderStatus } from "../../enums/order-status.enum";
import { Subjects } from "../Subjects";

interface cartInterface {
    userId: string;
    title: string;
    qty: number;
    color: string;
    size: string;
    image: string;
    price: number;
    countInStock: number;
    discount: number;
    productId: string;
}
export interface OrderCreatedEvent {
    subject: Subjects.OrderCreated;
    data: {
        id: string;
        status: OrderStatus;
        userId: string;
        expiresAt: Date;
        version: number;
        cart?: Array<cartInterface>;
        paymentMethod: string;
        itemsPrice: number;
        shippingPrice: number;
        taxPrice: number;
        totalPrice: number;
        isPaid?: boolean;
        paidAt?: Date;
        isDelivered?: boolean;
        deliveredAt?: Date;
    };
}
export {};
