import { useEffect } from "react";
import { Modal, Form, Input, Select, Button, Row, Col } from "antd";

const { Option } = Select;

export default function BuyerModal({
    open,
    record,
    salesList,
    onSave,
    onClose,
}) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (!open) return;
        if (record) {
            form.setFieldsValue({
                email: record.email,
                company_name: record.company_name,
                pic_name: record.pic_name,
                assigned_sales: record.assigned_sales,
                status: record.status,
            });
        } else {
            form.resetFields();
            form.setFieldsValue({ status: "Active" });
        }
    }, [open, record, form]);

    return (
        <Modal
            title={record ? "Edit Buyer" : "Register Buyer Email"}
            open={open}
            onCancel={onClose}
            footer={null}
            width={480}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={(v) => onSave(v, record)}
                style={{ marginTop: 16 }}
            >
                <Form.Item
                    label="Buyer Email Address"
                    name="email"
                    rules={[{ required: true, type: "email" }]}
                >
                    <Input placeholder="buyer@company.com" size="large" />
                </Form.Item>
                <Form.Item
                    label="Company Name"
                    name="company_name"
                    rules={[{ required: true }]}
                >
                    <Input placeholder="PT Example Indonesia" size="large" />
                </Form.Item>
                <Form.Item
                    label="PIC Name"
                    name="pic_name"
                    rules={[{ required: true }]}
                >
                    <Input placeholder="John Doe" size="large" />
                </Form.Item>
                <Form.Item
                    label="Assigned Sales"
                    name="assigned_sales"
                    rules={[{ required: true }]}
                >
                    <Select size="large" placeholder="Select sales">
                        {salesList.map((s) => (
                            <Option key={s.id} value={s.id}>
                                {s.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item label="Status" name="status">
                    <Select size="large">
                        <Option value="Active">Active</Option>
                        <Option value="Inactive">Inactive</Option>
                    </Select>
                </Form.Item>
                <Row gutter={10} style={{ marginTop: 8 }}>
                    <Col span={12}>
                        <Button
                            block
                            size="large"
                            onClick={onClose}
                            style={{ borderRadius: 10 }}
                        >
                            Cancel
                        </Button>
                    </Col>
                    <Col span={12}>
                        <Button
                            block
                            type="primary"
                            htmlType="submit"
                            size="large"
                            style={{ borderRadius: 10 }}
                        >
                            Save Buyer
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}
