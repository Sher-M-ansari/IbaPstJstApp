import type { ReminderStats } from './messages';

type DB = {
  executeSql: (sql: string, params?: any[]) => Promise<any[]>;
};

const toLocalYMD = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const sevenDaysAgoISO = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const computeStreak = (distinctLocalYMDsDesc: string[]): number => {
  if (distinctLocalYMDsDesc.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayYMD = toLocalYMD(today);
  const yesterdayYMD = toLocalYMD(yesterday);

  let cursor: Date;
  if (distinctLocalYMDsDesc[0] === todayYMD) {
    cursor = today;
  } else if (distinctLocalYMDsDesc[0] === yesterdayYMD) {
    cursor = yesterday;
  } else {
    return 0;
  }

  let streak = 0;
  for (const ymd of distinctLocalYMDsDesc) {
    if (ymd === toLocalYMD(cursor)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

export const getReminderStats = async (db: DB): Promise<ReminderStats> => {
  const [totalRes] = await db.executeSql(`SELECT COUNT(*) AS c FROM TestHistory`);
  const totalTests: number = totalRes.rows.item(0)?.c ?? 0;

  const [weekRes] = await db.executeSql(
    `SELECT COUNT(*) AS c FROM TestHistory WHERE date >= ?`,
    [sevenDaysAgoISO()],
  );
  const weekTests: number = weekRes.rows.item(0)?.c ?? 0;

  const [dateRes] = await db.executeSql(
    `SELECT date FROM TestHistory ORDER BY date DESC`,
  );
  const seen = new Set<string>();
  const distinctLocalYMDsDesc: string[] = [];
  for (let i = 0; i < dateRes.rows.length; i++) {
    const iso: string = dateRes.rows.item(i).date;
    if (!iso) continue;
    const ymd = toLocalYMD(new Date(iso));
    if (!seen.has(ymd)) {
      seen.add(ymd);
      distinctLocalYMDsDesc.push(ymd);
    }
  }
  const streak = computeStreak(distinctLocalYMDsDesc);

  return { totalTests, weekTests, streak };
};
