const QUOTES = [
  "The secret of getting ahead is getting started.",
  "Do what you can, with what you have.",
  "Small steps every day lead to big results.",
  "Make each day your masterpiece.",
  "Stars don't struggle to shine.",
  "A year from now, you'll wish you had started today.",
  "Done is better than perfect.",
  "Focus on progress, not perfection.",
  "Action is the foundational key to success.",
  "Your future self is counting on you.",
  "Discipline is choosing what you want most.",
  "The best time to start is now.",
  "Success is the sum of small efforts.",
  "Don't count the days — make the days count.",
  "You are what you repeatedly do.",
  "Push yourself. No one else will do it for you.",
  "Great things never come from comfort zones.",
  "Dream big. Start small. Act now.",
  "Every expert was once a beginner.",
  "Consistency beats intensity.",
  "Be so good they can't ignore you.",
  "Productivity is never an accident.",
  "Own your morning. Elevate your life.",
  "Less talk, more action.",
  "Today's effort, tomorrow's reward.",
  "Believe you can and you're halfway there.",
  "Work hard in silence. Let success be your noise.",
  "It always seems impossible until it's done.",
  "The only way to do great work is to love what you do.",
  "Rise. Grind. Shine.",
];

export function getQuoteOfDay(): string {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return QUOTES[seed % QUOTES.length];
}
