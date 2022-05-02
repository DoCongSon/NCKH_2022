import { Button } from "antd";
import React from "react";
import { CSVLink } from "react-csv";
import { useState, useEffect } from "react";
import firebaseDb, { databaseKeys, getSnapshotList } from "../util/firebaseDb";
import days from "./days";

function ExportFile({ data, fileName }) {
  const [history, setHistory] = useState([]);
  const [dataTest, setDataTest] = useState([]);

  const getHistory = (student) => {
    if (!student.fingerId) {
      return {};
    }
    const resolve = {};
    firebaseDb
      .ref(databaseKeys.HISTORY + "/" + student.fingerId)
      .on("value", (snapshot) => {
        const list = getSnapshotList(snapshot).reverse();
        resolve.student = student;
        resolve.list = list.map(({ date, time, key, diemdanh }) => ({
          key,
          date,
          time,
          diemdanh,
        }));
        resolve.list.sort((a, b) => a.key - b.key);
      });
    return resolve;
  };

  useEffect(() => {
    const listHistory = [];
    data.forEach((student) => {
      listHistory.push(getHistory(student));
    });
    setHistory(listHistory);
  }, [data]);

  useEffect(() => {
    if (history.length > 0) {
      setTimeout(() => {
        const dataTest1 = [["name", "classname", "code", "phone", ...days]];
        history.forEach((historyElement) => {
          const ktdiemdanh =
            historyElement.list.map((element) => element.diemdanh) ?? [];
          const data = [
            historyElement.student.name,
            historyElement.student.classname,
            historyElement.student.code,
            historyElement.student.phone.toString(),
            ...ktdiemdanh,
          ];
          dataTest1.push(data);
        });
        console.log(dataTest1);
        setDataTest(dataTest1);
      }, 1000);
    }
  }, [history]);

  console.log("data:");
  console.log(dataTest);

  return (
    <Button type="primary" shape="round" size="large">
      <CSVLink data={dataTest} filename={fileName}>
        Xuất file điểm danh
      </CSVLink>
    </Button>
  );
}

export default ExportFile;
