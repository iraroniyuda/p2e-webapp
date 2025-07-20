"use client";

import { createBonusConfig, deleteBonusConfig, getBonusConfigs, getTopupTransactionTypes, updateBonusConfig } from "@/services/apiClient";
import { useEffect, useState } from "react";
import {
  Button,
  Col,
  Form,
  Modal,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";


const USER_LEVELS = [
  "white",
  "green",
  "blue",
  "double_blue",
  "exchanger:mid",
  "exchanger:senior",
  "exchanger:executive",
];


export default function AdminBonusTab() {
  const [activeTab, setActiveTab] = useState("green");
  const [configs, setConfigs] = useState([]);
  const [transactionOptions, setTransactionOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [useGeneration, setUseGeneration] = useState(false);
  const [availableBaseOptions, setAvailableBaseOptions] = useState([]);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    userLevel: "green",
    transactionType: "",
    isOneTime: true,
    bonusAsset: "RACE",
    method: "flat",
    value: 0,
    basedOn: "",
    basedOnGenerational: "",
    generation: null,
    referralBonuses: [],
    exclusiveGroup: "",
    exclusiveGroupScope: "",
  });

  useEffect(() => {
    fetchConfigs();
    fetchTransactionTypes();
  }, []);

  const fetchConfigs = async () => {
    try {
      const data = await getBonusConfigs();
      setConfigs(data);
    } catch (err) {
      alert("❌ Gagal ambil data bonus");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionTypes = async () => {
    try {
      const data = await getTopupTransactionTypes();
      setTransactionOptions(data);

      const baseFields = ["valueRupiah", "valueSBP", "valueRACE", "valueTBP"];
      const baseSet = new Set();

      data.forEach((pkg) => {
        if (pkg.values) {
          baseFields.forEach((field) => {
            if (pkg.values[field] && pkg.values[field] > 0) {
              baseSet.add(field);
            }
          });
        }
      });

      setAvailableBaseOptions(Array.from(baseSet));
    } catch (err) {
      console.error("Gagal ambil jenis transaksi", err);
    }
  };

  const beautifyBaseLabel = (key) => {
    switch (key) {
      case "valueRupiah": return "Rupiah (Rp)";
      case "valueSBP": return "S-BP (Token)";
      case "valueRACE": return "RACE (In-game)";
      case "valueTBP": return "TBP (Governance)";
      default: return key;
    }
  };

  const groupedByLevel = (level) =>
    configs.filter((b) => b.userLevel === level);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submitBonus = async () => {
    try {
      const payload = {
        ...formData,
        userLevel: activeTab,
        value: parseFloat(formData.value),
        generation: useGeneration ? formData.generation || 1 : null,
        referralBonuses: useGeneration ? formData.referralBonuses : [],
        exclusiveGroup: formData.exclusiveGroup || null,
        exclusiveGroupScope: formData.exclusiveGroupScope || null,
        basedOnGenerational: useGeneration ? formData.basedOnGenerational : null,
      };


      if (editId) {
        await updateBonusConfig(editId, payload);
        alert("✅ Bonus diperbarui");
      } else {
        await createBonusConfig(payload);
        alert("✅ Bonus ditambahkan");
      }

      setShowForm(false);
      setUseGeneration(false);
      setEditId(null);
      setFormData({
        userLevel: activeTab,
        transactionType: "",
        isOneTime: true,
        bonusAsset: "RACE",
        method: "flat",
        value: 0,
        basedOn: "",
        basedOnGenerational: "",
        generation: null,
        referralBonuses: [],
      });

      fetchConfigs();
    } catch (err) {
      alert("❌ Gagal menyimpan bonus");
      console.error(err);
    }
  };


  const handleDelete = async (id) => {
    if (confirm("Yakin ingin menghapus bonus ini?")) {
      try {
        await deleteBonusConfig(id);
        fetchConfigs();
      } catch (err) {
        alert("❌ Gagal menghapus bonus");
        console.error(err);
      }
    }
  };

  const handleEdit = (item) => {
    setFormData({
      userLevel: item.userLevel,
      transactionType: item.transactionType,
      isOneTime: item.isOneTime,
      bonusAsset: item.bonusAsset || "RACE",
      method: item.method,
      value: item.value,
      basedOn: item.basedOn || "",
      basedOnGenerational: item.basedOnGenerational || "",
      generation: item.generation,
      referralBonuses: item.referralBonuses || [],
      exclusiveGroup: item.exclusiveGroup || "",
      exclusiveGroupScope: item.exclusiveGroupScope || "",
    });
    setUseGeneration(!!item.generation);
    setEditId(item.id);
    setShowForm(true);
  };


  return (
    <div className="text-white p-4">
      <h2 className="mb-4">Konfigurasi Bonus</h2>

      <div className="d-flex mb-4 flex-wrap">
        {USER_LEVELS.map((level) => (
          <Button
            key={level}
            variant={activeTab === level ? "primary" : "secondary"}
            className="me-2 mb-2"
            onClick={() => setActiveTab(level)}
          >
            {level.includes("exchanger:")
              ? `EXCHANGER (${level.split(":")[1].toUpperCase()})`
              : level.toUpperCase()}
          </Button>
        ))}

      </div>

      {loading ? (
        <Spinner animation="border" variant="light" />
      ) : (
        <>
          <Table striped bordered variant="dark">
            <thead>
              <tr>
                <th>Jenis Transaksi</th>
                <th>Sekali / Berulang</th>
                <th>Bonus</th>
                <th>Metode</th>
                <th>Nilai</th>
                <th>Dasar %</th>
                <th>Dasar Generasi</th>
                <th>Generasi</th>
                <th>Grup Eksklusif</th>
                <th>Cakupan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {groupedByLevel(activeTab).map((item) => {
                return (
                  <tr key={item.id}>
                    <td>{item.transactionType}</td>
                    <td>{item.isOneTime ? "One-Time" : "Recurring"}</td>
                    <td>{item.bonusAsset}</td>
                    <td>{item.method}</td>
                    <td>{item.value}</td>
                    <td>{item.basedOn || "-"}</td>
                    <td>{item.basedOnGenerational || "-"}</td>
                    <td>{item.generation || "-"}</td>
                    <td>{item.exclusiveGroup || "-"}</td>
                    <td>
                      {item.exclusiveGroupScope === "configAll"
                        ? "Semua Bonus"
                        : item.exclusiveGroupScope === "bonusOnly"
                        ? "Hanya Bonus"
                        : "-"}
                    </td>
                    <td>
                      <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(item)}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
                        Hapus
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>


          </Table>

          <Button onClick={() => setShowForm(true)}>+ Tambah Bonus</Button>
        </>
      )}

      <Modal
        show={showForm}
        onHide={() => {
          setShowForm(false);
          setUseGeneration(false);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Tambah Bonus</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Jenis Transaksi</Form.Label>
              <Form.Select
                name="transactionType"
                value={formData.transactionType}
                onChange={handleChange}
              >
                <option value="">Pilih transaksi...</option>
                {transactionOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Metode Bonus</Form.Label>
              <Form.Select
                name="method"
                value={formData.method}
                onChange={handleChange}
              >
                <option value="flat">Flat</option>
                <option value="percent">Percent</option>
              </Form.Select>
            </Form.Group>

            <Form.Check
              type="checkbox"
              label="Bonus One-Time"
              name="isOneTime"
              checked={formData.isOneTime}
              onChange={handleChange}
              className="mb-2"
            />

            <Form.Group className="mb-2">
              <Form.Label>Grup Eksklusif (Opsional)</Form.Label>
              <Form.Control
                type="text"
                name="exclusiveGroup"
                value={formData.exclusiveGroup}
                onChange={handleChange}
                placeholder="Contoh: group_bonus_uang"
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Cakupan Eksklusif</Form.Label>
              <Form.Select
                name="exclusiveGroupScope"
                value={formData.exclusiveGroupScope}
                onChange={handleChange}
              >
                <option value="">(Tidak ada)</option>
                <option value="bonusOnly">Hanya bonus di grup ini</option>
                <option value="configAll">Semua bonus di semua config dalam grup</option>
              </Form.Select>
            </Form.Group>


            <Form.Group className="mb-2">
              <Form.Label>Bonus Asset</Form.Label>
              <Form.Select
                name="bonusAsset"
                value={formData.bonusAsset}
                onChange={handleChange}
              >
                <option value="RACE">RACE</option>
                <option value="SBP">SBP</option>
                <option value="TBP">TBP</option>
                <option value="IDR">Rp</option>
              </Form.Select>
            </Form.Group>


            <Form.Group className="mb-2">
              <Form.Label>Nilai</Form.Label>
              <Form.Control
                type="number"
                name="value"
                value={formData.value}
                onChange={handleChange}
              />
            </Form.Group>

            {formData.method === "percent" && !useGeneration && (
              <Form.Group className="mb-2">
                <Form.Label>Dasar (%)</Form.Label>
                {availableBaseOptions.length > 1 ? (
                  <Form.Select
                    name="basedOn"
                    value={formData.basedOn}
                    onChange={handleChange}
                  >
                    <option value="">Pilih dasar kalkulasi</option>
                    {availableBaseOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {beautifyBaseLabel(opt)}
                      </option>
                    ))}
                  </Form.Select>
                ) : (
                  <Form.Control
                    type="text"
                    name="basedOn"
                    value={availableBaseOptions[0] || ""}
                    readOnly
                  />
                )}
              </Form.Group>
            )}


            <Form.Group className="mb-2">
              <Form.Check
                type="checkbox"
                label="Gunakan bonus berdasarkan generasi"
                checked={useGeneration}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setUseGeneration(checked);
                  setFormData((prev) => ({
                    ...prev,
                    generation: checked ? 1 : null,
                    basedOn: checked ? "transactionAmount" : prev.basedOn,
                    referralBonuses: checked
                      ? [{ level: 1, bonusPercentage: 0 }]
                      : [],
                  }));
                }}
              />
            </Form.Group>

            {useGeneration && (
              <>
                <Form.Group className="mb-2">
                  <Form.Label>Jumlah Generasi</Form.Label>
                  <Form.Control
                    type="number"
                    name="generation"
                    value={formData.generation || ""}
                    min={1}
                    onChange={(e) => {
                      const newGen = parseInt(e.target.value) || 1;
                      setFormData((prev) => ({
                        ...prev,
                        generation: newGen,
                        referralBonuses: Array.from({ length: newGen }, (_, i) => ({
                          level: i + 1,
                          bonusPercentage:
                            prev.referralBonuses[i]?.bonusPercentage || 0,
                        })),
                      }));
                    }}
                  />
                </Form.Group>

                <Form.Label className="mt-3">Bonus per Generasi</Form.Label>
                {formData.referralBonuses.map((bonus, idx) => (
                  <Row key={idx} className="mb-2 align-items-center">
                    <Col xs={3}>
                      <Form.Text>Generasi {bonus.level}</Form.Text>
                    </Col>
                    <Col xs={6}>
                      <Form.Control
                        type="number"
                        value={bonus.bonusPercentage}
                        onChange={(e) => {
                          const updated = [...formData.referralBonuses];
                          updated[idx].bonusPercentage = parseFloat(e.target.value);
                          setFormData((prev) => ({
                            ...prev,
                            referralBonuses: updated,
                          }));
                        }}
                        placeholder={`Bonus (%)`}
                      />
                    </Col>
                  </Row>
                ))}

                <Form.Group className="mb-2">
                  <Form.Label>Dasar (%)</Form.Label>
                  {availableBaseOptions.length > 1 ? (
                    <Form.Select
                      name="basedOnGenerational"
                      value={formData.basedOnGenerational}
                      onChange={handleChange}
                    >
                      <option value="">Pilih dasar kalkulasi</option>
                      {availableBaseOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {beautifyBaseLabel(opt)}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    <Form.Control
                      type="text"
                      name="basedOnGenerational"
                      value={availableBaseOptions[0] || ""}
                      readOnly
                    />
                  )}
                </Form.Group>


              </>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowForm(false)}>
            Tutup
          </Button>
          <Button variant="primary" onClick={submitBonus}>
            Simpan
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
