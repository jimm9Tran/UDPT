import express, { type Request, type Response } from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import axios from 'axios';
import {
  NotFoundError,
  OrderStatus,
  BadRequestError
} from '@jimm9tran/common';

import { Order } from '../models/order';
import { natsWrapper } from '../NatsWrapper';
import { OrderCreatedPublisher } from '../events/publishers/OrderCreatedPublisher';
import type { OrderAttrs } from '../types/order';

const router = express.Router();
const EXPIRATION_WINDOW_SECONDS = 30 * 60;

// Basic test route
router.post('/api/orders/test', async (req: Request, res: Response) => {
  console.log('🧪 Test route hit!');
  console.log('🧪 Request body:', req.body);
  console.log('🧪 Current user:', req.currentUser);
  res.status(200).json({ message: 'Test route working', body: req.body });
});

// Test order creation without authentication
router.post('/api/orders/test-create', async (req: Request, res: Response) => {
  console.log('🧪 Testing order creation without authentication');
  console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { cart, shippingAddress, paymentMethod }: Partial<OrderAttrs> = req.body;

    // Mock user for testing
    const mockUser = { id: '507f1f77bcf86cd799439011' };

    // Basic validation
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Cart must be a non-empty array' });
    }
    if (!paymentMethod) {
      return res.status(400).json({ error: 'Payment method is required' });
    }
    if (!shippingAddress) {
      return res.status(400).json({ error: 'Shipping address is required' });
    }

    console.log('🔄 Starting order creation test');
    console.log('📦 Cart items:', JSON.stringify(cart, null, 2));

    // Calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // First, validate all products and check inventory via Product service API
    const productServiceUrl = process.env.PRODUCT_SERVICE_URL || 'http://product-service:3000';
    
    for (let i = 0; i < cart.length; i++) {
      const cartItem = cart[i];
      console.log(`🔍 Validating cart item ${i + 1}:`, cartItem);
      
      try {
        // Check if product exists and has enough stock
        const productResponse = await axios.get(`${productServiceUrl}/api/products/${cartItem.productId}`);
        const product = productResponse.data;
        
        console.log('🔍 Found product:', product.title);

        // Check if there's enough stock
        if (product.countInStock < cartItem.qty) {
          return res.status(400).json({ 
            error: `${product.title} chỉ còn ${product.countInStock} sản phẩm, không đủ số lượng yêu cầu (${cartItem.qty})` 
          });
        }

        // Check if product is available
        if (product.countInStock <= 0) {
          return res.status(400).json({ 
            error: `${product.title} đã hết hàng` 
          });
        }

      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          console.log('❌ Product not found:', cartItem.productId);
          return res.status(404).json({ error: 'Product not found' });
        }
        throw error;
      }
    }

    // Reserve inventory for all products via Product service API
    console.log(`🔒 Reserving inventory for ${cart.length} products`);
    
    // Format cart items for the product service API
    const items = cart.map(cartItem => ({
      productId: cartItem.productId,
      quantity: cartItem.qty
    }));
    
    let reservationId: string;
    
    try {
      const reservationResponse = await axios.post(`${productServiceUrl}/api/products/reserve-inventory`, {
        items
      });
      
      reservationId = reservationResponse.data.reservationId;
      console.log(`✅ Reserved inventory for all products with reservation ID: ${reservationId}`);
    } catch (error) {
      console.log('❌ Inventory reservation failed:', error);
      if (axios.isAxiosError(error) && error.response?.data) {
        return res.status(400).json({ 
          error: `Inventory reservation failed: ${error.response.data.message || 'Unknown error'}` 
        });
      }
      return res.status(400).json({ error: 'Failed to reserve inventory' });
    }

    try {
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

      // Build the order and save it to the database
      const order = Order.build({
        userId: mockUser.id,
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

      await order.save();
      console.log(`✅ Order created: ${order.id}`);

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
      res.status(201).json({
        message: 'Order created successfully (test mode)',
        order: order,
        reservationId: reservationId
      });

    } catch (orderError) {
      // If order creation fails, release the reservation
      console.log('❌ Order creation failed, releasing reservation');
      try {
        await axios.post(`${productServiceUrl}/api/products/release-inventory`, {
          reservationId
        });
        console.log('✅ Released reservation:', reservationId);
      } catch (releaseError) {
        console.error('❌ Failed to release reservation:', reservationId, releaseError);
      }
      
      return res.status(500).json({ 
        error: 'Order creation failed',
        details: orderError instanceof Error ? orderError.message : 'Unknown error'
      });
    }

  } catch (error) {
    console.log('❌ Order creation test error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as testOrderRouter };
