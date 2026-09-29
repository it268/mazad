import { Link } from "@tanstack/react-router";

export default function Footer() {
  return (
    <footer className="mt-20 bg-navy-deep text-white/85">
      <div className="pattern-bg opacity-[0.06]" aria-hidden />
      <div className="container-x relative grid gap-10 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="" className="h-11 w-auto" />
            <span className="text-xl font-extrabold text-white">
              مزاد الفروسية
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-8">
            المزاد الذي يجمع البائع والمشتري في عالم خيل العرب الأصيلة — بعيداً
            عن العشوائية، وبثقة قبل أي صفقة.
          </p>
        </div>
        <div>
          <h4 className="mb-4 font-extrabold text-white">روابط سريعة</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link to="/horses" className="hover:text-orange-soft">
                الخيل المعروضة
              </Link>
            </li>
            <li>
              <Link to="/auctions" className="hover:text-orange-soft">
                المزادات المباشرة
              </Link>
            </li>
            <li>
              <Link to="/sell" className="hover:text-orange-soft">
                اعرض حصانك للبيع
              </Link>
            </li>
            <li>
              <Link to="/account" className="hover:text-orange-soft">
                حسابي
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 font-extrabold text-white">كيف نعمل</h4>
          <p className="text-sm leading-8">
            يعرض أصحاب الخيل أحصنتها للإدارة، وبعد المعاينة والموافقة تقوم
            الإدارة بعرضها للبيع المباشر أو في مزاد مباشر داخل المنصة، ويتم
            إتمام الصفقة والتسليم بالتنسيق المباشر مع الإدارة.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/60">
        © {new Date().getFullYear()} مزاد الفروسية — جميع الحقوق محفوظة
      </div>
    </footer>
  );
}
