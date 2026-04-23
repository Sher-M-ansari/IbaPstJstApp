import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

const database_name = "IbaPstJst.db";

export interface TopicPerformance {
  id: number;
  topic: string;
  subject: string;
  correctCount: number;
  totalCount: number;
}

export interface TopicDelta {
  topic: string;
  correctDelta: number;
  totalDelta: number;
}

export const getDBConnection = async () => {
  const db = await SQLite.openDatabase({ name: database_name, location: 'default' });
  await createTables(db);
  return db;
};

export const createTables = async (db: SQLite.SQLiteDatabase) => {
  const query = `CREATE TABLE IF NOT EXISTS TestHistory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT,
    score INTEGER,
    totalQuestions INTEGER,
    correctAnswers INTEGER,
    incorrectAnswers INTEGER,
    accuracy REAL,
    timeTaken INTEGER,
    date TEXT
  );`;

  const topicQuery = `CREATE TABLE IF NOT EXISTS TopicPerformance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic TEXT,
    subject TEXT,
    correctCount INTEGER DEFAULT 0,
    totalCount INTEGER DEFAULT 0
  );`;

  await db.executeSql(query);
  await db.executeSql(topicQuery);
  await db.executeSql(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_topic_subject_unique ON TopicPerformance(topic, subject);`
  );
};

export const saveTestResult = async (db: SQLite.SQLiteDatabase, result: any) => {
  const insertQuery = `INSERT INTO TestHistory (subject, score, totalQuestions, correctAnswers, incorrectAnswers, accuracy, timeTaken, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [
    result.subject,
    result.score,
    result.totalQuestions,
    result.correctAnswers,
    result.incorrectAnswers,
    result.accuracy,
    result.timeTaken,
    new Date().toISOString()
  ];
  return db.executeSql(insertQuery, values);
};

export const updateTopicPerformanceBatch = async (
  db: SQLite.SQLiteDatabase,
  subject: string,
  deltas: TopicDelta[],
): Promise<void> => {
  if (deltas.length === 0) return;
  await db.transaction((tx: SQLite.Transaction) => {
    for (const d of deltas) {
      tx.executeSql(
        `INSERT INTO TopicPerformance (topic, subject, correctCount, totalCount)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(topic, subject) DO UPDATE SET
           correctCount = correctCount + excluded.correctCount,
           totalCount   = totalCount   + excluded.totalCount`,
        [d.topic, subject, d.correctDelta, d.totalDelta],
      );
    }
  });
};

export const getTestHistory = async (db: SQLite.SQLiteDatabase) => {
  const results = await db.executeSql(`SELECT * FROM TestHistory ORDER BY date DESC`);
  let history = [];
  for (let i = 0; i < results[0].rows.length; i++) {
    history.push(results[0].rows.item(i));
  }
  return history;
};

export const getTopicPerformance = async (
  db: SQLite.SQLiteDatabase,
): Promise<TopicPerformance[]> => {
  const results = await db.executeSql(
    `SELECT id, topic, subject, correctCount, totalCount
       FROM TopicPerformance
      WHERE totalCount > 0
      ORDER BY (correctCount * 1.0 / totalCount) ASC, topic ASC`,
  );
  const performance: TopicPerformance[] = [];
  for (let i = 0; i < results[0].rows.length; i++) {
    performance.push(results[0].rows.item(i));
  }
  return performance;
};

export const clearAllData = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  await db.transaction((tx: SQLite.Transaction) => {
    tx.executeSql(`DELETE FROM TestHistory;`);
    tx.executeSql(`DELETE FROM TopicPerformance;`);
    tx.executeSql(`DELETE FROM sqlite_sequence WHERE name IN ('TestHistory','TopicPerformance');`);
  });
};
