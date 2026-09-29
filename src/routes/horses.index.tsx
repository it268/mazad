import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchSaleListings } from "#/lib/api";
import { SaleCard } from "#/components/cards";
import { EmptyState, Loading, PageHero } from "#/components/ui";
import { breedOptions, genderLabels } from "#/lib/constants";

export const Route = createFileRoute("/horses/")({
  validateSearch: (search: Record<string, unknown>) => ({
    gender: (search.gender as string) || undefined,
    breed: (search.breed as string) || undefined,
    maxPrice: (search.maxPrice as string) || undefined,
  }),
  component: HorsesPage,
});

function HorsesPage() {
  const { gender, breed, maxPrice } = Route.useSearch();
  const navigate = Route.useNavigate();

  const setFilter = (patch: Record<string, string>) =>
    navigate({ search: { ...Route.useSearch(), ...patch } });

  const q = useQuery({
    queryKey: ["sales", { gender, breed, maxPrice }],
    queryFn: () =>
      fetchSaleListings({
        gender: gender || undefined,
        breed: breed || undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        perPage: 24,
      }),
    placeholderData: (prev) => prev,
  });

  return (
    <div>
      <PageHero
        eyebrow="معروضات الإدارة"
        title="خيل معروضة للبيع"
        sub="خيل منتقاة ومعتمدة من الإدارة للبيع المباشر — الجودة قبل الكمية."
      />

      <section className="container-x py-10">
        <div className="card mb-8 flex flex-wrap items-end gap-4 p-5">
          <div className="w-40">
            <label className="label">النوع</label>
            <select
              className="field"
              value={gender}
              onChange={(e) => setFilter({ gender: e.target.value })}
            >
              <option value="">الكل</option>
              {Object.entries(genderLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="w-40">
            <label className="label">السلالة</label>
            <select
              className="field"
              value={breed}
              onChange={(e) => setFilter({ breed: e.target.value })}
            >
              <option value="">الكل</option>
              {breedOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div className="w-44">
            <label className="label">أقصى سعر (ر.س)</label>
            <input
              className="field tabular-nums"
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => setFilter({ maxPrice: e.target.value })}
              placeholder="بدون حد"
            />
          </div>
          {(gender || breed || maxPrice) && (
            <button
              className="btn btn-ghost-dark !py-2.5"
              onClick={() => navigate({ search: {} })}
            >
              مسح الفلاتر
            </button>
          )}
        </div>

        {q.isPending ? (
          <Loading />
        ) : q.data && q.data.items.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {q.data.items.map((l) => (
              <SaleCard key={l.id} listing={l} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="لا توجد نتائج مطابقة"
            sub="جرّب تعديل الفلاتر أو عد لاحقاً — تُضاف معروضات جديدة باستمرار."
            action={
              <Link to="/sell" className="btn btn-primary mt-2">
                اعرض حصانك للبيع
              </Link>
            }
          />
        )}
      </section>
    </div>
  );
}
