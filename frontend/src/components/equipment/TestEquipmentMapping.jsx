import { useEffect, useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import {
  getEquipment,
  getTestEquipment,
  assignEquipmentToTest,
  removeEquipmentFromTest,
} from "../../api/equipment";

export default function TestEquipmentMapping({
  testInstanceId,
}) {
  const [equipment, setEquipment] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const [allEquipment, assignedEquipment] =
        await Promise.all([
          getEquipment(),
          getTestEquipment(testInstanceId),
        ]);

      setEquipment(
        Array.isArray(allEquipment)
          ? allEquipment
          : allEquipment?.items || []
      );

      setAssigned(
        Array.isArray(assignedEquipment)
          ? assignedEquipment
          : assignedEquipment?.items || []
      );
    } catch (error) {
      console.error("Equipment mapping error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (testInstanceId) {
      load();
    }
  }, [testInstanceId]);

  async function handleAssign() {
    if (!selected) return;

    try {
      await assignEquipmentToTest(
        testInstanceId,
        selected
      );

      setSelected("");

      await load();
    } catch (error) {
      console.error(error);
      alert("Unable to assign equipment.");
    }
  }

  async function handleRemove(equipmentId) {
    try {
      await removeEquipmentFromTest(
        testInstanceId,
        equipmentId
      );

      await load();
    } catch (error) {
      console.error(error);
      alert("Unable to remove equipment.");
    }
  }

  if (loading) {
    return (
      <Card className="p-5">
        <p className="text-sm text-slate-400">
          Loading equipment...
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-white">
          Test Equipment
        </h3>

        <p className="mt-1 text-sm text-slate-400">
          Record the equipment used for this test.
        </p>
      </div>

      <div className="flex gap-3">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
        >
          <option value="">
            Select equipment
          </option>

          {equipment.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name ||
                item.equipment_name ||
                item.model ||
                "Equipment"}
            </option>
          ))}
        </select>

        <Button
          type="button"
          onClick={handleAssign}
          disabled={!selected}
        >
          Assign
        </Button>
      </div>

      <div className="mt-5 space-y-2">
        {assigned.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-800 p-4 text-center text-sm text-slate-500">
            No equipment assigned to this test.
          </p>
        ) : (
          assigned.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-3"
            >
              <div>
                <p className="text-sm font-medium text-white">
                  {item.name ||
                    item.equipment_name ||
                    item.model}
                </p>

                <p className="text-xs text-slate-500">
                  {item.serial_number ||
                    "Serial number not available"}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleRemove(item.id)
                }
                className="text-xs text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}