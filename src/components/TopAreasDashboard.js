import React, { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import supabase from '../supabaseClient';
import TopNBarChart from './TopNBarChart';

// Minimal CSV parser that supports quoted fields with commas
function parseCSV(csvText) {
  const rows = [];
  let current = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < csvText.length; i += 1) {
    const ch = csvText[i];
    const next = csvText[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i += 1; // skip escaped quote
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        current.push(field);
        field = '';
      } else if (ch === '\n') {
        current.push(field);
        rows.push(current);
        current = [];
        field = '';
      } else if (ch === '\r') {
        // ignore
      } else {
        field += ch;
      }
    }
  }
  // push last field/row
  current.push(field);
  if (current.length > 1 || current[0] !== '') rows.push(current);
  return rows;
}

// Builds a top-N ranking of places for a given observation name using the most recent year per place
function toNumeric(value) {
  if (value === null || value === undefined) return NaN;
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return NaN;
    const lower = trimmed.toLowerCase();
    if (['na', 'n/a', 'none', 'null', '-', '--', '.', '..', 'suppressed'].includes(lower)) return NaN;
    const cleaned = trimmed.replace(/[,%£$]/g, '');
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : NaN;
  }
  return NaN;
}

function computeTopNAndLowestByPlace(observations, n = 10, options = {}) {
  const {
    useNormalized = false,
    minBaseForNormalized = 10,
    populationsByName,
    populationsByCode,
    perFactor = 100000,
  } = options;
  // observations expected fields: place, name, year (or date), value
  // Determine year from provided fields
  const normalized = observations.map((o) => ({
    place: o.place,
    code: o.code || o.place_code || o.la_code || undefined,
    name: o.name,
    year: o.year ?? (o.date ? new Date(o.date).getFullYear() : undefined),
    value: toNumeric(o.value),
    // norm is not trusted; derive using population CSV when requested
    norm: undefined,
  }));

  // Group by place -> name -> keep most recent year value
  const placeToValue = new Map();
  for (const obs of normalized) {
    if (!obs.place) continue;
    const baseValue = obs.value;
    let selectedValue = baseValue;
    if (useNormalized) {
      const nameKey = obs.place ? obs.place.toString().trim().toLowerCase() : undefined;
      const codeKey = obs.code ? obs.code.toString().trim().toUpperCase() : undefined;
      const pop =
        (codeKey && populationsByCode ? populationsByCode.get(codeKey) : undefined) ??
        (nameKey && populationsByName ? populationsByName.get(nameKey) : undefined);
      if (!Number.isFinite(baseValue) || baseValue < minBaseForNormalized) continue;
      if (!Number.isFinite(pop) || pop <= 0) continue;
      selectedValue = (baseValue / pop) * perFactor;
    }
    if (!Number.isFinite(selectedValue) || selectedValue === 0) continue;
    const key = `${obs.name}||${obs.place}`;
    const existing = placeToValue.get(key);
    if (!existing || (Number.isFinite(obs.year) && obs.year > existing.year)) {
      placeToValue.set(key, { year: obs.year ?? null, value: selectedValue, place: obs.place, name: obs.name });
    }
  }

  // Sum per place across all names? For ranking per observation name we return map per name
  const nameToPlaces = new Map();
  for (const { name, place, value } of placeToValue.values()) {
    if (!nameToPlaces.has(name)) nameToPlaces.set(name, new Map());
    nameToPlaces.get(name).set(place, value);
  }

  // Build arrays and sort descending by value, take top N
  const result = {};
  for (const [name, placeMap] of nameToPlaces.entries()) {
    const sorted = Array.from(placeMap.entries())
      .map(([place, value]) => ({ label: place, value }))
      .sort((a, b) => b.value - a.value)
    const top = sorted.slice(0, n);
    const bottom = sorted.slice(-n).sort((a, b) => a.value - b.value);
    const spread = sorted.length ? (sorted[0].value - sorted[sorted.length - 1].value) : 0;
    result[name] = { top, bottom, spread };
  }
  return result;
}

function TopAreasDashboard() {
  const [placeDatasets, setPlaceDatasets] = useState([]);
  const [selectedDatasets, setSelectedDatasets] = useState([]); // multi-select
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [regionOptions, setRegionOptions] = useState(['All']);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [useNormalized, setUseNormalized] = useState(false);
  const [minBaseForNormalized, setMinBaseForNormalized] = useState(10);
  const [populationsByName, setPopulationsByName] = useState();
  const [populationsByCode, setPopulationsByCode] = useState();
  const perFactor = 100000; // per 100k

  useEffect(() => {
    async function init() {
      setLoading(true);
      setError(null);
      try {
        // Fetch place datasets
        const { data: datasets, error: dsErr } = await supabase
          .from('datasets')
          .select('id, title, type')
          .eq('type', 'place');
        if (dsErr) throw dsErr;
        const options = (datasets || []).map((d) => ({ value: d.id, label: d.title }));
        setPlaceDatasets(options);
        if (options.length > 0) setSelectedDatasets([options[0]]);

        // Regions for filtering
        const { data: regionsData, error: rErr } = await supabase
          .from('observations')
          .select('region', { distinct: true });
        if (!rErr && regionsData) {
          setRegionOptions(['All', ...Array.from(new Set(regionsData.map((r) => r.region))).filter(Boolean)]);
        }
      } catch (e) {
        setError('Failed to load datasets');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Load population CSV from public folder and build lookup maps
  useEffect(() => {
    async function loadPopulation() {
      try {
        const url = encodeURI(`${process.env.PUBLIC_URL}/ukmidyearestimates20192020ladcodes (1).csv`);
        const res = await fetch(url);
        if (!res.ok) return;
        const text = await res.text();
        const rows = parseCSV(text);
        // Find header row with Code, Name
        let headerIdx = -1;
        for (let i = 0; i < rows.length; i += 1) {
          const r = rows[i];
          if (!r || r.length < 3) continue;
          const c0 = (r[0] || '').trim();
          const c1 = (r[1] || '').trim();
          if (c0 === 'Code' && c1 === 'Name') {
            headerIdx = i;
            break;
          }
        }
        if (headerIdx === -1) return;
        const header = rows[headerIdx].map((h) => (h || '').replace(/\s+/g, ' ').trim());
        const codeIdx = header.indexOf('Code');
        const nameIdx = header.indexOf('Name');
        const popIdx = header.indexOf('Estimated Population mid-2019');
        if (codeIdx === -1 || nameIdx === -1 || popIdx === -1) return;
        const byName = new Map();
        const byCode = new Map();
        for (let i = headerIdx + 1; i < rows.length; i += 1) {
          const r = rows[i];
          if (!r || r.length <= popIdx) continue;
          const code = (r[codeIdx] || '').trim();
          const name = (r[nameIdx] || '').trim();
          const popRaw = (r[popIdx] || '').replace(/[\s,]/g, '');
          const pop = Number(popRaw);
          if (!name || !Number.isFinite(pop) || pop <= 0) continue;
          byName.set(name.toLowerCase(), pop);
          if (code) byCode.set(code.toUpperCase(), pop);
        }
        setPopulationsByName(byName);
        setPopulationsByCode(byCode);
      } catch (_) {
        // ignore
      }
    }
    loadPopulation();
  }, []);

  useEffect(() => {
    async function fetchObs() {
      if (!selectedDatasets || selectedDatasets.length === 0) return;
      setLoading(true);
      setError(null);
      try {
        const allData = [];
        for (const ds of selectedDatasets) {
          let query = supabase.from('observations').select('*').eq('dataset_id', ds.value);
          if (selectedRegion !== 'All') {
            query = query.eq('region', selectedRegion);
          }
          const { data, error: oErr } = await query;
          if (oErr) throw oErr;
          // annotate with dataset label to disambiguate same observation names across datasets
          (data || []).forEach((row) => {
            allData.push({ ...row, name: row.name || row.observation || '', name_full: `${row.name || row.observation || ''} — ${ds.label}` });
          });
        }
        setObservations(allData);
      } catch (e) {
        setError('Failed to load observations');
      } finally {
        setLoading(false);
      }
    }
    fetchObs();
  }, [selectedDatasets, selectedRegion]);

  const rankingByObservation = useMemo(
    () =>
      computeTopNAndLowestByPlace(
        // if multiple datasets, use the annotated name_full if available so charts separate series
        observations.map((o) => ({ ...o, name: o.name_full || o.name })),
        10,
        {
          useNormalized,
          minBaseForNormalized,
          populationsByName,
          populationsByCode,
          perFactor,
        }
      ),
    [observations, useNormalized, minBaseForNormalized, populationsByName, populationsByCode]
  );

  return (
    <div className="bg-slate-50 p-4 md:p-6 m-4 md:m-6 rounded">
      <h2 className="text-2xl font-bold mb-4">Top 10 Areas by Need</h2>

      <div className="flex flex-col md:flex-row gap-3 md:items-end mb-6">
        <div className="min-w-[280px]">
          <label className="block text-sm font-medium mb-1">Datasets</label>
          <Select
            options={placeDatasets}
            value={selectedDatasets}
            onChange={(vals) => setSelectedDatasets(vals || [])}
            isMulti
            placeholder="Select one or more datasets"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Region</label>
          <select
            className="border rounded px-3 py-2"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            {regionOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <input
            id="normalize"
            type="checkbox"
            className="h-4 w-4"
            checked={useNormalized}
            onChange={(e) => setUseNormalized(e.target.checked)}
          />
          <label htmlFor="normalize" className="text-sm">Normalise by population (per 100k using public CSV)</label>
        </div>
        {useNormalized && (
          <div className="flex items-center gap-2">
            <label htmlFor="minBase" className="text-sm">Min base value</label>
            <input
              id="minBase"
              type="number"
              className="border rounded px-2 py-1 w-24"
              value={minBaseForNormalized}
              onChange={(e) => setMinBaseForNormalized(Number(e.target.value) || 0)}
              min={0}
            />
          </div>
        )}
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="flex flex-col gap-10">
          {Object.keys(rankingByObservation).length === 0 && <p>No data to display.</p>}
          {Object.entries(rankingByObservation).map(([name, payload]) => (
            <div key={name} className="flex flex-col gap-4">
              <div className="flex items-baseline gap-3">
                <h3 className="text-xl font-bold">{name}</h3>
                <span className="text-sm text-slate-600">Spread (max - min): {new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 }).format(payload.spread)}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TopNBarChart
                  title="Top 10 areas"
                  subtitle={useNormalized ? 'Highest values per 100k population' : 'Highest values'}
                  items={payload.top}
                  barColor="#662583"
                />
                <TopNBarChart
                  title="Lowest 10 areas"
                  subtitle={useNormalized ? 'Lowest values per 100k population' : 'Lowest values'}
                  items={payload.bottom}
                  barColor="#EE4023"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TopAreasDashboard;


