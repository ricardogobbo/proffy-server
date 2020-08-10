// A function that converts string HH:MM time to minutes from midnight
// Params: 
//    timeString: a formatted string that contains a time 
// Returns: 
//    The amount of minutes from midnight
// Throws:
//    Exception when timeString does not follow the pattern HH:MM
export default function convertHourToMinutes(timeString: string) {
  try {
    const [hour, minutes] = timeString.split(":").map(Number);
    return hour * 60 + minutes;
  } catch (err) {
    return null;
  }
}
