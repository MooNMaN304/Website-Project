export const mockProducts = [
  {
    id: 'product-1',
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
      url: 'https://picsum.photos/seed/picsum/800/800',
      altText: 'Sample T-Shirt',
      width: 800,
      height: 800
    },
    images: {
      edges: [
        {
          node: {
            url: 'https://picsum.photos/seed/picsum/800/800',
            altText: 'Sample T-Shirt Front',
            width: 800,
            height: 800
          }
        },
        {
          node: {
            url: 'https://picsum.photos/seed/product1/800/800',
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