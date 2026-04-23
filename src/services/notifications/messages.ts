import { MESSAGE_ROTATION_LENGTH } from './constants';

export type ReminderStats = {
  totalTests: number;
  weekTests: number;
  streak: number;
};

export type ReminderMessage = {
  title: string;
  body: string;
};

type Template = {
  title: string;
  body: (stats: ReminderStats) => string | null;
};

const templates: Template[] = [
  {
    title: 'Time to Practice!',
    body: () => '🚀 Time to level up! Take a quick test today.',
  },
  {
    title: 'Keep the Momentum',
    body: (s) =>
      s.weekTests > 0
        ? `🔥 ${s.weekTests} test${s.weekTests === 1 ? '' : 's'} this week — keep the momentum going!`
        : null,
  },
  {
    title: 'Daily Habit',
    body: () => 'Consistency is the secret sauce. 💪 Practice today.',
  },
  {
    title: 'Future You',
    body: () => 'Your future self will thank you. Start now. ✨',
  },
  {
    title: 'Milestone Check',
    body: (s) =>
      s.totalTests > 0
        ? `📈 ${s.totalTests} test${s.totalTests === 1 ? '' : 's'} completed. Ready for more?`
        : null,
  },
  {
    title: 'One Test a Day',
    body: () => 'Small steps, big wins. Take one test today. 🎯',
  },
  {
    title: 'Show Up Daily',
    body: () => "🏆 Champions show up daily. Don't break the pattern.",
  },
  {
    title: 'Streak Alert',
    body: (s) =>
      s.streak > 0
        ? `You're ${s.streak} day${s.streak === 1 ? '' : 's'} strong 🔥 Keep the streak alive!`
        : null,
  },
  {
    title: 'Invest in Yourself',
    body: () => 'Knowledge compounds. ⚡ Invest 10 minutes today.',
  },
  {
    title: 'One Step Closer',
    body: () => 'One test = one step closer 🎓 to your goal!',
  },
];

const fallbackBodies: string[] = [
  '🚀 Time to level up! Take a quick test today.',
  'Consistency is the secret sauce. 💪 Practice today.',
  'Your future self will thank you. Start now. ✨',
  'Small steps, big wins. Take one test today. 🎯',
  "🏆 Champions show up daily. Don't break the pattern.",
  'Knowledge compounds. ⚡ Invest 10 minutes today.',
  'One test = one step closer 🎓 to your goal!',
];

export const renderMessage = (index: number, stats: ReminderStats): ReminderMessage => {
  const safeIndex = ((index % MESSAGE_ROTATION_LENGTH) + MESSAGE_ROTATION_LENGTH) % MESSAGE_ROTATION_LENGTH;
  const template = templates[safeIndex];
  const body = template.body(stats);
  if (body !== null) {
    return { title: template.title, body };
  }
  const fallback = fallbackBodies[safeIndex % fallbackBodies.length];
  return { title: template.title, body: fallback };
};
