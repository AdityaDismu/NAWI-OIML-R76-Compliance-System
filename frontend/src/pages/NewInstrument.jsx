import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "../components/layout/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import InstrumentForm from "../components/instruments/InstrumentForm";

import {
  createInstrument,
  createInstrumentRange,
} from "../api/instruments";


const initialForm = {
  manufacturer: "",
  model: "",
  serial_number: "",
  accuracy_class: "",
  category: "ELECTRONIC",
  indication_type: "DIGITAL",
  software_identification: "",
  software_version: "",
  connected_modules: "",
  notes: "",

  ranges: [
    {
      range_type: "SINGLE_RANGE",
      max_capacity: "",
      min_capacity: "",
      verification_scale_interval: "",
      actual_scale_interval: "",
      maximum_tare: "",
    },
  ],
};


export default function NewInstrument() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const range = form.ranges[0];

      // ---------------------------------------------------------
      // Validate range
      // ---------------------------------------------------------

      if (!range.max_capacity) {
        throw new Error("Maximum capacity is required.");
      }

      if (!range.min_capacity) {
        throw new Error("Minimum capacity is required.");
      }

      if (!range.verification_scale_interval) {
        throw new Error(
          "Verification scale interval (e) is required."
        );
      }

      if (!range.actual_scale_interval) {
        throw new Error(
          "Actual scale interval (d) is required."
        );
      }

      // ---------------------------------------------------------
      // 1. Create instrument
      // ---------------------------------------------------------

      const instrumentPayload = {
        manufacturer: form.manufacturer.trim(),
        model: form.model.trim(),
        serial_number: form.serial_number.trim(),
        accuracy_class: form.accuracy_class,
        category: form.category,
        indication_type: form.indication_type,
        software_identification:
          form.software_identification.trim() || null,
        software_version:
          form.software_version.trim() || null,
        connected_modules:
          form.connected_modules.trim() || null,
        notes: form.notes.trim() || null,
      };

      const createdInstrument =
        await createInstrument(instrumentPayload);

      // ---------------------------------------------------------
      // 2. Create weighing range
      // ---------------------------------------------------------

      const rangePayload = {
        range_type: range.range_type,
        max_capacity: Number(range.max_capacity),
        min_capacity: Number(range.min_capacity),
        verification_scale_interval: Number(
          range.verification_scale_interval
        ),
        actual_scale_interval: Number(
          range.actual_scale_interval
        ),
        maximum_tare: range.maximum_tare
          ? Number(range.maximum_tare)
          : null,
      };

      await createInstrumentRange(
        createdInstrument.id,
        rangePayload
      );

      // ---------------------------------------------------------
      // 3. Open instrument details
      // ---------------------------------------------------------

      navigate(`/instruments/${createdInstrument.id}`);

    } catch (err) {
      setError(
        err.message || "Failed to create instrument"
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <div>
      <PageHeader
        title="New Instrument"
        description="Register a non-automatic weighing instrument."
      />

      <div className="mt-6">

        {error && (
          <Card className="mb-5 border-red-500/30">
            <p className="text-sm text-red-400">
              {error}
            </p>
          </Card>
        )}

        <InstrumentForm
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          loading={loading}
        />

        <div className="mt-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/instruments")}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>

      </div>
    </div>
  );
}