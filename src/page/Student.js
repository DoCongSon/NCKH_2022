import {
  Layout,
  Table,
  Button,
  Space,
  Modal,
  notification,
  Typography,
  Tooltip,
} from "antd";
import {
  CloseOutlined,
  EditOutlined,
  FileSearchOutlined,
  PlusOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useCallback, useEffect, useState } from "react";
import StudentForm from "../component/StudentForm";
import firebaseDb, { databaseKeys, getSnapshotList } from "../util/firebaseDb";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { format } from "date-fns";

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

  useEffect(() => {
    firebaseDb.ref(databaseKeys.STUDENTS).on("value", (snapshot) => {
      setStudents(getSnapshotList(snapshot));
    });
  }, []);

  const handleClose = () => {
    setVisible(false);
    setStudent(undefined);
    setLoading(false);
  };

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
    handleClose();
    notification.success({
      message: "Thêm sinh viên thành công",
      description: `${params.name} - ${params.code} - Vân tay ${params.fingerId}`,
    });
  };

  const handleDelete = (record) => {
    confirm({
      title: `Bạn muốn xoá sinh viên?`,
      icon: <ExclamationCircleOutlined />,
      content: `${record.name} - ${record.code}`,
      onOk() {
        firebaseDb.ref(databaseKeys.STUDENTS + "/" + record.key).remove();
        firebaseDb.ref(databaseKeys.HISTORY + "/" + record.key).remove();
        notification.error({
          message: "Xoá sinh viên thành công",
          description: `${record.name} - ${record.code} - Vân tay ${record.fingerId}`,
        });
      },
    });
  };

  const handleUpdate = (params) => {
    setLoading(true);
    firebaseDb.ref(databaseKeys.STUDENTS + "/" + params.key).set(params);
    handleClose();
    notification.success({
      message: "Cập nhật sinh viên thành công",
      description: `${params.name} - ${params.code} - Vân tay ${params.fingerId}`,
    });
  };

  const columns = [
    {
      title: "Mã sinh viên",
      dataIndex: "code",
      key: "code",
      // ...getColumnSearchProps("code"),
    },
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "name",
      // ...getColumnSearchProps("name"),
    },
    {
      title: "Lớp",
      dataIndex: "classname",
      key: "classname",
      // ...getColumnSearchProps("classname"),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      // ...getColumnSearchProps("phone"),
    },
    {
      title: "Mã vân tay",
      dataIndex: "fingerId",
      key: "fingerId",
      // ...getColumnSearchProps("fingerId"),
    },
    {
      title: "Hành động",
      dataIndex: "",
      key: "x",
      render: (_, record) => (
        <Space>
          <Tooltip placement="bottom" title="Sửa thông tin sinh viên">
            <Button
              onClick={() => {
                setStudent(record);
                setVisible(true);
              }}
              color="primary"
              type="primary"
              shape="circle"
              icon={<EditOutlined />}
            ></Button>
          </Tooltip>

          <Tooltip placement="bottom" title="Xoá sinh viên">
            <Button
              onClick={() => handleDelete(record)}
              danger
              type="primary"
              shape="circle"
              icon={<CloseOutlined />}
            ></Button>
          </Tooltip>

          <Tooltip placement="bottom" title="Hiện thị lịch sử điểm danh">
            <Button
              onClick={() => {
                firebaseDb
                  .ref(databaseKeys.HISTORY + "/" + record.key)
                  .on("value", (snapshot) => {
                    const list = getSnapshotList(snapshot).reverse();
                    console.log(list);
                    setHistory({
                      student: record,
                      list: list.map(({ date, time, key }) => ({
                        key,
                        date,
                        time,
                        // date: format(new Date(datetime), "dd/MM/yyyy"),
                        // time: format(new Date(datetime), "HH:mm"),
                      })),
                    });
                    setHistoryVisible(true);
                  });
              }}
              color="primary"
              type="primary"
              shape="circle"
              icon={<FileSearchOutlined />}
            ></Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // const addHistory = useCallback(
  //   (fingerId) => {
  //     const selected = students.find(
  //       (s) => Number(s.fingerId) === Number(fingerId)
  //     );
  //     const newHistoryRef = firebaseDb
  //       .ref(databaseKeys.HISTORY + "/" + selected.key)
  //       // .push();
  //     newHistoryRef.set({
  //       datetime: new Date().toISOString(),
  //     });
  //     notification.success({
  //       message: "Có sinh viên vừa điểm danh",
  //       description: `${selected.name} - ${selected.code} - Vân tay ${selected.fingerId}`,
  //     });
  //   },
  //   [students]
  // );

  const testDiemDanh = () => {
    const d = new Date();
    const newHistoryRef = firebaseDb.ref(
      databaseKeys.HISTORY + "/" + students[1].key + "/1"
    );
    // .push();
    newHistoryRef.set({
      // datetime: new Date().toISOString(),
      date: "12/4/2022",
      time: "21:12",
    });
    console.log(students[1].key);
  };

  // useEffect(() => {
  //   window.addHistory = addHistory;
  // }, [addHistory]);

  const historyColumns = [
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Giờ",
      dataIndex: "time",
      key: "time",
    },
  ];
  return (
    <>
      <Content>
        <div className="site-layout-content">
          <div style={{ textAlign: "right", marginBottom: "0.5rem" }}>
            <Button
              type="primary"
              shape="round"
              size="large"
              icon={<UserAddOutlined />}
              onClick={() => setVisible(true)}
            >
              Thêm sinh viên
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={testDiemDanh}
            >
              test điểm danh sinh viên
            </Button>
          </div>
          <Table
            tableLayout="fixed"
            scroll={{ y: 357 }}
            className="table"
            columns={columns}
            dataSource={students}
            pagination="false"
          />
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
        title="Lịch sử điểm danh"
        closable={false}
        footer={[
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              firebaseDb
                .ref(databaseKeys.HISTORY + "/" + history?.student.key)
                .off("value");
              setHistoryVisible(false);
              setHistory({});
            }}
          >
            Đóng
          </Button>,
        ]}
      >
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
