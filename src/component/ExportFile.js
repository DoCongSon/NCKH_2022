import { Button } from 'antd';
import React from 'react';
import { CSVLink } from 'react-csv';
import { useState, useEffect } from 'react';
import firebaseDb, { databaseKeys, getSnapshotList } from '../util/firebaseDb';
import days from './days';

function ExportFile({ data, fileName, dataHistory }) {
  const [history, setHistory] = useState([]);
  const [dataExcel, setDataExcel] = useState([]);
  const [banExam, setBanExam] = useState([]);

  const getHistory = (student) => {
    if (!student.fingerId) {
      return {};
    }
    const resolve = {};
    firebaseDb
      .ref(databaseKeys.HISTORY + '/' + student.fingerId)
      .on('value', (snapshot) => {
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
  }, [data, dataHistory]);

  useEffect(() => {
    if (history.length > 0) {
      setTimeout(() => {
        const dataExcel1 = [
          [
            'Họ và tên',
            'Lớp',
            'Mã sinh viên',
            'Số điện thoại',
            'Email',
            ...days,
          ],
        ];
        history.forEach((historyElement) => {
          const ktdiemdanh =
            historyElement.list.map((element) => {
              let resolve = '';
              if (element.diemdanh === 1) {
                resolve = 'Có';
              } else if (element.diemdanh === 0) {
                resolve = 'Vắng';
              }
              return resolve;
            }) ?? [];
          const data = [
            historyElement.student.name,
            historyElement.student.classname,
            historyElement.student.code,
            historyElement.student.phone.toString(),
            historyElement.student.email,
            ...ktdiemdanh,
          ];
          dataExcel1.push(data);
        });
        setDataExcel(dataExcel1);
      }, 1000);
    }
  }, [history]);

  useEffect(() => {
    if (history.length > 0) {
      setTimeout(() => {
        const banExamArr = history.map((element) => {
          let isBan = 0;
          let soNgayNghi = 0;
          element.list.forEach((e) => {
            if (e.diemdanh === 0) {
              soNgayNghi++;
            }
          });
          if (soNgayNghi === Number.parseInt(days.length * 0.25)) {
            isBan = 1;
          }
          return {
            isBan: isBan,
            fingerId: element.student.fingerId,
          };
        });
        setBanExam(banExamArr);
      }, 1000);
    }
  }, [history]);

  useEffect(() => {
    banExam.forEach((e) => {
      const banExamRef = firebaseDb.ref(
        databaseKeys.STUDENTS + '/' + e.fingerId + '/isBan'
      );
      banExamRef.set(e.isBan);
    });
  }, [banExam]);

  // console.log('data:');
  // console.log(dataExcel);
  // console.log(history);
  // console.log(banExam);

  return (
    <Button type='primary' shape='round' size='large'>
      <CSVLink data={dataExcel} filename={fileName}>
        Xuất file điểm danh
      </CSVLink>
    </Button>
  );
}

export default ExportFile;
