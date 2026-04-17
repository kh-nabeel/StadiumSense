import { analytics } from '../firebase'
import { logEvent } from 'firebase/analytics'

/**
 * Logs a 'map_viewed' event to Firebase Analytics when the map component mounts.
 * @returns {void}
 * @example
 * trackMapViewed();
 */
export const trackMapViewed = () => {
  if (analytics) {
    try {
      logEvent(analytics, 'map_viewed')
    } catch(e) { console.warn('Analytics disabled/failed:', e) }
  }
}

/**
 * Logs a 'gate_navigated' event when a user requests directions to a gate.
 * @param {string} gateName The name of the gate being navigated to.
 * @returns {void}
 * @example
 * trackGateNavigated('Gate A');
 */
export const trackGateNavigated = (gateName: string) => {
  if (analytics) {
    try {
      logEvent(analytics, 'gate_navigated', { gate_name: gateName })
    } catch(e) { console.warn('Analytics disabled/failed:', e) }
  }
}

/**
 * Logs a 'food_preorder' event when a food order form is submitted.
 * @param {string} stallName The name of the concession stand.
 * @param {string} item The name of the food item ordered.
 * @returns {void}
 * @example
 * trackFoodPreorder('Hot Dog Stand', 'Spicy Hot Dog');
 */
export const trackFoodPreorder = (stallName: string, item: string) => {
  if (analytics) {
    try {
      logEvent(analytics, 'food_preorder', { stall_name: stallName, item })
    } catch(e) { console.warn('Analytics disabled/failed:', e) }
  }
}

/**
 * Logs an 'alert_viewed' event when an alert banner is displayed.
 * @param {string} alertType The specific type of alert viewed.
 * @returns {void}
 * @example
 * trackAlertViewed('weather_warning');
 */
export const trackAlertViewed = (alertType: string) => {
  if (analytics) {
    try {
      logEvent(analytics, 'alert_viewed', { alert_type: alertType })
    } catch(e) { console.warn('Analytics disabled/failed:', e) }
  }
}

/**
 * Logs a 'staff_dashboard_opened' event when the staff dashboard is accessed.
 * @returns {void}
 * @example
 * trackStaffDashboardOpened();
 */
export const trackStaffDashboardOpened = () => {
  if (analytics) {
    try {
      logEvent(analytics, 'staff_dashboard_opened')
    } catch(e) { console.warn('Analytics disabled/failed:', e) }
  }
}
