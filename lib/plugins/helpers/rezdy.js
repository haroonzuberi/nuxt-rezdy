import { format, startOfDay, addMonths } from "date-fns";
import { ModalProgrammatic as Modal } from "buefy";
import BookingFlow from "../../components/lib/BookingFlow.vue";
import Checkout from "../../components/lib/Checkout.vue";

const storeModuleExists = ({ state, namespace }) => {
  if (!state || !state[namespace]) {
    console.error(`${namespace} nuxt module error: store not initialized`);
    return false;
  } else {
    return true;
  }
};

export function checkoutProduct({ productCode, session }) {
  Modal.open({
    component: BookingFlow,
    canCancel: false,
    parent: this,
    props: {
      productCode,
      session
    }
  });
}

export function checkout() {
  Modal.open({
    component: Checkout,
    canCancel: true,
    parent: this
  });
}

export const getProducts = async ({ store, namespace, params }) => {
  const products = await store.dispatch(`${namespace}/getProducts`, params)
  return { products }
};

export const getProductByCode = async ({ store, namespace, productCode }) => {
  const products = await store.dispatch(`${namespace}/getProducts`, { productCode: [productCode] })
  return products[productCode]
};

export const getProductTagGroups = ({tags}) => {
  if(!tags) return null
  return tags.reduce((groups, tag) => {
    const [key, value] = tag.split(':')
    groups[key] = [...(groups[key] || []), value]
    return groups
  }, {})
}

export const getSessions = async ({ $axios, params }) => {
  const options = {
    startTimeLocal: format(startOfDay(new Date()), "yyyy-MM-dd HH:mm:ss"),
    endTimeLocal: format(
      startOfDay(addMonths(new Date(), 6)),
      "yyyy-MM-dd HH:mm:ss"
    ),
    ...params
  };

  const fetchSessions = offset => {
    return $axios.$get("/availability", { params: { ...options, offset } });
  };
  const limit = params.limit || 100;
  let offset = params.offset || 0;
  let sessions = await fetchSessions(offset);
  while (sessions.length % limit === 0) {
    offset = offset + limit;
    const more = await fetchSessions(offset);
    sessions = [...sessions, ...more];
  }
  return sessions;
};

export async function getProductPickupLocations({ $axios, productCode}) {
  const { pickupLocations } = await $axios.$post(
    `products/pickups/${productCode}`,
    {
      simple: true
    }
  )
  return { pickupLocations }
}

export function getVoucher({ $axios, voucher }) {
  return $axios.$get(`vouchers/voucher/${voucher}`);
}

export function getQuote({ $axios, items, vouchers }) {
  if (items.every(i => i.quantities && i.quantities.length)) {
    const quote = { items, vouchers };
    return $axios.$post("/bookings/quote", quote);
  }
  return { booking: { totalAmount: 0, totalDue: 0, totalPaid: 0 } };
}

export function cancelBooking({ $axios, orderNumber }) {
  return $axios.$delete(`/bookings/booking/${orderNumber}`);
}

export async function placeOrder({ $axios, state, namespace, booking }) {
  try {
    const response = await $axios.$post('/bookings/booking', booking)
    const { requestStatus } = response
    if (requestStatus.success) return response;
    throw requestStatus.error.errorMessage
  } catch(error) {
    return {error}
  }
}

export async function pay({
  $axios,
  session,
  quantities,
  extras,
  vouchers,
  payments,
  creditCard,
  checkoutOptions
}) {
  if (quantities && quantities.length) {
    const booking = {
      status: 'PROCESSING',
      items: [{ ...session, quantities, extras }],
      vouchers,
      payments
    };

    const token = await createCheckoutToken({ checkoutOptions, creditCard });
    /* const {orderNumber} = (await $axios.$post('/bookings/booking', booking)).booking */
    const orderNumber = "abc123";

    const checkout = await $axios.$post("/checkout/authorize", {
      checkout: {
        merchantOrderId: orderNumber,
        token,
        currency: "EUR",
        total: payments.amount,
        billingAddr: {
          name: "Broc Gailit",
          addrLine1: "4701 SE 24th Ave. Suite 1A",
          city: "Portland",
          state: "Oregon",
          zipCode: "97202",
          country: "USA",
          email: "broc@heavycraft.io",
          phoneNumber: "15035162635"
        }
      }
    });

    const {exception, response} = checkout;

    if(exception) {
      return {
        error: exception
      }
    }

    return {checkout: response, booking: 'test'};

    /* const cancelled = cancelBooking({ $axios, orderNumber })

    return cancelled; */
  }
  return { booking: { totalAmount: 0, totalDue: 0, totalPaid: 0 } };
}

async function createCheckoutToken({ checkoutOptions, creditCard }) {
  if (process.client) {
    const { sellerId, publishableKey, mode } = checkoutOptions;
    // This will vary depending on provider
    const params = {
      ...creditCard,
      sellerId,
      publishableKey
    };
    const { response } = await requestCheckoutToken(params, mode);
    return response.token.token;
  }
  return null;
}

async function requestCheckoutToken(params, mode) {
  return new Promise((resolve, reject) => {
    TCO.loadPubKey(mode || 'production', function() {
      TCO.requestToken(resolve, reject, params);
    });
  });
}
