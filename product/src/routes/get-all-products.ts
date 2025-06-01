// src/routes/get-all-products.ts

import express, { type Request, type Response } from 'express';
import { Product } from '../models/product';

const router = express.Router();

router.get('/api/products', async (req: Request, res: Response) => {
  const {
    category,
    brand,
    minPrice,
    maxPrice,
    isFeatured,
    isActive,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 12
  } = req.query;

  // Build filter object
  const filter: any = {};

  // Category filter (electronics specific)
  if (category) {
    filter.category = category;
  }

  // Brand filter (electronics specific)
  if (brand) {
    filter.brand = { $regex: new RegExp(brand as string, 'i') };
  }

  // Price range filter
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Featured products filter
  if (isFeatured !== undefined) {
    filter.isFeatured = isFeatured === 'true';
  }

  // Active products filter (default to true)
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  } else {
    filter.isActive = true; // Default: only show active products
  }

  // Search in title, description, brand
  if (search) {
    const searchRegex = new RegExp(search as string, 'i');
    filter.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { brand: searchRegex },
      { tags: { $in: [searchRegex] } }
    ];
  }

  // Build sort object
  const sort: any = {};
  sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

  // Pagination
  const pageNumber = Math.max(1, Number(page));
  const limitNumber = Math.min(50, Math.max(1, Number(limit))); // Max 50 items per page
  const skip = (pageNumber - 1) * limitNumber;

  try {
    // Get products with pagination
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNumber)
      .lean();

    // Get total count for pagination info
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limitNumber);

    res.send({
      products,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalProducts,
        hasNext: pageNumber < totalPages,
        hasPrev: pageNumber > 1
      },
      filters: {
        category,
        brand,
        minPrice,
        maxPrice,
        isFeatured,
        search
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

export { router as getAllProductsRouter };
