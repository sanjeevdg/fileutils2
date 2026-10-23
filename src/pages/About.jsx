import React from "react";

import ProductImageGallery from './ProductImageGallery';



export default function About() {


const inventoryItem = {
    "id": 1,
    "sku": "P001",
    "name": "Laptop",
    "description": "15 inch laptop",
    "price": 800,
    "stock_quantity": 10,
    "active": true,
    "images": [
        "https://res.cloudinary.com/di6jamucx/image/upload/v1792648940/inventory/1/fh4wajfxwwwprsxy1hfk.png",
        "https://res.cloudinary.com/di6jamucx/image/upload/v1792677065/inventory/pending/cqlcw6pbhcfnqbo05aog.jpg",
        "https://res.cloudinary.com/di6jamucx/image/upload/v1792677385/inventory/pending/l7er5gaa1dk2n23hhfyo.webp"
    ]
};



  return (
    <>
      <h1>Aboutx</h1>
      <p>About this application.</p>


<ProductImageGallery
    images={inventoryItem.images}
    productName={inventoryItem.name}
    height={260}
/>

    </>
  );
}