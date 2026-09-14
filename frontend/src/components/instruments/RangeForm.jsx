import Input from "../ui/Input";
import Select from "../ui/Select";


export default function RangeForm({ range, onChange }) {

  function update(field, value) {
    onChange({
      ...range,
      [field]: value,
    });
  }


  return (
    <div className="rounded-xl border border-border bg-slate-950/40 p-5">

      <div>
        <h3 className="font-semibold text-white">
          Weighing Range
        </h3>

        <p className="mt-1 text-sm text-slate-400">
          Enter the weighing range and scale interval values.
        </p>
      </div>


      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        <Select
          label="Range Type"
          value={range.range_type}
          onChange={(e) =>
            update("range_type", e.target.value)
          }
          required
        >
          <option value="SINGLE_RANGE">
            Single Range
          </option>

          <option value="MULTI_RANGE">
            Multi Range
          </option>

          <option value="MULTI_INTERVAL">
            Multi Interval
          </option>
        </Select>


        <Input
          label="Maximum Capacity (Max)"
          type="number"
          step="0.001"
          min="0"
          value={range.max_capacity}
          onChange={(e) =>
            update("max_capacity", e.target.value)
          }
          placeholder="150.000"
          required
        />


        <Input
          label="Minimum Capacity (Min)"
          type="number"
          step="0.001"
          min="0"
          value={range.min_capacity}
          onChange={(e) =>
            update("min_capacity", e.target.value)
          }
          placeholder="1.000"
          required
        />


        <Input
          label="Verification Scale Interval (e)"
          type="number"
          step="0.001"
          min="0"
          value={range.verification_scale_interval}
          onChange={(e) =>
            update(
              "verification_scale_interval",
              e.target.value
            )
          }
          placeholder="0.050"
          required
        />


        <Input
          label="Actual Scale Interval (d)"
          type="number"
          step="0.001"
          min="0"
          value={range.actual_scale_interval}
          onChange={(e) =>
            update(
              "actual_scale_interval",
              e.target.value
            )
          }
          placeholder="0.010"
          required
        />


        <Input
          label="Maximum Tare"
          type="number"
          step="0.001"
          min="0"
          value={range.maximum_tare}
          onChange={(e) =>
            update("maximum_tare", e.target.value)
          }
          placeholder="30.000"
        />

      </div>
    </div>
  );
}