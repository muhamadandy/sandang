import { APP_NAME } from "@/lib/constants";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t bg-muted">
      <div className="wrapper py-6 text-center text-sm text-muted-foreground">
        &copy; {currentYear} {APP_NAME}. Hak cipta dilindungi.
      </div>
    </footer>
  );
};

export default Footer;
