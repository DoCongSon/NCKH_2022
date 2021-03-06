import {
  Layout,
  Table,
  Button,
  Space,
  Modal,
  notification,
  Typography,
  Tooltip,
} from 'antd';
import {
  CloseOutlined,
  EditOutlined,
  FileSearchOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { useEffect, useState, useRef } from 'react';
import StudentForm from '../component/StudentForm';
import firebaseDb, { databaseKeys, getSnapshotList } from '../util/firebaseDb';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import ExportFile from '../component/ExportFile';
import days from '../component/days';

const { Content } = Layout;
const { Title } = Typography;
const { confirm } = Modal;

function Student() {
  const [students, setStudents] = useState([]);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState();
  const [history, setHistory] = useState({});
  const [historyVisible, setHistoryVisible] = useState(false);
  const diemdanh = useRef(false);
  const btnDiemdanh = useRef();

  const updateSiSo = (siSo) => {
    const siSoRef = firebaseDb.ref(databaseKeys.SISO);
    siSoRef.set(siSo);
  };

  useEffect(() => {
    firebaseDb.ref(databaseKeys.STUDENTS).on('value', (snapshot) => {
      setStudents(getSnapshotList(snapshot));
    });
  }, []);

  const handleClose = () => {
    setVisible(false);
    setStudent(undefined);
    setLoading(false);
  };

  console.log(students.length);

  const handleCreate = async (params) => {
    setLoading(true);
    await new Promise((resolve) => {
      setTimeout(() => resolve(), 1000);
      params.fingerId =
        Math.max(
          ...(students?.length > 0
            ? students.map((s) => Number(s.fingerId))
            : [0])
        ) + 1;
    });
    const newStudentRef = firebaseDb.ref(
      `${databaseKeys.STUDENTS}/${params.fingerId}`
    );
    newStudentRef.set(params);
    const dangKiRef = firebaseDb.ref(databaseKeys.DANGKI);
    dangKiRef.set(1);
    const canhBaoRef = firebaseDb.ref(
      `${databaseKeys.STUDENTS}/${params.fingerId}/canhbao`
    );
    canhBaoRef.set(0);
    updateSiSo(params.fingerId);

    for (let i = 0; i < days.length; i++) {
      const newHistoryRef = firebaseDb.ref(
        databaseKeys.HISTORY + '/' + params.fingerId + '/' + (i + 1)
      );
      newHistoryRef.set({
        date: days[i],
        time: '00:00',
        diemdanh: '',
      });
      console.log(params.key);
    }

    handleClose();
    notification.success({
      message: 'Th??m sinh vi??n th??nh c??ng',
      description: `${params.name} - ${params.code} - V??n tay ${params.fingerId}`,
    });
  };

  const handleDelete = (record) => {
    confirm({
      title: `B???n mu???n xo?? sinh vi??n?`,
      icon: <ExclamationCircleOutlined />,
      content: `${record.name} - ${record.code}`,
      onOk() {
        firebaseDb.ref(databaseKeys.STUDENTS + '/' + record.key).remove();
        firebaseDb.ref(databaseKeys.HISTORY + '/' + record.key).remove();
        notification.error({
          message: 'Xo?? sinh vi??n th??nh c??ng',
          description: `${record.name} - ${record.code} - V??n tay ${record.fingerId}`,
        });
      },
    });
  };

  const handleUpdate = (params) => {
    setLoading(true);
    firebaseDb.ref(databaseKeys.STUDENTS + '/' + params.fingerId).set(params);
    handleClose();
    notification.success({
      message: 'C???p nh???t sinh vi??n th??nh c??ng',
      description: `${params.name} - ${params.code} - V??n tay ${params.fingerId}`,
    });
  };

  const handleDiemDanh = () => {
    const diemdanhRef = firebaseDb.ref(databaseKeys.DIEMDANH);
    if (diemdanh.current) {
      diemdanhRef.set('0');
    } else diemdanhRef.set('1');
    diemdanh.current = !diemdanh.current;
    if (diemdanh.current) {
      btnDiemdanh.current.querySelector('span').textContent =
        'K???t th??c ??i???m danh';
    } else
      btnDiemdanh.current.querySelector('span').textContent =
        'B???t ?????u ??i???m danh';
  };

  const columns = [
    {
      title: 'M?? sinh vi??n',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'H??? v?? t??n',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'L???p',
      dataIndex: 'classname',
      key: 'classname',
    },
    {
      title: 'S??? ??i???n tho???i',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'ID',
      dataIndex: 'fingerId',
      key: 'fingerId',
    },
    {
      title: 'H??nh ?????ng',
      dataIndex: '',
      key: 'x',
      render: (_, record) => (
        <Space>
          <Tooltip placement='bottom' title='S???a th??ng tin sinh vi??n'>
            <Button
              onClick={() => {
                setStudent(record);
                setVisible(true);
              }}
              color='primary'
              type='primary'
              shape='circle'
              icon={<EditOutlined />}></Button>
          </Tooltip>

          <Tooltip placement='bottom' title='Xo?? sinh vi??n'>
            <Button
              onClick={() => handleDelete(record)}
              danger
              type='primary'
              shape='circle'
              icon={<CloseOutlined />}></Button>
          </Tooltip>

          <Tooltip placement='bottom' title='Hi???n th??? l???ch s??? ??i???m danh'>
            <Button
              onClick={() => {
                firebaseDb
                  .ref(databaseKeys.HISTORY + '/' + record.key)
                  .on('value', (snapshot) => {
                    const list = getSnapshotList(snapshot).reverse();
                    list.sort((a, b) => a.key - b.key);
                    setHistory({
                      student: record,
                      list: list.map(({ date, time, key, diemdanh }) => {
                        let resolve = '';
                        if (diemdanh === 1) {
                          resolve = 'C??';
                        } else if (diemdanh === 0) {
                          resolve = 'V???ng';
                        }
                        return {
                          key,
                          date,
                          time,
                          diemdanh: resolve,
                        };
                      }),
                    });
                    setHistoryVisible(true);
                  });
              }}
              color='primary'
              type='primary'
              shape='circle'
              icon={<FileSearchOutlined />}></Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const historyColumns = [
    {
      title: 'Ng??y',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Gi???',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: '??i???m danh',
      dataIndex: 'diemdanh',
      key: 'diemdanh',
    },
  ];
  return (
    <>
      <Content>
        <div className='site-layout-content'>
          <div
            style={{
              textAlign: 'right',
              marginBottom: '0.5rem',
            }}>
            <Button
              type='primary'
              shape='round'
              size='large'
              icon={<UserAddOutlined />}
              onClick={() => setVisible(true)}>
              Th??m sinh vi??n
            </Button>

            <Button
              ref={btnDiemdanh}
              type='primary'
              shape='round'
              size='large'
              style={{ marginLeft: '1rem' }}
              onClick={() => handleDiemDanh(diemdanh.current)}>
              B???t ?????u ??i???m danh
            </Button>
          </div>
          <Table
            tableLayout='auto'
            scroll={{ y: 357 }}
            className='table'
            columns={columns}
            dataSource={students}
            pagination='false'
          />
          <div style={{ textAlign: 'right', marginBottom: '0.5rem' }}>
            <ExportFile
              data={students}
              dataHistory={history}
              fileName='sinhvien.csv'
            />
          </div>
        </div>
      </Content>
      <StudentForm
        student={student}
        visible={visible}
        onSubmit={student ? handleUpdate : handleCreate}
        onCancel={handleClose}
        loading={loading}
      />
      <Modal
        visible={historyVisible}
        title='L???ch s??? ??i???m danh'
        closable={false}
        footer={[
          <Button
            key='submit'
            type='primary'
            onClick={() => {
              firebaseDb
                .ref(databaseKeys.HISTORY + '/' + history?.student.key)
                .off('value');
              setHistoryVisible(false);
              setHistory({});
            }}>
            ????ng
          </Button>,
        ]}>
        <>
          <Title level={5}>
            {history?.student?.name} - {history?.student?.code}
          </Title>
          <Table
            columns={historyColumns}
            dataSource={history?.list || []}
            scroll={{ y: 240 }}
          />
        </>
      </Modal>
    </>
  );
}

export default Student;
