import { useEffect, useState } from "react";
import { Landmark, Search, SlidersHorizontal, CheckCircle2, Users, FileText, ExternalLink, ShieldCheck } from "lucide-react";
import Card, { CardHeader } from "../components/Card";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import Disclaimer from "../components/Disclaimer";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import { getSchemes, getSchemesMeta, getSchemeById } from "../services/schemesService";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { cn } from "../utils/cn";

const CATEGORY_TONES = { Central: "brand", State: "neutral", Agriculture: "sky", "Farmer Support": "amber" };
const getErrorMessage = (error) => error.response?.data?.message || error.message || "Unable to load government schemes.";

export default function Schemes() {
  useDocumentTitle("Government Schemes");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);
  const [schemes, setSchemes] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 6, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
  const limit = 6;

  useEffect(() => {
    let active = true;
    getSchemesMeta().then((data) => {
      if (active && data.categories?.length) setCategories(data.categories);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const response = await getSchemes({ search: search.trim(), category, page, limit });
        if (!active) return;
        setSchemes(response.data.schemes || []);
        setMeta(response.meta || { total: 0, page, limit, totalPages: 1 });
        if (response.data.categories?.length) setCategories(response.data.categories);
      } catch (error) {
        if (active) { setSchemes([]); setErrorMessage(getErrorMessage(error)); }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [search, category, page, reloadToken]);

  const openDetails = async (id) => {
    setSelectedScheme(null);
    setDetailError("");
    setDetailLoading(true);
    try { setSelectedScheme(await getSchemeById(id)); }
    catch (error) { setDetailError(getErrorMessage(error)); }
    finally { setDetailLoading(false); }
  };

  const clearFilters = () => { setSearch(""); setCategory("All"); setPage(1); };

  return (
    <>
      <PageHeader eyebrow="Farmer Support" title="Government Schemes" description="Browse backend scheme reference records and verify current details through the listed official channels." icon={Landmark} />
      <Card className="mb-6">
        <CardHeader title="Search Schemes" description="Search by scheme name, ministry, category, or keyword." icon={SlidersHorizontal} />
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <label htmlFor="scheme-search" className="sr-only">Search schemes</label>
          <input id="scheme-search" type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="e.g. insurance, soil, credit" className="h-11 w-full rounded-xl border border-line bg-white pl-10 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted/70 focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {categories.map((option) => <button key={option} type="button" onClick={() => { setCategory(option); setPage(1); }} aria-pressed={category === option} className={cn("rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors", category === option ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white text-ink-soft hover:border-brand-300 hover:text-brand-800")}>{option}</button>)}
        </div>
        <Disclaimer className="mt-4" tone="sky" text="These are curated backend reference records, not a live government feed. Scheme rules, benefits, deadlines, and eligibility can change; confirm them through the official channel shown." />
      </Card>

      <p className="mb-4 text-sm text-ink-muted">Showing <span className="font-semibold text-brand-800">{schemes.length}</span> of {meta.total || 0} scheme records{category !== "All" ? ` in ${category}` : ""}</p>
      {loading ? <Card><LoadingState label="Loading government schemes..." rows={3} /></Card> :
      errorMessage ? <Card><p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{errorMessage}</p><Button className="mt-4" onClick={() => setReloadToken((current) => current + 1)}>Retry</Button></Card> :
      schemes.length === 0 ? <EmptyState icon={Search} title="No schemes found" description="No backend scheme record matches your search or category filter." actionLabel="Clear filters" onAction={clearFilters} /> :
      <>
        <div className="grid gap-5 sm:grid-cols-2">
          {schemes.map((scheme) => <Card key={scheme.id} className="flex flex-col">
            <div className="flex items-start justify-between gap-2"><Badge tone={CATEGORY_TONES[scheme.category] || "brand"}>{scheme.category}</Badge>{scheme.verification ? <Badge tone={scheme.verification.status === "official-portal" ? "brand" : "amber"}>{scheme.verification.status === "official-portal" ? "Official portal" : "Verify details"}</Badge> : null}</div>
            <h3 className="mt-3 font-display text-base font-bold leading-snug text-brand-950">{scheme.title}</h3>
            <p className="mt-1 text-xs font-medium text-ink-muted">{scheme.authority}</p>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{scheme.summary}</p>
            {scheme.benefits?.length ? <ul className="mt-4 space-y-1.5">{scheme.benefits.slice(0, 2).map((benefit) => <li key={benefit} className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-brand-600" /><span className="text-xs leading-relaxed text-ink-muted">{benefit}</span></li>)}</ul> : null}
            <div className="mt-5 flex items-center justify-between gap-3"><Button size="sm" onClick={() => openDetails(scheme.id)}>View Details</Button>{scheme.verification?.lastReviewed ? <span className="text-[11px] text-ink-muted">Reviewed {scheme.verification.lastReviewed}</span> : null}</div>
          </Card>)}
        </div>
        {meta.totalPages > 1 ? <div className="mt-6 flex items-center justify-center gap-3"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</Button><span className="text-sm text-ink-muted">Page {meta.page} of {meta.totalPages}</span><Button size="sm" variant="outline" disabled={page >= meta.totalPages} onClick={() => setPage((current) => current + 1)}>Next</Button></div> : null}
      </>}

      <Modal open={Boolean(selectedScheme) || detailLoading || Boolean(detailError)} onClose={() => { setSelectedScheme(null); setDetailError(""); }} title={selectedScheme?.title || "Scheme Details"} footer={<Button fullWidth variant="outline" onClick={() => { setSelectedScheme(null); setDetailError(""); }}>Close</Button>}>
        {detailLoading ? <LoadingState label="Loading scheme details..." rows={3} /> : detailError ? <p role="alert" className="text-sm text-red-700">{detailError}</p> : selectedScheme ? <>
          <div className="flex flex-wrap gap-2"><Badge tone={CATEGORY_TONES[selectedScheme.category] || "brand"}>{selectedScheme.category}</Badge><Badge tone="neutral">{selectedScheme.authority}</Badge></div>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">{selectedScheme.summary}</p>
          {selectedScheme.verification ? <div className="mt-4 rounded-xl border border-line bg-surface p-3 text-xs leading-relaxed text-ink-muted"><ShieldCheck size={14} className="mr-1 inline" />{selectedScheme.verification.note} Last reviewed: {selectedScheme.verification.lastReviewed || "Unavailable"}.</div> : null}
          {selectedScheme.benefits?.length ? <section><h4 className="mt-5 flex items-center gap-2 text-sm font-semibold text-brand-950"><CheckCircle2 size={15} className="text-brand-600" />Benefits</h4><ul className="mt-2 space-y-1.5">{selectedScheme.benefits.map((item) => <li key={item} className="flex items-start gap-2 text-sm"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />{item}</li>)}</ul></section> : null}
          {selectedScheme.eligibility?.length ? <section><h4 className="mt-5 flex items-center gap-2 text-sm font-semibold text-brand-950"><Users size={15} className="text-sky-deep" />Eligibility</h4><ul className="mt-2 space-y-1.5">{selectedScheme.eligibility.map((item) => <li key={item} className="flex items-start gap-2 text-sm"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-deep" />{item}</li>)}</ul></section> : null}
          {selectedScheme.documents?.length ? <section><h4 className="mt-5 flex items-center gap-2 text-sm font-semibold text-brand-950"><FileText size={15} />Documents</h4><ul className="mt-2 space-y-1.5">{selectedScheme.documents.map((item) => <li key={item} className="text-sm text-ink-soft">• {item}</li>)}</ul></section> : null}
          {selectedScheme.applicationMode ? <p className="mt-5 rounded-xl border border-line bg-surface p-3.5 text-sm text-ink-soft"><strong>Application channel:</strong> {selectedScheme.applicationMode}</p> : null}
          {selectedScheme.officialWebsite ? <a href={selectedScheme.officialWebsite} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-900">Official website <ExternalLink size={14} /></a> : null}
          <Disclaimer className="mt-4" text="KhetiGPT does not accept applications. Verify current details on the official website or with a local agriculture office." />
        </> : null}
      </Modal>
    </>
  );
}
