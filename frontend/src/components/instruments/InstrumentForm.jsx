import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { Sparkles } from "lucide-react";
import { sampleInstrumentForm } from "../../utils/sampleData";
import RangeForm from "./RangeForm";


export default function InstrumentForm({
  form,
  setForm,
  onSubmit,
  loading,
}) {

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }


  function updateRange(updatedRange) {
    setForm((current) => ({
      ...current,
      ranges: [updatedRange],
    }));
  }


  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6"
    >

      {/* -------------------------------------------------------
          Instrument Information
      -------------------------------------------------------- */}

      <div className="rounded-2xl border border-border bg-panel p-6">

        <h2 className="text-lg font-semibold text-white">
          Instrument Information
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Enter the identification and technical information
          from the instrument and its documentation.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setForm(sampleInstrumentForm())}
            disabled={loading}
          >
            <Sparkles size={16} />
            Auto-Fill Sample Data
          </Button>
          <span className="text-xs text-slate-500">
            Populate the instrument form with realistic, internally consistent sample values.
          </span>
        </div>


        <div className="mt-6 grid gap-5 md:grid-cols-2">

          <Input
            label="Manufacturer / Applicant"
            value={form.manufacturer}
            onChange={(e) =>
              update("manufacturer", e.target.value)
            }
            required
          />


          <Input
            label="Model / Type Designation"
            value={form.model}
            onChange={(e) =>
              update("model", e.target.value)
            }
            required
          />


          <Input
            label="Serial Number"
            value={form.serial_number}
            onChange={(e) =>
              update("serial_number", e.target.value)
            }
            required
          />


          <Select
            label="Accuracy Class"
            value={form.accuracy_class}
            onChange={(e) =>
              update("accuracy_class", e.target.value)
            }
            required
          >
            <option value="">
              Select class
            </option>

            <option value="I">
              Class I
            </option>

            <option value="II">
              Class II
            </option>

            <option value="III">
              Class III
            </option>

            <option value="IIII">
              Class IIII
            </option>
          </Select>


          <Select
            label="Instrument Category"
            value={form.category}
            onChange={(e) =>
              update("category", e.target.value)
            }
            required
          >
            <option value="ELECTRONIC">
              Electronic
            </option>

            <option value="MECHANICAL">
              Mechanical
            </option>
          </Select>


          <Select
            label="Indication Type"
            value={form.indication_type}
            onChange={(e) =>
              update("indication_type", e.target.value)
            }
            required
          >
            <option value="DIGITAL">
              Digital
            </option>

            <option value="ANALOGUE">
              Analogue
            </option>

            <option value="NON_SELF_INDICATING">
              Non-self-indicating
            </option>
          </Select>


          <Input
            label="Software Identification"
            value={form.software_identification}
            onChange={(e) =>
              update(
                "software_identification",
                e.target.value
              )
            }
          />


          <Input
            label="Software Version"
            value={form.software_version}
            onChange={(e) =>
              update(
                "software_version",
                e.target.value
              )
            }
          />


          <Input
            label="Connected Modules"
            value={form.connected_modules}
            onChange={(e) =>
              update(
                "connected_modules",
                e.target.value
              )
            }
          />

        </div>


        <div className="mt-5">
          <Input
            label="Notes"
            value={form.notes}
            onChange={(e) =>
              update("notes", e.target.value)
            }
            placeholder="Additional instrument information..."
          />
        </div>

      </div>


      {/* -------------------------------------------------------
          Weighing Range
      -------------------------------------------------------- */}

      <RangeForm
        range={form.ranges[0]}
        onChange={updateRange}
      />


      {/* -------------------------------------------------------
          Submit
      -------------------------------------------------------- */}

      <div className="flex justify-end">

        <Button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Creating..."
            : "Create Instrument"}
        </Button>

      </div>

    </form>
  );
}