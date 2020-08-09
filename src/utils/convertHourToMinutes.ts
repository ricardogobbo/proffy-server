export default function convertHourToMinutes(timeString: string) {
  try {
    const [hour, minutes] = timeString.split(":").map(Number);
    return hour * 60 + minutes;
  } catch (err) {
    return null;
  }
}
