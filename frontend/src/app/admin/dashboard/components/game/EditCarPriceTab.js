"use client";

import {
  getAllAdminAssets,
  getUpgradeFlatPriceConfigs,
  updateCarPrice,
  updateUpgradeFlatPriceConfig
} from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Form, Spinner, Table } from "react-bootstrap";

export default function EditCarPriceTab() {
  const [cars, setCars] = useState([]);
  const [upgradeConfigs, setUpgradeConfigs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editedPrices, setEditedPrices] = useState({});
  const [editedSBP, setEditedSBP] = useState({});

  const [editedUpgradePrice, setEditedUpgradePrice] = useState({});
  const [editedUpgradeSBP, setEditedUpgradeSBP] = useState({});
  const [editedUpgradeDurability, setEditedUpgradeDurability] = useState({});

  useEffect(() => {
    fetchCars();
    fetchUpgradeConfigs();
  }, []);

  const fetchCars = async () => {
    try {
      const cars = await getAllAdminAssets();
      setCars(cars);
    } catch (err) {
      console.error("Gagal load data mobil:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpgradeConfigs = async () => {
    try {
      const configs = await getUpgradeFlatPriceConfigs();
      setUpgradeConfigs(configs);
    } catch (err) {
      console.error("Gagal load config upgrade:", err);
    }
  };

  const handlePriceChange = (id, value) => {
    setEditedPrices((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async (id) => {
    try {
      const newPrice = editedPrices[id];
      const newValueSBP = editedSBP[id];
      await updateCarPrice(id, newPrice, newValueSBP);
      alert("✅ Data mobil diperbarui");
      fetchCars();
    } catch (err) {
      alert("❌ Gagal update");
      console.error(err);
    }
  };

  const handleSaveUpgradeConfig = async (partType) => {
    try {
      const newPrice = editedUpgradePrice[partType];
      const newValueSBP = editedUpgradeSBP[partType];
      const newDurability = editedUpgradeDurability[partType];
      await updateUpgradeFlatPriceConfig(partType, newPrice, newValueSBP, newDurability);
      alert(`✅ Config ${partType} diperbarui`);
      fetchUpgradeConfigs();
    } catch (err) {
      alert(`❌ Gagal update ${partType}`);
      console.error(err);
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h5 className="mb-3 text-white">Edit Harga Mobil</h5>
      <Table striped bordered hover responsive variant="dark">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama Mobil</th>
            <th>Harga (RACE)</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {cars.map((car) => (
            <tr key={car.id}>
              <td>{car.id}</td>
              <td>{car.name}</td>
              <td>
                <Form.Control
                  type="number"
                  value={editedPrices[car.id] ?? parseFloat(car.price)}
                  onChange={(e) => handlePriceChange(car.id, e.target.value)}
                />
              </td>
              <td>
                <Button onClick={() => handleSave(car.id)}>💾 Simpan</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h5 className="mb-3 mt-5 text-white">Edit Harga Spare Part</h5>
      <Table striped bordered hover responsive variant="dark">
        <thead>
          <tr>
            <th>Part Type</th>
            <th>Harga (RACE)</th>
            <th>VALUE SBP</th>
            <th>Default Durability</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {upgradeConfigs
            .filter((config) => config.partType !== "headlight" && config.partType !== "wheelSmoke")
            .map((config) => (
            <tr key={config.partType}>
              <td>{config.partType}</td>
              <td>
                <Form.Control
                  type="number"
                  value={
                    editedUpgradePrice[config.partType] ?? parseFloat(config.price)
                  }
                  onChange={(e) =>
                    setEditedUpgradePrice((prev) => ({
                      ...prev,
                      [config.partType]: e.target.value,
                    }))
                  }
                />
              </td>
              <td>
                <Form.Control
                  type="number"
                  value={
                    editedUpgradeSBP[config.partType] ?? parseFloat(config.valueSBP)
                  }
                  onChange={(e) =>
                    setEditedUpgradeSBP((prev) => ({
                      ...prev,
                      [config.partType]: e.target.value,
                    }))
                  }
                />
              </td>
              <td>
                <Form.Control
                  type="number"
                  value={
                    editedUpgradeDurability[config.partType] ??
                    config.defaultDurability ??
                    100
                  }
                  onChange={(e) =>
                    setEditedUpgradeDurability((prev) => ({
                      ...prev,
                      [config.partType]: e.target.value,
                    }))
                  }
                  min={1}
                />
              </td>
              <td>
                <Button onClick={() => handleSaveUpgradeConfig(config.partType)}>
                  💾 Simpan
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
