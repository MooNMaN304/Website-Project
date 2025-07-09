export const mockProducts = [
  {
    id: 'product-6000',
    handle: 'sample-t-shirt',
    availableForSale: true,
    title: 'Sample T-Shirt',
    description: 'A comfortable and stylish t-shirt made from 100% cotton.',
    descriptionHtml: '<p>A comfortable and stylish t-shirt made from 100% cotton.</p>',
    options: [
      {
        id: 'option-1',
        name: 'Size',
        values: ['S', 'M', 'L', 'XL']
      },
      {
        id: 'option-2',
        name: 'Color',
        values: ['Black', 'White', 'Blue']
      }
    ],
    priceRange: {
      maxVariantPrice: {
        amount: '29.99',
        currencyCode: 'USD'
      },
      minVariantPrice: {
        amount: '29.99',
        currencyCode: 'USD'
      }
    },
    variants: {
      edges: [
        {
          node: {
            id: 'variant-1',
            availableForSale: true,
            selectedOptions: [
              {
                name: 'Size',
                value: 'M'
              },
              {
                name: 'Color',
                value: 'Black'
              }
            ],
            price: {
              amount: '29.99',
              currencyCode: 'USD'
            }
          }
        }
      ]
    },
    featuredImage: {
      url: 'http://127.0.0.1:8000/public/%D1%88%D1%82%D0%B0%D0%BD%D1%86%D1%8B.jpeg',
      altText: 'Sample T-Shirt',
      width: 800,
      height: 800
    },
    images: {
      edges: [
        {
          node: {
            url: 'http://127.0.0.1:8000/public/%D1%88%D1%82%D0%B0%D0%BD%D1%86%D1%8B.jpeg',
            altText: 'Sample T-Shirt Front',
            width: 800,
            height: 800
          }
        },
        {
          node: {
            url: 'http://127.0.0.1:8000/public/%D1%88%D1%82%D0%B0%D0%BD%D1%86%D1%8B.jpeg',
            altText: 'Sample T-Shirt Back',
            width: 800,
            height: 800
          }
        }
      ]
    },
    seo: {
      title: 'Sample T-Shirt',
      description: 'A comfortable and stylish t-shirt made from 100% cotton.'
    },
    tags: ['t-shirt', 'clothing', 'fashion'],
    updatedAt: new Date().toISOString()
  },
  //{
  // "title": "dinner",
  // "description": "Establish a against tell explain technology assume compare.",
  // "descriptionHtml": "<p>Rise fall case turn record owner look.</p>",
  // "handle": "short",
  // "id": 4977,
  // "available_for_sale": true,
  // "priceRange": {
  //   "minVariantPrice": {
  //     "amount": "50.00",
  //     "currencyCode": "USD"
  //   },
  //   "maxVariantPrice": {
  //     "amount": "500.00",
  //     "currencyCode": "USD"
  //   }
  // },
  // "variants": [
  //   {
  //     "id": "variant-S-Red",
  //     "available_for_sale": true,
  //     "selectedOptions": [
  //       {
  //         "name": "Size",
  //         "value": "S"
  //       },
  //       {
  //         "name": "Color",
  //         "value": "Red"
  //       }
  //     ],
  //     "price": {
  //       "amount": "456",
  //       "currencyCode": "USD"
  //     }
  //   },
  //   {
  //     "id": "variant-S-Blue",
  //     "available_for_sale": true,
  //     "selectedOptions": [
  //       {
  //         "name": "Size",
  //         "value": "S"
  //       },
  //       {
  //         "name": "Color",
  //         "value": "Blue"
  //       }
  //     ],
  //     "price": {
  //       "amount": "200",
  //       "currencyCode": "USD"
  //     }
  //   },
  //   {
  //     "id": "variant-S-Green",
  //     "available_for_sale": true,
  //     "selectedOptions": [
  //       {
  //         "name": "Size",
  //         "value": "S"
  //       },
  //       {
  //         "name": "Color",
  //         "value": "Green"
  //       }
  //     ],
  //     "price": {
  //       "amount": "296",
  //       "currencyCode": "USD"
  //     }
  //   },
  //   {
  //     "id": "variant-M-Red",
  //     "available_for_sale": true,
  //     "selectedOptions": [
  //       {
  //         "name": "Size",
  //         "value": "M"
  //       },
  //       {
  //         "name": "Color",
  //         "value": "Red"
  //       }
  //     ],
  //     "price": {
  //       "amount": "148",
  //       "currencyCode": "USD"
  //     }
  //   },
  //   {
  //     "id": "variant-M-Blue",
  //     "available_for_sale": true,
  //     "selectedOptions": [
  //       {
  //         "name": "Size",
  //         "value": "M"
  //       },
  //       {
  //         "name": "Color",
  //         "value": "Blue"
  //       }
  //     ],
  //     "price": {
  //       "amount": "417",
  //       "currencyCode": "USD"
  //     }
  //   },
  //   {
  //     "id": "variant-M-Green",
  //     "available_for_sale": true,
  //     "selectedOptions": [
  //       {
  //         "name": "Size",
  //         "value": "M"
  //       },
  //       {
  //         "name": "Color",
  //         "value": "Green"
  //       }
  //     ],
  //     "price": {
  //       "amount": "400",
  //       "currencyCode": "USD"
  //     }
  //   },
  //   {
  //     "id": "variant-L-Red",
  //     "available_for_sale": true,
  //     "selectedOptions": [
  //       {
  //         "name": "Size",
  //         "value": "L"
  //       },
  //       {
  //         "name": "Color",
  //         "value": "Red"
  //       }
  //     ],
  //     "price": {
  //       "amount": "317",
  //       "currencyCode": "USD"
  //     }
  //   },
  //   {
  //     "id": "variant-L-Blue",
  //     "available_for_sale": true,
  //     "selectedOptions": [
  //       {
  //         "name": "Size",
  //         "value": "L"
  //       },
  //       {
  //         "name": "Color",
  //         "value": "Blue"
  //       }
  //     ],
  //     "price": {
  //       "amount": "256",
  //       "currencyCode": "USD"
  //     }
  //   },
  //   {
  //     "id": "variant-L-Green",
  //     "available_for_sale": true,
  //     "selectedOptions": [
  //       {
  //         "name": "Size",
  //         "value": "L"
  //       },
  //       {
  //         "name": "Color",
  //         "value": "Green"
  //       }
  //     ],
  //     "price": {
  //       "amount": "217",
  //       "currencyCode": "USD"
  //     }
  //   },
  //   {
  //     "id": "variant-XL-Red",
  //     "available_for_sale": true,
  //     "selectedOptions": [
  //       {
  //         "name": "Size",
  //         "value": "XL"
  //       },
  //       {
  //         "name": "Color",
  //         "value": "Red"
  //       }
  //     ],
  //     "price": {
  //       "amount": "308",
  //       "currencyCode": "USD"
  //     }
  //   },
  //   {
  //     "id": "variant-XL-Blue",
  //     "available_for_sale": true,
  //     "selectedOptions": [
  //       {
  //         "name": "Size",
  //         "value": "XL"
  //       },
  //       {
  //         "name": "Color",
  //         "value": "Blue"
  //       }
  //     ],
  //     "price": {
  //       "amount": "260",
  //       "currencyCode": "USD"
  //     }
  //   },
  //   {
  //     "id": "variant-XL-Green",
  //     "available_for_sale": true,
  //     "selectedOptions": [
  //       {
  //         "name": "Size",
  //         "value": "XL"
  //       },
  //       {
  //         "name": "Color",
  //         "value": "Green"
  //       }
  //     ],
  //     "price": {
  //       "amount": "204",
  //       "currencyCode": "USD"
  //     }
  //   }
  // ],
  // "featured_image": {
  //   "url": "https://picsum.photos/640/480",
  //   "altText": "Product Image",
  //   "width": 640,
  //   "height": 480
  // },
  // "images": [
  //   {
  //     "url": "https://picsum.photos/640/480",
  //     "altText": "Product Image",
  //     "width": 640,
  //     "height": 480
  //   }
  // ],
  // "seo": {
  //   "title": "water",
  //   "description": "Can real beat brother civil draw conference because official cold personal."
  // },
  // "tags": [
  //   "fashion",
  //   "clothing",
  //   "summer"
  // ],
  // "updatedAt": "2025-04-30T09:31:03.420562",
  // "rating": 0,
  // "category_id": 3944
  {
    id: 'product-2',
    handle: 'sample-hoodie',
    availableForSale: true,
    title: 'Sample Hoodie',
    description: 'A warm and cozy hoodie perfect for cold weather.',
    descriptionHtml: '<p>A warm and cozy hoodie perfect for cold weather.</p>',
    options: [
      {
        id: 'option-1',
        name: 'Size',
        values: ['S', 'M', 'L', 'XL']
      },
      {
        id: 'option-2',
        name: 'Color',
        values: ['Gray', 'Black', 'Navy']
      }
    ],
    priceRange: {
      maxVariantPrice: {
        amount: '59.99',
        currencyCode: 'USD'
      },
      minVariantPrice: {
        amount: '59.99',
        currencyCode: 'USD'
      }
    },
    variants: {
      edges: [
        {
          node: {
            id: 'variant-2',
            availableForSale: true,
            selectedOptions: [
              {
                name: 'Size',
                value: 'L'
              },
              {
                name: 'Color',
                value: 'Gray'
              }
            ],
            price: {
              amount: '59.99',
              currencyCode: 'USD'
            }
          }
        }
      ]
    },
    featuredImage: {
      url: 'https://picsum.photos/seed/product2/800/800',
      altText: 'Sample Hoodie',
      width: 800,
      height: 800
    },
    images: {
      edges: [
        {
          node: {
            url: 'https://picsum.photos/seed/product2/800/800',
            altText: 'Sample Hoodie Front',
            width: 800,
            height: 800
          }
        },
        {
          node: {
            url: 'https://picsum.photos/seed/product3/800/800',
            altText: 'Sample Hoodie Back',
            width: 800,
            height: 800
          }
        }
      ]
    },
    seo: {
      title: 'Sample Hoodie',
      description: 'A warm and cozy hoodie perfect for cold weather.'
    },
    tags: ['hoodie', 'clothing', 'fashion'],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'product-3',
    handle: 'sample-jeans',
    availableForSale: true,
    title: 'Sample Jeans',
    description: 'Classic denim jeans with a comfortable fit.',
    descriptionHtml: '<p>Classic denim jeans with a comfortable fit.</p>',
    options: [
      {
        id: 'option-1',
        name: 'Size',
        values: ['30', '32', '34', '36']
      },
      {
        id: 'option-2',
        name: 'Style',
        values: ['Slim', 'Regular', 'Relaxed']
      }
    ],
    priceRange: {
      maxVariantPrice: {
        amount: '79.99',
        currencyCode: 'USD'
      },
      minVariantPrice: {
        amount: '79.99',
        currencyCode: 'USD'
      }
    },
    variants: {
      edges: [
        {
          node: {
            id: 'variant-3',
            availableForSale: true,
            selectedOptions: [
              {
                name: 'Size',
                value: '32'
              },
              {
                name: 'Style',
                value: 'Slim'
              }
            ],
            price: {
              amount: '79.99',
              currencyCode: 'USD'
            }
          }
        }
      ]
    },
    featuredImage: {
      url: 'https://picsum.photos/seed/product4/800/800',
      altText: 'Sample Jeans',
      width: 800,
      height: 800
    },
    images: {
      edges: [
        {
          node: {
            url: 'https://picsum.photos/seed/product4/800/800',
            altText: 'Sample Jeans Front',
            width: 800,
            height: 800
          }
        },
        {
          node: {
            url: 'https://picsum.photos/seed/product5/800/800',
            altText: 'Sample Jeans Back',
            width: 800,
            height: 800
          }
        }
      ]
    },
    seo: {
      title: 'Sample Jeans',
      description: 'Classic denim jeans with a comfortable fit.'
    },
    tags: ['jeans', 'denim', 'clothing', 'fashion'],
    updatedAt: new Date().toISOString()
  }
];

export const mockCollections = [
  {
    id: 'collection-1',
    handle: 'clothing',
    title: 'Clothing',
    description: 'Our latest clothing collection',
    seo: {
      title: 'Clothing Collection',
      description: 'Our latest clothing collection featuring t-shirts, hoodies, and more.'
    },
    path: '/search/clothing',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'collection-2',
    handle: 'accessories',
    title: 'Accessories',
    description: 'Complete your look with our accessories',
    seo: {
      title: 'Accessories Collection',
      description: 'Our accessories collection featuring hats, bags, and more.'
    },
    path: '/search/accessories',
    updatedAt: new Date().toISOString()
  }
];

export const mockCart = {
  id: 'mock-cart-id',
  checkoutUrl: '#',
  cost: {
    subtotalAmount: {
      amount: '0',
      currencyCode: 'USD'
    },
    totalAmount: {
      amount: '0',
      currencyCode: 'USD'
    },
    totalTaxAmount: {
      amount: '0',
      currencyCode: 'USD'
    }
  },
  lines: [
    {
      id: 'line-1',
      quantity: 1,
      cost: {
        totalAmount: {
          amount: '29.99',
          currencyCode: 'USD'
        }
      },
      merchandise: {
        id: 'variant-1',
        title: 'M / Black',
        product: {
          id: 'product-1',
          title: 'Sample T-Shirt',
          handle: 'sample-t-shirt',
          featuredImage: {
            url: 'https://picsum.photos/seed/picsum/800/800',
            altText: 'Sample T-Shirt'
          }
        },
        selectedOptions: [
          {
            name: 'Size',
            value: 'M'
          },
          {
            name: 'Color',
            value: 'Black'
          }
        ]
      }
    },
    {
      id: 'line-2',
      quantity: 1,
      cost: {
        totalAmount: {
          amount: '59.99',
          currencyCode: 'USD'
        }
      },
      merchandise: {
        id: 'variant-2',
        title: 'L / Gray',
        product: {
          id: 'product-2',
          title: 'Sample Hoodie',
          handle: 'sample-hoodie',
          featuredImage: {
            url: 'https://picsum.photos/seed/product2/800/800',
            altText: 'Sample Hoodie'
          }
        },
        selectedOptions: [
          {
            name: 'Size',
            value: 'L'
          },
          {
            name: 'Color',
            value: 'Gray'
          }
        ]
      }
    }
  ],
  totalQuantity: 2
};
//----------------------------------------------------------------------
// export const mockCart = {
//     id: 'mock-cart-id',
//     items: [],
//     total: 0
//   };
//----------------------------------------------------------------------

export const mockMenu = {
  id: 'mock-menu',
  items: [
    {
      title: 'Home',
      url: '/'
    },
    {
      title: 'Clothing',
      url: '/search/clothing'
    },
    {
      title: 'Accessories',
      url: '/search/accessories'
    },
    {
      title: 'About',
      url: '/about'
    }
  ]
};

export const mockPage = {
  id: 'page-1',
  title: 'About',
  handle: 'about',
  body: 'Welcome to our store!',
  seo: {
    title: 'About Us',
    description: 'Learn more about our company and our mission.'
  },
  updatedAt: new Date().toISOString()
};