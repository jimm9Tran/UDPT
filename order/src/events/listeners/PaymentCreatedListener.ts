import {
  Subjects,
  Listener,
  type PaymentCreatedEvent,
  OrderStatus,
  QueueGroupNames
} from '@jimm9tran/common';
import { type Message } from 'node-nats-streaming';
import axios from 'axios';

import { Order } from '../../models/order';
import { natsWrapper } from '../../NatsWrapper';
import { OrderUpdatedPublisher } from '../publishers/OrderUpdatedPublisher';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {  readonly subject = Subjects.PaymentCreated as const;
  queueGroupName = QueueGroupNames.OrderService;

  async onMessage (data: PaymentCreatedEvent['data'], msg: Message): Promise<void> {
    const order = await Order.findById(data.orderId);

    if (order == null) {
      throw new Error('Order not found');
    }    // Query Payment service to get payment status since PaymentCreatedEvent doesn't include it
    let paymentStatus = 'success'; // Default for backward compatibility
    try {
      console.log(`Querying payment status for order ${data.orderId}...`);
      const response = await axios.get(`http://payment-srv:3004/api/payments/order/${data.orderId}`);
      if (response.status === 200 && response.data) {
        paymentStatus = response.data.status;
        console.log(`Payment status for order ${data.orderId}: ${paymentStatus}`);
      } else {
        console.log(`Failed to fetch payment status for order ${data.orderId}, defaulting to success`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`Error fetching payment status for order ${data.orderId}:`, errorMessage);
      console.log('Defaulting to success status for backward compatibility');
    }

    // Handle different payment statuses
    if (paymentStatus === 'awaiting_delivery') {
      // For COD payments with AwaitingDelivery status, keep order as Pending until delivery
      console.log(`COD payment for order ${data.orderId} is awaiting delivery, keeping order pending`);
      order.set({
        status: OrderStatus.Pending, // Keep as pending until delivery confirmation
        isPaid: false, // COD is not paid until delivery
        paidAt: undefined
      });
    } else {
      // For successful payments (VNPay, Stripe, or COD completed), mark order as completed
      console.log(`Payment for order ${data.orderId} is completed, updating order status`);
      order.set({
        status: OrderStatus.Completed,
        isPaid: true,
        paidAt: new Date()
      });
    }

    await order.save();

    // Publish order updated event with appropriate status
    await new OrderUpdatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt,
      version: order.version,
      paymentMethod: order.paymentMethod,
      itemsPrice: order.itemsPrice,
      shippingPrice: order.shippingPrice,
      taxPrice: order.taxPrice,
      totalPrice: order.totalPrice,
      isPaid: order.isPaid || false,
      paidAt: order.paidAt,
      isDelivered: order.isDelivered
    });

    console.log(`Order ${data.orderId} updated with status: ${order.status}, isPaid: ${order.isPaid}`);
    msg.ack();
  }
}
