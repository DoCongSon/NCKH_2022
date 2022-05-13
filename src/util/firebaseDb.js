import firebase from "firebase/app";
import "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCBWQ-nql-9aUbuLeaT63O1mf1RbSke6K4",
  authDomain: "iot-app-9f0b2.firebaseapp.com",
  databaseURL:
    "https://iot-app-9f0b2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "iot-app-9f0b2",
  storageBucket: "iot-app-9f0b2.appspot.com",
  messagingSenderId: "853964857953",
  appId: "1:853964857953:web:efde00241c89947fc4c020",
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

const firebaseDb = firebaseApp.database();

export const databaseKeys = {
  STUDENTS: "students",
  HISTORY: "history",
  DANGKI: "dangki",
  SISO: "siso",
  DIEMDANH: "diemdanh",
  BANEXAM: "banexam",
};

export default firebaseDb;

export const getSnapshotList = (snapshot) => {
  const val = snapshot.val() || {};

  return Object.keys(val).reduce(
    (memo, current) =>
      memo.concat({
        ...val[current],
        key: current,
      }),
    []
  );
};
