import { useEffect, useState } from "react";
import { Plus, Settings2 } from "lucide-react";
import PageHeader from "../components/layout/PageHeader";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import EquipmentForm from "../components/equipment/EquipmentForm";
import CalibrationForm from "../components/equipment/CalibrationForm";
import {
  getEquipment,
  createEquipment,
  createEquipmentCalibration,
} from "../api/equipment";

export default function Equipment() {
  const [equipment, setEquipment] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedEquipment, setSelectedEquipment] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadEquipment() {
    try {
      setLoading(true);

      const data = await getEquipment();

      setEquipment(
        Array.isArray(data)
          ? data
          : data?.items || []
      );
    } catch (error) {
      console.error("Failed to load equipment:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEquipment();
  }, []);

  async function handleCreate(data) {
    try {
      setSaving(true);

      await createEquipment(data);

      setShowForm(false);

      await loadEquipment();
    } catch (error) {
      console.error(error);
      alert("Unable to register equipment.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCalibration(
    equipmentId,
    data
  ) {
    try {
      setSaving(true);

      await createEquipmentCalibration(
        equipmentId,
        data
      );

      alert("Calibration details saved.");

      setSelectedEquipment(null);

      await loadEquipment();
    } catch (error) {
      console.error(error);
      alert("Unable to save calibration.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Test Equipment"
        description="Manage laboratory equipment, reference standards and calibration records."
      >
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Register Equipment
        </Button>
      </PageHeader>

      {showForm && (
        <EquipmentForm
          onSubmit={handleCreate}
          saving={saving}
        />
      )}

      {selectedEquipment && (
        <CalibrationForm
          equipmentId={selectedEquipment.id}
          onSave={handleCalibration}
          saving={saving}
        />
      )}

      {loading ? (
        <Card className="p-8">
          <p className="text-sm text-slate-400">
            Loading equipment...
          </p>
        </Card>
      ) : equipment.length === 0 ? (
        <Card className="p-12 text-center">
          <Settings2 className="mx-auto h-10 w-10 text-slate-600" />

          <h3 className="mt-4 text-lg font-medium text-white">
            No equipment registered
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Register laboratory equipment to use it in
            evaluations.
          </p>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {equipment.map((item) => (
            <Card
              key={item.id}
              className="p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-white">
                    {item.name ||
                      item.equipment_name ||
                      "Equipment"}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {item.equipment_type ||
                      "Laboratory Equipment"}
                  </p>
                </div>

                <Badge>
                  {item.status || "ACTIVE"}
                </Badge>
              </div>

              <div className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Manufacturer
                  </span>

                  <span className="text-slate-300">
                    {item.manufacturer || "—"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Model
                  </span>

                  <span className="text-slate-300">
                    {item.model || "—"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Serial
                  </span>

                  <span className="text-slate-300">
                    {item.serial_number || "—"}
                  </span>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedEquipment(item)
                  }
                  className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
                >
                  Manage Calibration →
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}