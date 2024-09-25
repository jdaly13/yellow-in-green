import { getClientIPAddress } from "remix-utils";
const Mixpanel = require("mixpanel");
const mixPanelAccount = process.env.MIXPANEL;
export async function mixPanelPageView(request, obj = {}) {
  console.log({ getClientIPAddress });
  let ipAddress = getClientIPAddress(request);
  console.log({ ipAddress });
  if (process.env.NODE_ENV === "production") {
    const mixpanel = Mixpanel.init(mixPanelAccount, { track_pageview: true });
    mixpanel.track("page_viewed", {
      game: obj.currentGame || "no current game",
      page: request.url,
      ip: ipAddress,
    });
  }
}
