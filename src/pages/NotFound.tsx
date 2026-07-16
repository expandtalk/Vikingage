import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const t =
    language === "sv"
      ? { title: "Sidan hittades inte", body: "Sidan du letar efter finns inte.", home: "Till startsidan" }
      : { title: "Page not found", body: "The page you are looking for does not exist.", home: "Back to home" };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white px-4">
      <div className="text-center">
        <div className="text-7xl font-bold text-orange-500 mb-2">404</div>
        <h1 className="text-2xl font-semibold mb-2">{t.title}</h1>
        <p className="text-slate-400 mb-6">{t.body}</p>
        <Button asChild className="bg-orange-600 hover:bg-orange-700">
          <Link to="/">
            <Home className="h-4 w-4 mr-2" />
            {t.home}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
