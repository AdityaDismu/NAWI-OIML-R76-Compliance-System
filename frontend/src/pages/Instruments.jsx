import { Plus, Search, RefreshCw, Scale } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "../components/layout/PageHeader";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import Loading from "../components/ui/Loading";
import EmptyState from "../components/ui/EmptyState";
import InstrumentCard from "../components/instruments/InstrumentCard";
import { useInstruments } from "../hooks/useInstruments";

export default function Instruments() {
  const navigate = useNavigate();

  const { instruments, loading, error, reload } = useInstruments();

  const [search, setSearch] = useState("");

  const filteredInstruments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return instruments;

    return instruments.filter((instrument) => {
      return [
        instrument.manufacturer,
        instrument.model,
        instrument.serial_number,
        instrument.accuracy_class,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        );
    });
  }, [instruments, search]);

  return (
    <div>
      <PageHeader
        title="Instruments"
        description="Manage registered non-automatic weighing instruments and their technical parameters."
        action={
          <Button onClick={() => navigate("/instruments/new")}>
            <Plus size={18} />
            New Instrument
          </Button>
        }
      />

      <div className="mt-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <Input
            className="pl-10"
            placeholder="Search manufacturer, model, serial number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Button variant="secondary" onClick={reload}>
          <RefreshCw size={17} />
          Refresh
        </Button>
      </div>

      {loading && (
        <div className="mt-8">
          <Loading />
        </div>
      )}

      {!loading && error && (
        <Card className="mt-8">
          <p className="text-sm text-red-400">{error}</p>

          <Button
            className="mt-4"
            variant="secondary"
            onClick={reload}
          >
            Try Again
          </Button>
        </Card>
      )}

      {!loading && !error && filteredInstruments.length === 0 && (
        <div className="mt-8">
          <EmptyState
            icon={Scale}
            title={search ? "No instruments found" : "No instruments yet"}
            description={
              search
                ? "Try a different search term."
                : "Register your first weighing instrument to begin an evaluation."
            }
            action={
              !search && (
                <Button onClick={() => navigate("/instruments/new")}>
                  <Plus size={18} />
                  Add Instrument
                </Button>
              )
            }
          />
        </div>
      )}

      {!loading && !error && filteredInstruments.length > 0 && (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredInstruments.map((instrument) => (
            <InstrumentCard
              key={instrument.id}
              instrument={instrument}
            />
          ))}
        </div>
      )}
    </div>
  );
}