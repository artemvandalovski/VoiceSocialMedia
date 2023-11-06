import * as SQLite from 'expo-sqlite';
import User from '../models/user';

const usersDB = SQLite.openDatabase('users.db');

class UsersDB {
  static initDatabases() {
    usersDB.transaction((tx) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);',
        [],
        () => console.log('Table created successfully'),
        (_, error) => console.error('Error creating table:', error)
      );
    });

    usersDB.transaction((tx) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS followers (followerId INTEGER, followingId INTEGER, FOREIGN KEY (followerId) REFERENCES users (id), FOREIGN KEY (followingId) REFERENCES users (id));',
        [],
        () => console.log('Followers table created successfully'),
        (_, error) => console.error('Error creating followers table:', error)
      );
    });
  }

  static dropDatabases() {
    usersDB.transaction((tx) => {
      tx.executeSql(
        'DROP TABLE IF EXISTS users;',
        [],
        () => console.log('Table dropped successfully'),
        (_, error) => console.error('Error dropping table:', error)
      );
    });
    usersDB.transaction((tx) => {
      tx.executeSql(
        'DROP TABLE IF EXISTS followers;',
        [],
        () => console.log('Followers table dropped successfully'),
        (_, error) => console.error('Error dropping followers table:', error)
      );
    });
  }

  static addUser(name) {
    return new Promise((resolve, reject) => {
      usersDB.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO users (name) VALUES (?);',
          [name],
          (_, { insertId }) => {
            const user = new User(insertId, name);
            resolve(user);
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  static getAllUsers() {
    return new Promise((resolve, reject) => {
      usersDB.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM users ORDER BY id ASC;',
          [],
          (_, { rows }) => {
            const users = rows._array.map((row) => new User(row.id, row.name));
            resolve(users);
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  static getUserById(id) {
    return new Promise((resolve, reject) => {
      usersDB.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM users WHERE id = ?;',
          [id],
          (_, { rows }) => {
            const user = new User(rows._array[0].id, rows._array[0].name);
            resolve(user);
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  static getUserByName(name) {
    return new Promise((resolve, reject) => {
      usersDB.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM users WHERE name = ?;',
          [name],
          (_, { rows }) => {
            const user = new User(rows._array[0].id, rows._array[0].name);
            resolve(user);
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  static deleteUser(id) {
    return new Promise((resolve, reject) => {
      usersDB.transaction((tx) => {
        tx.executeSql(
          'DELETE FROM users WHERE id = ?;',
          [id],
          (_, { rowsAffected }) => resolve(rowsAffected > 0),
          (_, error) => reject(error)
        );
      });
    });
  }

  static followUser(followerId, followingId) {
    return new Promise((resolve, reject) => {
      usersDB.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO followers (followerId, followingId) VALUES (?, ?);',
          [followerId, followingId],
          (_, { insertId }) => resolve(insertId),
          (_, error) => reject(error)
        );
      });
    });
  }

  static unfollowUser(followerId, followingId) {
    return new Promise((resolve, reject) => {
      usersDB.transaction((tx) => {
        tx.executeSql(
          'DELETE FROM followers WHERE followerId = ? AND followingId = ?;',
          [followerId, followingId],
          (_, { rowsAffected }) => resolve(rowsAffected > 0),
          (_, error) => reject(error)
        );
      });
    });
  }

  static getFollowingById(userId) {
    return new Promise((resolve, reject) => {
      usersDB.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM users WHERE id IN (SELECT followingId FROM followers WHERE followerId = ?);',
          [userId],
          (_, { rows }) => {
            const users = rows._array.map((row) => new User(row.id, row.name));
            resolve(users);
          },
          (_, error) => reject(error)
        );
      });
    });
  }
}

// UsersDB.dropDatabases();
UsersDB.initDatabases();

UsersDB.addUser('Me');

const users = ['Steve', 'John', 'Mary', 'Jane', 'Bob', 'Alice'];
for (let i = 0; i < users.length; i++) {
  UsersDB.addUser(users[i]);
}

UsersDB.followUser(1, 2);
UsersDB.followUser(1, 3);
UsersDB.followUser(1, 4);

export default UsersDB;
