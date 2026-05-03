import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import "./FieldCustomizeModal.css";

const storageKey = "fieldData";

const fallbackFieldData  = [
  {
    id: 1,
    checked: true,
    fieldName: "date",
    description: "Date",
    width: 100,
    serialNo: 1,
    total: false,
    bold: false,
  },
  {
    id: 2,
    checked: false,
    fieldName: "valpha",
    description: "Party Name",
    width: 180,
    serialNo: 2,
    total: false,
    bold: false,
  },
  {
    id: 3,
    checked: false,
    fieldName: "vtype",
    description: "Type",
    width: 80,
    serialNo: 3,
    total: false,
    bold: false,
  },
];

const FieldCustomizeModal = ({
  show,
  onHide,
  defaultFieldData = fallbackFieldData,
  storageKey = "fieldData",
}) => {
  const [fieldData, setFieldData] = useState(defaultFieldData);

  useEffect(() => {
    if (show) {
      const saved = localStorage.getItem(storageKey);

      if (saved) {
        setFieldData(JSON.parse(saved));
      } else {
        setFieldData(defaultFieldData);
      }
    }
  }, [show]);

  const handleChange = (index, name, value) => {
    const updated = [...fieldData];

    updated[index] = {
      ...updated[index],
      [name]: value,
    };

    setFieldData(updated);
  };

  const handleAddRow = () => {
    const newRow = {
      id: Date.now(),
      checked: true,
      fieldName: "",
      description: "",
      width: 0,
      serialNo: fieldData.length + 1,
      total: false,
      bold: false,
    };

    setFieldData([...fieldData, newRow]);
  };

  const handleSave = () => {
    localStorage.setItem(storageKey, JSON.stringify(fieldData));
    onHide();
  };

  const handleReset = () => {
    setFieldData(defaultFieldData);
    localStorage.setItem(storageKey, JSON.stringify(defaultFieldData));
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="xl"
      dialogClassName="field-customize-modal"
    >
      <Modal.Body className="field-modal-body">
        <div className="field-modal-header">
          <div>
            <h4>Customize Print Fields</h4>
            <p>Manage description, width, serial number, total and bold</p>
          </div>

          <button className="field-close-btn" onClick={onHide}>
            ×
          </button>
        </div>

        <div className="field-modal-card">
          <div className="field-toolbar">
            <span className="field-count">{fieldData.length} Fields</span>

            <button className="field-reset-btn" onClick={handleReset}>
              Reset
            </button>
          </div>

          <div className="field-table-wrapper">
            <table className="field-table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }} className="text-center">
                    Select
                  </th>
                  <th>Field Name</th>
                  <th>Description</th>
                  <th className="text-center" style={{ width: "120px" }}>
                    Width
                  </th>
                  <th className="text-center" style={{ width: "120px" }}>
                    Serial No
                  </th>
                  <th className="text-center" style={{ width: "80px" }}>
                    Total
                  </th>
                  <th className="text-center" style={{ width: "80px" }}>
                    Bold
                  </th>
                </tr>
              </thead>

              <tbody>
                {[...fieldData]
                  .sort((a, b) => Number(a.serialNo) - Number(b.serialNo))
                  .map((item, index) => (
                    <tr key={item.id}>
                      <td>
                        <div className="checkbox-center">
                          <input
                            type="checkbox"
                            className="field-checkbox"
                            checked={item.checked}
                            onChange={(e) =>
                              handleChange(index, "checked", e.target.checked)
                            }
                          />
                        </div>
                      </td>
                      <td>
                        <input
                          className="field-input readonly-input"
                          value={item.fieldName}
                          readOnly
                        />
                      </td>

                      <td>
                        <input
                          className="field-input"
                          value={item.description}
                          onChange={(e) =>
                            handleChange(index, "description", e.target.value)
                          }
                        />
                      </td>

                      <td>
                        <input
                          className="field-input text-center"
                          type="number"
                          value={item.width}
                          onChange={(e) =>
                            handleChange(index, "width", Number(e.target.value))
                          }
                        />
                      </td>

                      <td>
                        <input
                          className="field-input text-center"
                          type="number"
                          value={item.serialNo}
                          onChange={(e) =>
                            handleChange(
                              index,
                              "serialNo",
                              Number(e.target.value),
                            )
                          }
                        />
                      </td>

                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="field-checkbox"
                          checked={item.total}
                          onChange={(e) =>
                            handleChange(index, "total", e.target.checked)
                          }
                        />
                      </td>

                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="field-checkbox"
                          checked={item.bold}
                          onChange={(e) =>
                            handleChange(index, "bold", e.target.checked)
                          }
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="field-modal-footer">
          <Button variant="light" onClick={onHide}>
            Cancel
          </Button>

          <Button variant="dark" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default FieldCustomizeModal;
