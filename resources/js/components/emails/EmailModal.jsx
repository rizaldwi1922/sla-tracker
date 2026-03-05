import { useEffect } from "react";
import { Modal, Form, Input, Button, Row, Col, Typography, DatePicker } from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

/**
 * EmailModal — create / edit email record
 * Props: open, record (null=create), buyers, onSave(vals,record), onClose
 */
export default function EmailModal({ open, record, buyers, onSave, onClose }) {
  const [form] = Form.useForm();
  const senderVal = Form.useWatch("sender_email", form);

  const isRegistered = senderVal && buyers.some(
    (b) => b.email?.toLowerCase() === senderVal.toLowerCase() && b.status === "Active"
  );

  useEffect(() => {
    if (!open) return;
    if (record) {
      form.setFieldsValue({
        sender_email:     record.sender_email,
        receiver_email:   record.receiver_email,
        subject:          record.subject,
        received_date:    record.received_date    ? dayjs(record.received_date)    : null,
        due_date:         record.due_date         ? dayjs(record.due_date)         : null,
        first_reply_date: record.first_reply_date ? dayjs(record.first_reply_date) : null,
      });
    } else {
      form.resetFields();
    }
  }, [open, record, form]);

  return (
    <Modal
      title={record ? "Edit Email" : "Capture Email"}
      open={open}
      onCancel={onClose}
      footer={null}
      width={520}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={(v) => onSave(v, record)} style={{ marginTop: 16 }}>

        <Form.Item label="Sender Email" name="sender_email" rules={[{ required: true, type: "email" }]}>
          <Input placeholder="buyer@company.com" size="large" />
        </Form.Item>

        {senderVal && (
          <div style={{ marginTop: -14, marginBottom: 12 }}>
            {isRegistered
              ? <Text style={{ color: "#22c55e", fontSize: 12 }}>✓ Registered buyer email</Text>
              : <Text style={{ color: "#f59e0b", fontSize: 12 }}>⚠ Email not registered in Master Buyer</Text>
            }
          </div>
        )}

        <Form.Item label="Receiver Email" name="receiver_email" rules={[{ required: true, type: "email" }]}>
          <Input placeholder="sales@yourcompany.com" size="large" />
        </Form.Item>

        <Form.Item label="Subject" name="subject" rules={[{ required: true }]}>
          <Input placeholder="Email subject" size="large" />
        </Form.Item>

        <Form.Item label="Date & Time Received" name="received_date" rules={[{ required: true }]}>
          <DatePicker showTime style={{ width: "100%" }} size="large" />
        </Form.Item>

        <Form.Item label="Due Date" name="due_date">
          <DatePicker style={{ width: "100%" }} size="large" />
        </Form.Item>

        <Form.Item label="First Reply Date & Time" name="first_reply_date">
          <DatePicker showTime style={{ width: "100%" }} size="large" />
        </Form.Item>

        <Row gutter={10} style={{ marginTop: 8 }}>
          <Col span={12}><Button block size="large" onClick={onClose} style={{ borderRadius: 10 }}>Cancel</Button></Col>
          <Col span={12}><Button block type="primary" htmlType="submit" size="large" style={{ borderRadius: 10 }}>Save Email</Button></Col>
        </Row>
      </Form>
    </Modal>
  );
}
