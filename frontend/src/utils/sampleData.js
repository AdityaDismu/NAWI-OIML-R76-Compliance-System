/*
 * Central sample-data generator for the NAWI prototype.
 *
 * The generator intentionally produces realistic, internally consistent
 * values instead of arbitrary random numbers. Test observations are derived
 * from the selected instrument range and accuracy class.
 */

const INSTRUMENT_SCENARIOS = [
  { max: 150, e: 0.05, d: 0.01, tare: 30 },
  { max: 100, e: 0.02, d: 0.01, tare: 20 },
  { max: 300, e: 0.10, d: 0.02, tare: 60 },
  { max: 60, e: 0.02, d: 0.01, tare: 12 },
  { max: 200, e: 0.10, d: 0.02, tare: 40 },
  { max: 500, e: 0.20, d: 0.05, tare: 100 },
  { max: 80, e: 0.05, d: 0.01, tare: 16 },
  { max: 250, e: 0.10, d: 0.02, tare: 50 },
  { max: 120, e: 0.05, d: 0.01, tare: 24 },
  { max: 300, e: 0.20, d: 0.05, tare: 60 },
];

const TEST_SCENARIOS = [
  "clean-pass",
  "small-positive",
  "small-negative",
  "near-mpe",
  "mixed",
  "repeatable",
  "boundary",
  "low-load",
  "high-load",
  "slightly-varied",
  "fail",
];

const pick = (items) => items[Math.floor(Math.random() * items.length)];

const round = (value, digits = 3) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function accuracyClass(evaluation) {
  return String(
    evaluation?.instrument?.accuracy_class ||
      evaluation?.instrument?.class ||
      "III"
  )
    .replace(/^Class\s+/i, "")
    .replace(/\s*\(.+\)\s*$/, "")
    .trim()
    .toUpperCase();
}

function rangeOf(evaluation) {
  const range = evaluation?.instrument_range || {};
  const max = Number(range.max_capacity ?? range.max_value ?? 150);
  const min = Number(range.min_capacity ?? range.min_value ?? 1);
  const e = Number(
    range.verification_scale_interval ?? range.e_value ?? 0.05
  );
  const d = Number(range.actual_scale_interval ?? range.d_value ?? 0.01);
  const tare = Number(
    range.maximum_tare ??
      evaluation?.instrument?.maximum_tare ??
      0
  );

  return {
    max: Number.isFinite(max) && max > 0 ? max : 150,
    min: Number.isFinite(min) && min >= 0 ? min : 1,
    e: Number.isFinite(e) && e > 0 ? e : 0.05,
    d: Number.isFinite(d) && d > 0 ? d : 0.01,
    tare: Number.isFinite(tare) && tare >= 0 ? tare : 0,
  };
}

/*
 * OIML R76-style maximum permissible error for a Class III sample.
 * The boundary values are useful for testing the PASS/FAIL logic.
 */
function mpeFor(load, e, cls = "III") {
  const n = 1 / e;
  const className = cls === "IIII" ? "IIII" : cls;

  if (className === "I") {
    return 0.5 * e;
  }

  if (className === "II") {
    if (load <= 50 * e) return 0.5 * e;
    if (load <= 200 * e) return 1 * e;
    return 1.5 * e;
  }

  if (className === "IIII") {
    if (load <= 50 * e) return 0.5 * e;
    if (load <= 200 * e) return 1 * e;
    return 1.5 * e;
  }

  // Class III: 0–500e, 500–2000e, 2000–10000e.
  if (n <= 0) return 1.5 * e;
  if (load <= 500 * e) return 0.5 * e;
  if (load <= 2000 * e) return 1 * e;
  return 1.5 * e;
}

function errorFor(scenario, mpe, e, index = 0) {
  const small = Math.max(e * 0.10, mpe * 0.20);
  const near = Math.max(e * 0.10, mpe * 0.92);

  switch (scenario) {
    case "small-positive":
      return small;
    case "small-negative":
      return -small;
    case "near-mpe":
      return index % 2 === 0 ? near : -near;
    case "boundary":
      return index % 2 === 0 ? mpe * 0.99 : -mpe * 0.99;
    case "mixed":
      return [0, small, -small, near, -near][index % 5];
    case "slightly-varied":
      return [0, small * 0.8, -small * 0.6, small * 0.5][index % 4];
    case "fail":
      return mpe * 1.25;
    default:
      return 0;
  }
}

function baseError(evaluation, load, scenario, index = 0) {
  const { e } = rangeOf(evaluation);
  const mpe = mpeFor(Math.abs(load), e, accuracyClass(evaluation));
  return { mpe, error: errorFor(scenario, mpe, e, index) };
}

function sampleInstrument() {
  const profile = pick(INSTRUMENT_SCENARIOS);
  const stamp = Date.now().toString().slice(-6);

  return {
    manufacturer: "Apex Weigh Systems Pvt. Ltd.",
    model: `AWS-${profile.max} Digital Platform Scale`,
    serial_number: `AWS${profile.max}-${stamp}`,
    accuracy_class: "III",
    category: "ELECTRONIC",
    indication_type: "DIGITAL",
    software_identification: `AWS-SW-${profile.max}`,
    software_version: pick(["3.1.4", "3.2.0", "3.2.1", "4.0.0"]),
    connected_modules: pick([
      "External display, USB printer interface",
      "USB printer interface",
      "External display",
      "USB printer and data interface",
    ]),
    notes: "Auto-filled realistic sample instrument for prototype testing.",
    ranges: [
      {
        range_type: "SINGLE_RANGE",
        max_capacity: profile.max.toFixed(3),
        min_capacity: (profile.e * 20).toFixed(3),
        verification_scale_interval: profile.e.toFixed(3),
        actual_scale_interval: profile.d.toFixed(3),
        maximum_tare: profile.tare.toFixed(3),
      },
    ],
  };
}

function sampleEnvironment() {
  const samples = [
    [23.5, 48.0, 1012.6],
    [22.8, 52.0, 1014.1],
    [24.2, 45.5, 1011.8],
    [21.9, 55.0, 1013.4],
    [25.1, 47.5, 1010.9],
    [23.0, 50.0, 1013.0],
    [24.7, 44.0, 1012.1],
    [22.5, 58.0, 1014.6],
    [23.8, 49.5, 1011.5],
    [24.0, 51.0, 1013.7],
  ];

  const [temperature, humidity, pressure] = pick(samples);

  return {
    temperature: String(temperature),
    humidity: String(humidity),
    pressure: String(pressure),
    location: pick([
      "Legal Metrology Test Laboratory - Room 01",
      "NAWI Calibration Laboratory - Bay 02",
      "Instrument Testing Laboratory - Room 03",
      "Metrology Test Room - Platform Area",
    ]),
    start_time: "2026-09-12T09:30",
    end_time: "2026-09-12T17:30",
    conditions_ok: true,
    notes:
      "Stable laboratory conditions maintained during testing. Auto-filled sample data.",
  };
}

/*
 * Returns a list of DOM control values in the exact order used by the
 * existing test forms. This keeps the feature centralized without changing
 * the payload contracts of the individual forms.
 */
export function generateTestControlValues(testCode, evaluation) {
  const { max, min, e, d, tare } = rangeOf(evaluation);
  const scenario = pick(TEST_SCENARIOS);
  const values = [];

  const push = (...items) => values.push(...items);

  switch (testCode) {
    case "WEIGHING_PERFORMANCE": {
      const loads = [
        min,
        max / 6,
        max / 3,
        (2 * max) / 3,
        max,
      ].map((v) => round(v));

      loads.forEach((load, i) => {
        const { error } = baseError(evaluation, load, scenario, i);
        push(
          load.toFixed(3),
          round(load + error).toFixed(3),
          "0"
        );
      });

      [...loads].reverse().forEach((load, i) => {
        const { error } = baseError(evaluation, load, scenario, i + 2);
        push(
          load.toFixed(3),
          round(load + error).toFixed(3),
          "0"
        );
      });

      push(round(errorFor(scenario, 0.5 * e, e)).toFixed(3));
      break;
    }

    case "ECCENTRICITY": {
      const load = round((max + tare) / 3);
      const positions = [
        "CENTER",
        "FRONT_LEFT",
        "FRONT_RIGHT",
        "REAR_RIGHT",
        "REAR_LEFT",
      ];

      positions.forEach((position, i) => {
        const { error } = baseError(evaluation, load, scenario, i);
        push(
          position,
          load.toFixed(3),
          load.toFixed(3),
          round(load + error).toFixed(3)
        );
      });
      break;
    }

    case "REPEATABILITY": {
      push("80");
      const load = round(max * 0.8);
      for (let i = 0; i < 3; i++) {
        const variation =
          scenario === "repeatable"
            ? [0, d, -d][i]
            : scenario === "fail"
              ? [0, mpeFor(load, e) * 1.2, -mpeFor(load, e) * 1.2][i]
              : errorFor(scenario, mpeFor(load, e), e, i) * 0.35;
        push(
          load.toFixed(3),
          round(load + variation).toFixed(3)
        );
      }
      break;
    }

    case "DISCRIMINATION": {
      [max * 0.1, max * 0.5, max].forEach((load, i) => {
        const initial = round(load);
        const reduced = round(initial - d);
        const final =
          scenario === "near-mpe"
            ? round(initial + d)
            : scenario === "boundary"
              ? round(initial + d * 1.01)
              : round(initial + d);

        push(
          initial.toFixed(3),
          reduced.toFixed(3),
          final.toFixed(3)
        );
      });
      break;
    }

    case "ZERO_RETURN": {
      const drift = scenario === "fail" ? 0.75 * e : 0.2 * e;
      push(
        round(0.2 * e).toFixed(3),
        round(0.2 * e - drift).toFixed(3)
      );
      break;
    }

    case "CREEP": {
      const start = round(max * 0.98);
      const drift =
        scenario === "fail"
          ? 0.75 * e
          : scenario === "near-mpe"
            ? 0.45 * e
            : scenario === "boundary"
              ? 0.49 * e
              : 0.10 * e;

      push(
        start.toFixed(3),
        round(start + drift * 0.35).toFixed(3),
        round(start + drift).toFixed(3),
        mpeFor(start, e, accuracyClass(evaluation)).toFixed(3),
        round(start + drift * 1.2).toFixed(3)
      );
      break;
    }

    case "STABILITY_OF_EQUILIBRIUM":
      for (let i = 0; i < 5; i++) {
        const ok = !(scenario === "fail" && i === 2);
        push(
          ok ? "yes" : "no",
          round(max * 0.5 + i * d).toFixed(3),
          ok ? "yes" : "no",
          ok ? "yes" : "no"
        );
      }
      break;

    case "TARE": {
      const tareValues = [
        Math.max(e * 5, tare * 0.2),
        Math.max(e * 10, tare * 0.4),
        Math.max(e * 15, tare * 0.6),
        Math.max(e * 20, tare * 0.8),
        Math.max(e * 5, tare * 0.3),
      ];

      tareValues.forEach((tareValue, i) => {
        const gross = clamp(
          max * (0.35 + i * 0.1),
          min,
          max
        );
        const net = Math.max(min, gross - tareValue);
        const { error } = baseError(evaluation, net, scenario, i);

        push(
          round(gross).toFixed(3),
          round(tareValue).toFixed(3),
          round(gross + error).toFixed(3),
          round(net + error).toFixed(3),
          round(net).toFixed(3)
        );
      });
      break;
    }

    case "WARM_UP":
      [0, 5, 15, 30].forEach((_, i) => {
        const loadError =
          scenario === "fail" && i === 3
            ? 1.2 * e
            : i === 3
              ? 0.1 * e
              : 0.05 * e;
        push(
          round(0.05 * e).toFixed(3),
          round(loadError).toFixed(3),
          "no"
        );
      });
      break;

    case "TEMPERATURE":
      [-10, 5, 20, 40].forEach((temperature, i) => {
        const change =
          scenario === "fail" && i === 3
            ? 1.25 * e
            : [0.25, -0.2, 0.1, 0.2][i] * e;
        push(
          String(temperature),
          round(change).toFixed(3)
        );
      });
      break;

    case "VOLTAGE_VARIATION": {
      const voltages = [0.85, 0.95, 1.00, 1.10];
      voltages.forEach((multiplier, i) => {
        const load = i === 0 ? max * 0.5 : max;
        const { mpe } = baseError(evaluation, load, scenario, i);
        const error =
          scenario === "fail"
            ? mpe * 1.25
            : scenario === "near-mpe"
              ? mpe * 0.9
              : 0.2 * mpe;

        push(
          round(230 * multiplier).toFixed(2),
          round(load).toFixed(3),
          round(error).toFixed(3),
          round(mpe).toFixed(3),
          "yes"
        );
      });
      break;
    }

    case "TILTING":
      [0, 2, 4].forEach((angle, i) => {
        const load = max * 0.5;
        const { mpe } = baseError(evaluation, load, scenario, i);
        const error =
          scenario === "fail"
            ? mpe * 1.25
            : i * 0.2 * mpe;
        push(
          String(angle),
          round(error).toFixed(3),
          round(mpe).toFixed(3),
          scenario === "fail" ? "no" : "yes"
        );
      });
      break;

    case "DAMP_HEAT":
      push(
        scenario === "fail" ? "45" : "40",
        "85",
        "24",
        scenario === "fail" ? "no" : "yes",
        scenario === "fail" ? "no" : "yes",
        scenario === "fail"
          ? "Performance deviation observed during damp heat exposure."
          : "Instrument operated normally during damp heat exposure."
      );
      break;

    case "EMC": {
      const rows = [
        ["0.5 cycle", "Not applicable", 3, "yes", "No significant effect observed."],
        ["1 kV / 5 kHz", "Positive", 5, "yes", "No significant effect observed."],
        ["1 kV surge", "Both", 5, "yes", "No significant effect observed."],
        ["6 kV contact / 8 kV air", "Both", 10, "yes", "No significant effect observed."],
        ["10 V/m", "Positive", 3, "yes", "No significant effect observed."],
        ["10 V", "Positive", 3, "yes", "No significant effect observed."],
        ["ISO 7637-2 level", "Both", 3, "yes", "No significant effect observed."],
      ];

      rows.forEach((row, index) => {
        if (scenario === "fail" && index === 3) {
          push(
            row[0],
            row[1],
            row[2],
            "no",
            "Significant indication disturbance observed."
          );
        } else {
          push(...row);
        }
      });
      break;
    }

    case "SPAN_STABILITY":
      for (let i = 0; i < 8; i++) {
        const day = [0, 1, 3, 7, 10, 14, 21, 28][i];
        const zero = 0.05 * e;
        const load = max * 0.9;
        const { error } = baseError(evaluation, load, scenario, i);
        const loadError =
          scenario === "fail" && i === 7
            ? 1.25 * mpeFor(load, e, accuracyClass(evaluation))
            : error;

        push(
          String(day),
          round(zero).toFixed(3),
          round(load + loadError).toFixed(3),
          round(0).toFixed(3),
          round(load).toFixed(3)
        );
      }
      break;

    case "ENDURANCE":
      push(
        "100000",
        round(max * 0.5).toFixed(3),
        scenario === "fail" ? "0.100" : "0.010",
        scenario === "fail" ? "0.120" : "0.015",
        scenario === "fail" ? "0.150" : "0.020",
        scenario === "fail" ? "no" : "yes"
      );
      break;

    case "CONSTRUCTION_CHECKLIST": {
      const observations = [
        "Manufacturer marking verified on nameplate.",
        "Model/type designation clearly marked.",
        "Serial number uniquely identified.",
        "Accuracy class marking verified.",
        "Maximum capacity marking verified.",
        "Minimum capacity marking verified.",
        "Verification scale interval e marking verified.",
        "Security/sealing provision inspected and found intact.",
      ];

      observations.forEach((text, index) =>
        push(
          text,
          "Nameplate / inspection photograph",
          scenario === "fail" && index === 7 ? "no" : "yes"
        )
      );
      break;
    }

    default:
      break;
  }

  return {
    scenario,
    values,
  };
}

export function sampleInstrumentForm() {
  return sampleInstrument();
}

export function sampleEnvironmentForm() {
  return sampleEnvironment();
}

export function sampleTestForm(testCode, evaluation) {
  return generateTestControlValues(testCode, evaluation);
}

/*
 * React-controlled input helper. Using the native setter plus an input/change
 * event updates the same state handlers already used by the existing forms.
 */
function setReactControlValue(element, value) {
  const tag = element.tagName.toLowerCase();

  if (tag === "select") {
    element.value = String(value);
    element.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }

  if (element.type === "checkbox") {
    element.checked = Boolean(value);
    element.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }

  const prototype =
    element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;

  const descriptor = Object.getOwnPropertyDescriptor(
    prototype,
    "value"
  );

  if (descriptor?.set) {
    descriptor.set.call(element, String(value));
  } else {
    element.value = String(value);
  }

  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

export function applyTestSampleData(form, testCode, evaluation) {
  const controls = Array.from(
    form.querySelectorAll("input, select, textarea")
  ).filter((element) => !element.disabled && element.type !== "hidden");

  const { scenario, values } = generateTestControlValues(
    testCode,
    evaluation
  );

  controls.forEach((control, index) => {
    if (index < values.length) {
      setReactControlValue(control, values[index]);
    }
  });

  return {
    scenario,
    filled: Math.min(controls.length, values.length),
    total: controls.length,
  };
}
