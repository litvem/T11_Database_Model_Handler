/**
 * This method will make sure that the incoming booking's date is later than the
 * the current date, to prevent users from booking appointments in the past
 * @param {Object} incomingBooking The booking of which the date need to be validated
 * @returns True or false
 */
async function validateThatDateIsInFuture(incomingBooking) {
  let incomingDate = new Date(incomingBooking.date);
  let currentDate = new Date();

  if (incomingDate.getFullYear() > currentDate.getFullYear()) {
    return true;
  } else if (incomingDate.getFullYear() == currentDate.getFullYear()) {
    if (incomingDate.getMonth() > currentDate.getMonth()) {
      return true;
    } else if (incomingDate.getMonth() == currentDate.getMonth()) {
      if (incomingDate.getDate() > currentDate.getDate()) {
        return true;
      } else {
        return false;
      }
    }
  } else {
    return false;
  }
}
