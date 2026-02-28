export const TAB_TRAVEL_BUSINESS_CODE = "vjwzd";
export const TAB_TRAVEL_CHECKOUT_URL = `https://checkout.tab.travel/checkout/${TAB_TRAVEL_BUSINESS_CODE}`;

export const getTabTravelUrl = (params?: { checkin?: string; checkout?: string; guests?: string | number }) => {
  const url = new URL(TAB_TRAVEL_CHECKOUT_URL);
  if (params?.checkin) url.searchParams.set("checkin", params.checkin);
  if (params?.checkout) url.searchParams.set("checkout", params.checkout);
  if (params?.guests) url.searchParams.set("guests", params.guests.toString());
  return url.toString();
};
