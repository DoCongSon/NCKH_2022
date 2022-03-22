import React, { useEffect } from 'react';
import { Modal, Form, Input, Spin } from 'antd';

const StudentForm = ({ student, visible, onSubmit, onCancel, loading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (student) {
      form.setFieldsValue(student)
    }
  }, [student, form])

  useEffect(() => {
    if (!visible) {
      form.resetFields()
    }
  }, [visible, form])
  
  return (
    <Modal
      visible={visible}
      title={student ? "Sửa thông tin sinh viên" : "Thêm sinh viên"}
      okText={student ? "Sửa" : "Thêm"}
      cancelText="Đóng"
      onCancel={onCancel}
      confirmLoading={loading}
      onOk={() => {
        form
          .validateFields()
          .then(async (values) => {
            await onSubmit(values);
          })
          .catch((info) => {
            console.log('Validate Failed:', info);
          });
      }}
    >
      <Spin tip="Đang chờ sinh viên nhập vân tay" spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          name="form_in_modal"
          initialValues={{
          }}
        >
          <Form.Item
            name="key"
            label="key"
            hidden
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="fingerId"
            label="fingerId"
            hidden
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="code"
            label="Mã sinh viên"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập mã sinh viên!',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập họ tên sinh viên!',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="classname"
            label="Lớp"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập lớp!',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập SĐT!',
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default StudentForm