import { Modal, Button, Typography } from "antd";
const { Text } = Typography;

export default function DeleteModal({ open, message, onConfirm, onCancel }) {
  return (
    <Modal
      title="Delete Confirmation"
      open={open}
      onCancel={onCancel}
      centered
      width={380}
      footer={[
        <Button key="c" onClick={onCancel}>Cancel</Button>,
        <Button key="d" danger type="primary" onClick={onConfirm}>Delete</Button>,
      ]}
    >
      <Text style={{ color: "#94a3b8" }}>{message ?? "Are you sure you want to delete this item?"}</Text>
    </Modal>
  );
}
