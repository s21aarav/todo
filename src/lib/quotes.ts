const QUOTES = [
  "Reach for the stars.",
  "Shoot for the moon. Even if you miss, you'll land among the stars.",
  "Your time is limited, so don't waste it.",
  "The secret of getting ahead is getting started.",
  "Done is better than perfect.",
  "Focus on being productive instead of busy.",
  "The stars are the apex of what we can reach.",
  "A year from now you may wish you had started today.",
  "Small steps every day.",
  "Make each day your masterpiece.",
  "Action is the foundational key to all success.",
  "Stars don't struggle to shine.",
  "Command your day.",
  "Do what you can, with what you have, where you are.",
  "Success is the sum of small efforts."
];

export function getQuoteOfDay(): string {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return QUOTES[seed % QUOTES.length];
}
