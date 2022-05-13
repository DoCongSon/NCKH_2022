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
    updateSiSo(params.fingerId);

    for (let i = 0; i < days.length; i++) {
      const newHistoryRef = firebaseDb.ref(
        databaseKeys.HISTORY + '/' + params.fingerId + '/' + (i + 1)
      );
      newHistoryRef.set({
        date: days[i],
        time: '00:00',
        diemdanh: "",
      });
      console.log(params.key);
    }

    handleClose();
    notification.success({
      message: 'Thêm sinh viên thành công',
      description: `${params.name} - ${params.code} - Vân tay ${params.fingerId}`,
    });
  };

  const handleDelete = (record) => {
    confirm({
      title: `Bạn muốn xoá sinh viên?`,
      icon: <ExclamationCircleOutlined />,
      content: `${record.name} - ${record.code}`,
      onOk() {
        firebaseDb.ref(databaseKeys.STUDENTS + '/' + record.key).remove();
        firebaseDb.ref(databaseKeys.HISTORY + '/' + record.key).remove();
        notification.error({
          message: 'Xoá sinh viên thành công',
          description: `${record.name} - ${record.code} - Vân tay ${record.fingerId}`,
        });
      },
    });
  };

  const handleUpdate = (params) => {
    setLoading(true);
    firebaseDb.ref(databaseKeys.STUDENTS + '/' + params.key).set(params);
    handleClose();
    notification.success({
      message: 'Cập nhật sinh viên thành công',
      description: `${params.name} - ${params.code} - Vân tay ${params.fingerId}`,
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
        'Kết thúc điểm danh';
    } else
      btnDiemdanh.current.querySelector('span').textContent =
        'Bắt đầu điểm danh';
  };

  const columns = [
    {
      title: 'Mã sinh viên',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Họ và tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Lớp',
      dataIndex: 'classname',
      key: 'classname',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Mã vân tay',
      dataIndex: 'fingerId',
      key: 'fingerId',
    },
    {
      title: 'Hành động',
      dataIndex: '',
      key: 'x',
      render: (_, record) => (
        <Space>
          <Tooltip placement='bottom' title='Sửa thông tin sinh viên'>
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

          <Tooltip placement='bottom' title='Xoá sinh viên'>
            <Button
              onClick={() => handleDelete(record)}
              danger
              type='primary'
              shape='circle'
              icon={<CloseOutlined />}></Button>
          </Tooltip>

          <Tooltip placement='bottom' title='Hiện thị lịch sử điểm danh'>
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
                          resolve = 'Có';
                        } else if (diemdanh === 0) {
                          resolve = 'Vắng';
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
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Giờ',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Điểm danh',
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
              Thêm sinh viên
            </Button>

            <Button
              ref={btnDiemdanh}
              type='primary'
              shape='round'
              size='large'
              style={{ marginLeft: '1rem' }}
              onClick={() => handleDiemDanh(diemdanh.current)}>
              Bắt đầu điểm danh
            </Button>
          </div>
          <Table
            tableLayout='fixed'
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
        title='Lịch sử điểm danh'
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
            Đóng
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
