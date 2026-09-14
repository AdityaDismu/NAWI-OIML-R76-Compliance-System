import {
  ArrowLeft,
  Scale,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import PageHeader from "../components/layout/PageHeader";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Loading from "../components/ui/Loading";

import {
  getInstrument,
} from "../api/instruments";


export default function InstrumentDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [instrument, setInstrument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {

    async function load() {

      try {
        setLoading(true);
        setError("");

        const data = await getInstrument(id);

        setInstrument(data);

      } catch (err) {

        setError(
          err.message ||
          "Failed to load instrument"
        );

      } finally {

        setLoading(false);

      }
    }

    load();

  }, [id]);


  if (loading) {
    return <Loading />;
  }


  if (error) {

    return (
      <Card>
        <p className="text-red-400">
          {error}
        </p>
      </Card>
    );

  }


  if (!instrument) {
    return null;
  }


  return (
    <div>

      {/* -------------------------------------------------------
          Back
      -------------------------------------------------------- */}

      <Button
        variant="ghost"
        onClick={() =>
          navigate("/instruments")
        }
        className="mb-5"
      >
        <ArrowLeft size={17} />
        Back to Instruments
      </Button>


      {/* -------------------------------------------------------
          Header
      -------------------------------------------------------- */}

      <PageHeader
        title={
          instrument.model ||
          instrument.model_type ||
          "Instrument"
        }
        description={`${instrument.manufacturer} · ${instrument.serial_number}`}
      />


      <div className="mt-6 grid gap-6 lg:grid-cols-3">


        {/* -----------------------------------------------------
            Instrument Information
        ------------------------------------------------------ */}

        <Card className="lg:col-span-2">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Scale size={23} />
            </div>


            <div>

              <h2 className="text-lg font-semibold text-white">
                Instrument Information
              </h2>


              <div className="mt-2 flex flex-wrap gap-2">

                <Badge>
                  {instrument.accuracy_class}
                </Badge>

                <Badge>
                  {instrument.category}
                </Badge>

                <Badge>
                  {instrument.indication_type}
                </Badge>

              </div>

            </div>

          </div>


          <div className="mt-7 grid gap-5 sm:grid-cols-2">

            <Info
              label="Manufacturer"
              value={instrument.manufacturer}
            />


            <Info
              label="Model / Type"
              value={
                instrument.model ||
                instrument.model_type
              }
            />


            <Info
              label="Serial Number"
              value={instrument.serial_number}
            />


            <Info
              label="Accuracy Class"
              value={instrument.accuracy_class}
            />


            <Info
              label="Instrument Category"
              value={instrument.category}
            />


            <Info
              label="Indication Type"
              value={instrument.indication_type}
            />


            <Info
              label="Software ID"
              value={instrument.software_identification}
            />


            <Info
              label="Software Version"
              value={instrument.software_version}
            />


            <Info
              label="Connected Modules"
              value={instrument.connected_modules}
            />

          </div>


          {instrument.notes && (

            <div className="mt-7 border-t border-border pt-5">

              <Info
                label="Notes"
                value={instrument.notes}
              />

            </div>

          )}

        </Card>


        {/* -----------------------------------------------------
            Weighing Ranges
        ------------------------------------------------------ */}

        <Card>

          <h2 className="font-semibold text-white">
            Weighing Ranges
          </h2>


          <div className="mt-5 space-y-4">

            {(instrument.ranges || []).length === 0 ? (

              <p className="text-sm text-slate-500">
                No weighing ranges have been registered.
              </p>

            ) : (

              (instrument.ranges || []).map(
                (range, index) => (

                  <div
                    key={range.id || index}
                    className="rounded-xl border border-border bg-slate-950/40 p-4"
                  >

                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      {formatRangeType(
                        range.range_type
                      )}
                    </p>


                    <div className="mt-4 grid grid-cols-2 gap-4">

                      <Info
                        label="Max"
                        value={formatNumber(
                          range.max_capacity
                        )}
                      />


                      <Info
                        label="Min"
                        value={formatNumber(
                          range.min_capacity
                        )}
                      />


                      <Info
                        label="e"
                        value={formatNumber(
                          range.verification_scale_interval
                        )}
                      />


                      <Info
                        label="d"
                        value={formatNumber(
                          range.actual_scale_interval
                        )}
                      />


                      <Info
                        label="Max Tare"
                        value={formatNumber(
                          range.maximum_tare
                        )}
                      />

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </Card>

      </div>

    </div>
  );
}


/* ----------------------------------------------------------------
   Helpers
----------------------------------------------------------------- */

function Info({ label, value }) {

  return (
    <div>

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-200">
        {value ?? "—"}
      </p>

    </div>
  );
}


function formatNumber(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  return Number(value).toFixed(3);
}


function formatRangeType(type) {

  if (type === "SINGLE_RANGE") {
    return "Single Range";
  }

  if (type === "MULTI_RANGE") {
    return "Multi Range";
  }

  if (type === "MULTI_INTERVAL") {
    return "Multi Interval";
  }

  return type || "Range";
}