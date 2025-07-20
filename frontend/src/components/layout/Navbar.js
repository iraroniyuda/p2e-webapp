"use client";
import "bootstrap/dist/css/bootstrap.min.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Dropdown, Nav, Navbar, Offcanvas } from "react-bootstrap";

export default function AppNavbar() {
  const router = useRouter();
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [language, setLanguage] = useState("id");

  useEffect(() => {
    // Load Google Font
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Load language from localStorage
    if (typeof window !== "undefined") {
      const lang = localStorage.getItem("lang") || "id";
      setLanguage(lang);
    }

    // Scroll Listener
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigateTo = (path) => {
    router.push(path);
    setShowOffcanvas(false);
  };

  const toggleOffcanvas = () => setShowOffcanvas(!showOffcanvas);
  const closeOffcanvas = () => setShowOffcanvas(false);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem("lang", lang);
    window.location.reload();
  };

  const labels = {
    home: language === "id" ? "Beranda" : "Home",
    about: language === "id" ? "Tentang" : "About",
    contact: language === "id" ? "Kontak" : "Contact",
    signIn: language === "id" ? "Masuk" : "Sign In",
    menu: language === "id" ? "Menu" : "Menu",
  };

  return (
    <>
      <Navbar
        expand="lg"
        className={`px-4 py-3 fixed-top ${scrolled ? "scrolled-navbar" : "transparent-navbar"}`}
        style={{
          background: scrolled
            ? "rgba(255, 255, 255, 0.9)"
            : "linear-gradient(180deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0))",
          backdropFilter: "blur(12px)",
          fontWeight: "bold",
          fontFamily: "'Poppins', sans-serif",
          transition: "background-color 0.3s ease, box-shadow 0.3s ease",
          zIndex: 10,
        }}
      >
        <Navbar.Brand
          className="d-flex align-items-center cursor-pointer"
          onClick={() => navigateTo("/")}
          style={{ color: scrolled ? "#444" : "#fff", fontSize: "1.4rem" }}
        >
          <img
            src="/tbplogo.png"
            alt="Logo"
            className="me-2"
            style={{ height: "48px" }}
          />
        </Navbar.Brand>
        <Navbar.Toggle onClick={toggleOffcanvas} />
        <Navbar.Collapse className="justify-content-end">
          <Nav className="d-none d-lg-flex gap-4 align-items-center">
            <Nav.Link onClick={() => navigateTo("/")} style={{ color: scrolled ? "#444" : "#fff", fontSize: "1rem" }}>
              {labels.home}
            </Nav.Link>
            <Nav.Link onClick={() => navigateTo("/about")} style={{ color: scrolled ? "#444" : "#fff", fontSize: "1rem" }}>
              {labels.about}
            </Nav.Link>
            <Nav.Link onClick={() => navigateTo("/contact")} style={{ color: scrolled ? "#444" : "#fff", fontSize: "1rem" }}>
              {labels.contact}
            </Nav.Link>
            {/* Dropdown Bahasa - Desktop */}
            <Dropdown align="end">
              <Dropdown.Toggle
                variant={scrolled ? "outline-dark" : "outline-light"}
                id="dropdown-lang"
                className="fw-bold d-flex align-items-center"
                style={{
                  minWidth: 80,
                  fontSize: "1rem",
                  padding: "6px 14px",
                  gap: 8,
                }}
              >
                <img
                  src={language === "id" ? "/flags/id.png" : "/flags/gb.png"}
                  alt={language === "id" ? "Indonesia" : "English"}
                  width={22}
                  height={16}
                  style={{ borderRadius: 2, marginRight: 6 }}
                />
                <span style={{ fontWeight: 600 }}>{language === "id" ? "ID" : "EN"}</span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleLanguageChange("id")}>
                  <img src="/flags/id.png" alt="Indonesia" width={22} height={16} style={{ borderRadius: 2, marginRight: 8 }} />
                  Indonesia
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleLanguageChange("en")}>
                  <img src="/flags/gb.png" alt="English" width={22} height={16} style={{ borderRadius: 2, marginRight: 8 }} />
                  English
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Button
              variant={scrolled ? "outline-dark" : "outline-light"}
              onClick={() => navigateTo("/signin")}
              className="fw-bold px-4 py-2 hover-shadow"
            >
              {labels.signIn}
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      {/* Offcanvas Navbar Mobile */}
      <Offcanvas
        show={showOffcanvas}
        onHide={closeOffcanvas}
        placement="end"
        className="bg-light text-dark offcanvas-animated"
        style={{ backdropFilter: "blur(10px)" }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="d-flex align-items-center">
            <img src="/tbplogo.png" alt="Logo" style={{ height: "32px" }} className="me-2" />
            <span style={{ fontSize: "1.2rem", fontWeight: "600" }}>{labels.menu}</span>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            <Nav.Link onClick={() => navigateTo("/")} className="text-dark fw-semibold py-2">
              {labels.home}
            </Nav.Link>
            <Nav.Link onClick={() => navigateTo("/about")} className="text-dark fw-semibold py-2">
              {labels.about}
            </Nav.Link>
            <Nav.Link onClick={() => navigateTo("/contact")} className="text-dark fw-semibold py-2">
              {labels.contact}
            </Nav.Link>
            <Button variant="dark" onClick={() => navigateTo("/signin")} className="w-100 fw-bold mt-3">
              {labels.signIn}
            </Button>
            {/* Dropdown Bahasa - Mobile */}
            <div className="mt-4">
              <Dropdown>
                <Dropdown.Toggle
                  variant="outline-dark"
                  id="dropdown-lang-mobile"
                  className="w-100 fw-bold d-flex align-items-center gap-2"
                  style={{ fontSize: "1rem", padding: "6px 14px" }}
                >
                  <img
                    src={language === "id" ? "/flags/id.png" : "/flags/gb.png"}
                    alt={language === "id" ? "Indonesia" : "English"}
                    width={22}
                    height={16}
                    style={{ borderRadius: 2, marginRight: 8 }}
                  />
                  <span style={{ fontWeight: 600 }}>{language === "id" ? "Indonesia" : "English"}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="w-100">
                  <Dropdown.Item onClick={() => handleLanguageChange("id")}>
                    <img src="/flags/id.png" alt="Indonesia" width={22} height={16} style={{ borderRadius: 2, marginRight: 8 }} />
                    Indonesia
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleLanguageChange("en")}>
                    <img src="/flags/gb.png" alt="English" width={22} height={16} style={{ borderRadius: 2, marginRight: 8 }} />
                    English
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Style for hover effects */}
      <style jsx>{`
        .hover-shadow:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          transform: scale(1.02);
        }
        .scrolled-navbar {
          background: rgba(255, 255, 255, 0.9) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .transparent-navbar {
          color: #fff;
        }
      `}</style>
    </>
  );
}
