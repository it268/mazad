import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "#/lib/query";
import Header from "#/components/Header";
import Footer from "#/components/Footer";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title: "مزاد الفروسية | سوق ومزادات خيل العرب الأصيلة",
      },
      {
        name: "description",
        content:
          "منصة مزادات وبيع وشراء خيل العرب الأصيلة: اعرض حصانك للبيع، زايد في المزادات المباشرة، واشترِ بثقة وأمان.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;600;700;800;900&family=Montserrat:wght@600;700;800&family=Quicksand:wght@500;600;700&display=swap",
      },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={getQueryClient()}>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              <Outlet />
            </main>
            <Footer />
          </div>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}
