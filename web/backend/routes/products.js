import { Router } from "express";
import { Shopify } from "@shopify/shopify-api";

export const productsRoute = Router();

productsRoute.get("/", async (req, res) => {
  const session = res.locals.shopify.session;

  try {
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
    const response = await client.get({
      path: 'products',
      query: { limit: 50 }, // Adjust limit as needed
    });

    res.status(200).send(response.body.products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send(error.message);
  }
});
