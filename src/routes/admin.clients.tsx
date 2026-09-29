import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getPb } from "#/lib/pb";
import { fmtDateTime } from "#/lib/format";
import { Loading } from "#/components/ui";

export const Route = createFileRoute("/admin/clients")({
  component: AdminClients,
});

function AdminClients() {
  const pb = getPb();

  const q = useQuery({
    queryKey: ["admin-clients"],
    queryFn: () =>
      pb.collection("users").getFullList({
        filter: 'role="client"',
        sort: "-created",
      }),
    refetchInterval: 30_000,
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">العملاء</h1>
      <p className="mt-1 text-sm text-ink-soft">
        جميع المسجلين في المنصة كعملاء.
      </p>

      {q.isPending ? (
        <Loading />
      ) : (
        <div className="card mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-sand/50 text-start">
                <th className="px-4 py-3 text-start font-extrabold">الاسم</th>
                <th className="px-4 py-3 text-start font-extrabold">الجوال</th>
                <th className="px-4 py-3 text-start font-extrabold">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody>
              {(q.data || []).map((u: any) => (
                <tr key={u.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-bold text-ink">{u.name || "-"}</td>
                  <td className="px-4 py-3">
                    <span className="latin" dir="ltr">
                      {u.phone}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{fmtDateTime(u.created)}</td>
                </tr>
              ))}
              {(q.data || []).length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-ink-soft">
                    لا يوجد عملاء مسجلون بعد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
