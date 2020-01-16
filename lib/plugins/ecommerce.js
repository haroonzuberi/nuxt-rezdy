const options = JSON.parse(`<%= JSON.stringify(options) %>`)
const { namespace } = options

export default ({ app, store }, inject) => {
    inject('ecommerce', {
      trackProductView(options) {
        const { $gtm, $fb, $gtag } = app;
        const { product, quantity, list, position } = options;
        if ($gtm) {
          $gtm.pushEvent({
            event: 'RezdyProductView',
            ecommerce: {
              detail: {
                products: [
                  {
                    id: product.productCode,
                    name: product.name,
                    brand: product.supplierName,
                    category: product.productType,
                    price: product.advertisedPrice
                  }
                ]
              }
            }
          });
        }

        if ($gtag) {
            $gtag('event', 'view_item', {
                items: [
                    {
                        id: product.productCode,
                        name: product.name,
                        brand: product.supplierName,
                        category: product.productType,
                        price: product.advertisedPrice,
                        list_position: position || 1,
                        list_name: list || null,
                        quantity: quantity || 1
                    }
                ]
            })
        }
  
        if ($fb) {
          $fb.track('ViewContent');
        }
      },
      trackProductImpression(options) {
        const { $gtm, $fb, $gtag } = app;
        const { product, quantity, position, list } = options;
        if ($gtm) {
          $gtm.pushEvent({
            event: 'RezdyProductImpression',
            ecommerce: {
              impressions: [
                {
                  id: product.productCode,
                  name: product.name,
                  brand: product.supplierName,
                  category: product.productType,
                  price: product.advertisedPrice,
                  position
                }
              ]
            }
          });
        }

        if ($gtag) {
            $gtag('event', 'view_item_list', {
                items: [
                    {
                        id: product.productCode,
                        name: product.name,
                        brand: product.supplierName,
                        category: product.productType,
                        price: product.advertisedPrice,
                        list_position: position || 1,
                        list_name: list || null,
                        quantity: quantity || 1
                    }
                ]
            })
        }
      },
      trackProductClick(options) {
        const { $gtm, $fb, $gtag } = app;
        const { product, position, list, quantity } = options;
        if ($gtm) {
          $gtm.pushEvent({
            event: 'RezdyProductClick',
            ecommerce: {
              click: {
                products: [
                  {
                    id: product.productCode,
                    name: product.name,
                    brand: product.supplierName,
                    category: product.productType,
                    price: product.advertisedPrice,
                    position
                  }
                ]
              }
            }
          });
        }

        if ($gtag) {
            $gtag('event', 'select_content', {
                items: [
                    {
                        id: product.productCode,
                        name: product.name,
                        brand: product.supplierName,
                        category: product.productType,
                        price: product.advertisedPrice,
                        list_position: position || 1,
                        list_name: list || null,
                        quantity: quantity || 1
                    }
                ]
            })
        }
      },
      async trackCheckoutRemove(options) {
        const { $gtm, $fb, $gtag } = app;
        const { item, position, quantity, list } = options;
        const product = await app.$rezdy.getProductByCode(item.productCode);
        if ($gtm) {
          $gtm.pushEvent({
            event: 'RezdyRemoveFromCart',
            ecommerce: {
              remove: {
                products: [
                  {
                    id: item.productCode,
                    name: product.name,
                    brand: product.supplierName,
                    category: product.productType,
                    price: item.quantities.reduce(
                      (acc, quantity) =>
                        acc + quantity.value * quantity.optionPrice,
                      0
                    ),
                    quantity: 1
                  }
                ]
              }
            }
          });
        }

        if ($gtag) {
            $gtag('event', 'remove_from_cart', {
                items: [
                    {
                        id: product.productCode,
                        name: product.name,
                        brand: product.supplierName,
                        category: product.productType,
                        price: product.advertisedPrice,
                        list_position: position || 1,
                        list_name: list || null,
                        quantity: quantity || 1
                    }
                ]
            })
        }
        
      },
      trackCheckoutAdd(options) {
        const { $gtm, $fb, $gtag } = app;
        const { product, position, quantity, list } = options;
        if ($gtm) {
          $gtm.pushEvent({
            event: 'RezdyAddToCart',
            ecommerce: {
              add: {
                products: [
                  {
                    id: product.productCode,
                    name: product.name,
                    brand: product.supplierName,
                    category: product.productType,
                    price: product.advertisedPrice || 0,
                    quantity: 1
                  }
                ]
              }
            }
          });
        }

        if ($gtag) {
            $gtag('event', 'add_to_cart', {
                items: [
                    {
                        id: product.productCode,
                        name: product.name,
                        brand: product.supplierName,
                        category: product.productType,
                        price: product.advertisedPrice,
                        list_position: position || 1,
                        list_name: list || null,
                        quantity: quantity || 1
                    }
                ]
            })
        }
      },
      trackCheckoutStep(options) {
        const { $gtm, $fb, $gtag } = app;
        const { step, option } = options;
        const { items } = store.state[namespace].booking.booking;
        if ($gtm) {
          $gtm.pushEvent({
            event: 'RezdyCheckoutStep',
            ecommerce: {
              checkout: {
                actionField: {
                  step,
                  option
                },
                products: items.map(async item => {
                  const product = await app.$rezdy.getProductByCode(item.productCode)
                  return {
                    id: item.productCode,
                    name: product.name,
                    brand: product.supplierName,
                    category: product.productType,
                    price: item.quantities.reduce(
                      (acc, quantity) =>
                        acc + quantity.value * quantity.optionPrice,
                      0
                    ),
                    quantity: item.quantities.reduce(
                      (total, q) => total + q.value,
                      0
                    )
                  };
                })
              }
            }
          });
        }

        if ($gtag) {
            $gtag('event', step === 1 ? 'begin_checkout' : 'checkout_progress', {
                items: items.map(async item => {
                    const product = await app.$rezdy.getProductByCode(item.productCode)
                    const price = item.quantities.reduce((acc, quantity) => acc + quantity.value * quantity.optionPrice, 0)
                    const quantity = item.quantities.reduce((total, q) => total + q.value, 0)
                    return {
                        id: item.productCode,
                        name: product.name,
                        brand: product.supplierName,
                        category: product.productType,
                        list_name: list || null,
                        list_position: position || 1,
                        price,
                        quantity
                    };
                }),
                coupon: [booking.coupon, ...booking.vouchers].join(', ')
            })
        }

        if ($fb && step === 1) {
            $fb.track('InitiateCheckout');
        }
      },
      trackPurchase(options) {
        const { $gtm, $fb, $gtag } = app;
        const { booking } = options;
        const { quote } = store.state[namespace].booking;

        const affiliation = `${namespace} checkout`
        const revenue = 
            typeof quote.totalDue !== 'undefined'
            ? quote.totalDue
            : booking.totalAmount
        const tax =  booking.items.reduce((acc, item) => acc + (item.totalItemTax || 0), 0)
        const coupon = [booking.coupon, ...booking.vouchers].join(', ')

        if ($gtm) {
          $gtm.pushEvent({
            event: 'RezdyPurchase',
            ecommerce: {
              purchase: {
                actionField: {
                  id: booking.orderNumber,
                  affiliation,
                  revenue,
                  tax,
                  coupon
                },
                products: booking.items.map(async item => {
                  const product = await app.$rezdy.getProductByCode(item.productCode);
                  const quantity = item.quantities.reduce(
                    (total, q) => total + q.value,
                    0
                  );
                  const name = product.name;
                  const price = item.amount / quantity;
                  return {
                    id: item.productCode,
                    name,
                    brand: product.supplierName,
                    category: product.productType,
                    price,
                    quantity
                  };
                })
              }
            }
          });
        }
  
        if ($gtag) {
          $gtag('event', 'purchase', {
            transaction_id: booking.orderNumber,
            affiliation: `${namespace} checkout`,
            value: revenue,
            currency: quote.totalCurrency,
            tax,
            shipping: 0,
            items: booking.items.map(async (item, i) => {
                const product = await app.$rezdy.getProductByCode(item.productCode);
                const quantity = item.quantities.reduce(
                  (total, q) => total + q.value,
                  0
                );
                const name = product.name;
                const price = item.amount / quantity;
                return {
                  id: item.productCode,
                  name,
                  brand: product.supplierName,
                  category: product.productType,
                  price,
                  quantity,
                  list_position: i
                };
              })
          });
        }
  
        if ($fb) {
          $fb.track('Purchase', {
            value: booking.totalAmount,
            currency: booking.totalCurrency || 'USD',
            num_items: booking.items.length,
            content_ids: booking.items.map(i => i.productCode)
          });
        }
      }
    });
  };
  