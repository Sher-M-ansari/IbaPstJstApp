import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

const database_name = "IbaPstJst.db";

export const getDBConnection = async () => {
  return SQLite.openDatabase({ name: database_name, location: 'default' });
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

export const updateTopicPerformance = async (db: SQLite.SQLiteDatabase, topic: string, subject: string, isCorrect: boolean) => {
  const checkQuery = `SELECT * FROM TopicPerformance WHERE topic = ? AND subject = ?`;
  const results = await db.executeSql(checkQuery, [topic, subject]);
  
  if (results[0].rows.length > 0) {
    const updateQuery = isCorrect 
      ? `UPDATE TopicPerformance SET correctCount = correctCount + 1, totalCount = totalCount + 1 WHERE topic = ? AND subject = ?`
      : `UPDATE TopicPerformance SET totalCount = totalCount + 1 WHERE topic = ? AND subject = ?`;
    return db.executeSql(updateQuery, [topic, subject]);
  } else {
    const insertQuery = `INSERT INTO TopicPerformance (topic, subject, correctCount, totalCount) VALUES (?, ?, ?, ?)`;
    return db.executeSql(insertQuery, [topic, subject, isCorrect ? 1 : 0, 1]);
  }
};

export const getTestHistory = async (db: SQLite.SQLiteDatabase) => {
  const results = await db.executeSql(`SELECT * FROM TestHistory ORDER BY date DESC`);
  let history = [];
  for (let i = 0; i < results[0].rows.length; i++) {
    history.push(results[0].rows.item(i));
  }
  return history;
};

export const getTopicPerformance = async (db: SQLite.SQLiteDatabase) => {
  const results = await db.executeSql(`SELECT * FROM TopicPerformance`);
  let performance = [];
  for (let i = 0; i < results[0].rows.length; i++) {
    performance.push(results[0].rows.item(i));
  }
  return performance;
};
