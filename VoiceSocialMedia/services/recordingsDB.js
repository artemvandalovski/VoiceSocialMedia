import * as SQLite from 'expo-sqlite';
import Recording from '../models/recording';

const recordingsDB = SQLite.openDatabase('recordings.db');

class RecordingsDB {
  static initDatabase() {
    recordingsDB.transaction((tx) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS recordings (id INTEGER PRIMARY KEY AUTOINCREMENT, uri TEXT, user TEXT);',
        [],
        () => console.log('Table created successfully'),
        (_, error) => console.error('Error creating table:', error)
      );
    });
  }

  static dropDatabase() {
    recordingsDB.transaction((tx) => {
      tx.executeSql(
        'DROP TABLE IF EXISTS recordings;',
        [],
        () => console.log('Table dropped successfully'),
        (_, error) => console.error('Error dropping table:', error)
      );
    });
  }

  static addRecording(uri, user) {
    return new Promise((resolve, reject) => {
      recordingsDB.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO recordings (uri, user) VALUES (?, ?);',
          [uri, user],
          (_, { insertId }) => {
            const recording = new Recording(insertId, uri, user);
            resolve(recording);
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  static getAllRecordings() {
    return new Promise((resolve, reject) => {
      recordingsDB.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM recordings ORDER BY id ASC;',
          [],
          (_, { rows }) => {
            const recordings = rows._array.map((row) => new Recording(row.id, row.uri, row.user));
            resolve(recordings);
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  static deleteRecording(id) {
    return new Promise((resolve, reject) => {
      recordingsDB.transaction((tx) => {
        tx.executeSql(
          'DELETE FROM recordings WHERE id = ?;',
          [id],
          (_, { rowsAffected }) => resolve(rowsAffected > 0),
          (_, error) => reject(error)
        );
      });
    });
  }
}

// RecordingsDB.dropDatabase();
RecordingsDB.initDatabase();

export default RecordingsDB;
