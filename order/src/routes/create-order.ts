import express, { type Request, type Response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import {
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
  BadRequestError
} from '@jimm9tran/common';

import { Order } from '../models/order';
import { natsWrapper } from '../NatsWrapper';
import { OrderCreatedPublisher } from '../events/publishers/OrderCreatedPublisher';
import { Product } from '../models/product';
import type { OrderAttrs } from '../types/order';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 30 * 60;

router.post(
  '/api/orders',
  requireAuth,
  [
    body('cart')
      .not()
      .isEmpty()
      .withMessage('Giỏ hàng không được để trống'),
    body('shippingAddress')
      .not()
      .isEmpty()
      .withMessage('Địa chỉ giao hàng không được để trống'),
    body('paymentMethod')
      .not()
      .isEmpty()
      .withMessage('Phương thức thanh toán không được để trống')
  ],
  validateRequest,  async (req: Request, res: Response) => {
    const { cart, shippingAddress, paymentMethod }: Partial<OrderAttrs> = req.body;

    // Calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);    if (cart == null) {
      throw new Error('Giỏ hàng đang trống');
    } else if (paymentMethod == null) {
      throw new Error('Bạn chưa chọn phương thức thanh toán');
    }

    // Start MongoDB transaction to ensure atomicity
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        // Validate and reserve products in cart using optimistic locking
        for (let i = 0; i < cart.length; i++) {
          const cartItem = cart[i];
          
          // Find the product with session for transaction
          const existedProduct = await Product.findById(cartItem.productId).session(session);          // If product doesn't exist, throw an error
          if (existedProduct == null) {
            throw new NotFoundError();
          }

          // Check if product is already reserved
          if (existedProduct.isReserved) {
            throw new Error(`${existedProduct.title} đã được đặt trước, không thể mua tiếp`);
          }

          // Check if there's enough stock
          if (existedProduct.countInStock < cartItem.qty) {
            throw new Error(`${existedProduct.title} chỉ còn ${existedProduct.countInStock} sản phẩm, không đủ số lượng yêu cầu (${cartItem.qty})`);
          }

          // Additional check: make sure product is still available
          if (existedProduct.countInStock <= 0) {
            throw new Error(`${existedProduct.title} đã hết hàng`);
          }

          // Reserve the product using atomic operation with optimistic locking
          const newCountInStock = existedProduct.countInStock - cartItem.qty;
          const shouldReserve = newCountInStock === 0; // Reserve only if completely out of stock

          // Use findOneAndUpdate with version check to prevent race conditions
          const updatedProduct = await Product.findOneAndUpdate(
            { 
              _id: existedProduct._id, 
              version: existedProduct.version, // Optimistic concurrency control
              countInStock: { $gte: cartItem.qty }, // Double-check stock availability
              isReserved: false // Make sure it's not already reserved
            },
            {
              $inc: { countInStock: -cartItem.qty },
              $set: { 
                isReserved: shouldReserve,
                orderId: shouldReserve ? 'pending' : undefined,
                // Add timestamp for reservation tracking
                reservedAt: shouldReserve ? new Date() : undefined,
                reservedBy: shouldReserve ? req.currentUser!.id : undefined
              }
            },
            { 
              new: true, 
              session 
            }
          );          if (!updatedProduct) {
            throw new Error(`${existedProduct.title} đã được người khác mua hoặc đã cập nhật. Vui lòng thử lại.`);
          }

          console.log(`✅ Successfully reserved ${cartItem.qty} of ${existedProduct.title}, remaining stock: ${newCountInStock}`);
        }

        // Calculate discount factor
        const shippingDiscount = 1;

        // Calculate price
        const itemsPrice = cart.reduce(
          (acc, item) => acc + item.price * item.qty * item.discount,
          0
        );
        const shippingPrice = itemsPrice > 100.0 ? 0.0 : 10.0 * shippingDiscount;
        const taxPrice = 0.07 * itemsPrice;
        const totalPrice = itemsPrice + shippingPrice + taxPrice;

        // Build the order and save it to the database within transaction
        const order = Order.build({
          userId: req.currentUser!.id,
          status: OrderStatus.Created,
          expiresAt: expiration,
          cart,
          shippingAddress,
          paymentMethod,
          itemsPrice: parseFloat(itemsPrice.toFixed(2)),
          shippingPrice: parseFloat(shippingPrice.toFixed(2)),
          taxPrice: parseFloat(taxPrice.toFixed(2)),
          totalPrice: parseFloat(totalPrice.toFixed(2))
        });

        await order.save({ session });

        // Publish an event saying that an order was created
        await new OrderCreatedPublisher(natsWrapper.client).publish({
          id: order.id,
          status: order.status,
          userId: order.userId,
          expiresAt: order.expiresAt,
          version: order.version,
          cart,
          paymentMethod: order.paymentMethod,
          itemsPrice: order.itemsPrice,
          shippingPrice: order.shippingPrice,
          taxPrice: order.taxPrice,
          totalPrice: order.totalPrice,
          isPaid: order.isPaid,
          isDelivered: order.isDelivered
        });

        // Send response
        res.status(201).send(order);
      });
    } catch (error) {
      throw error;
    } finally {
      await session.endSession();
    }
  }
);

export { router as createOrderRouter };


