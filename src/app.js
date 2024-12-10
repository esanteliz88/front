import express from "express";
import path from "path";
import session from "express-session";
import flash from "express-flash";
import dotenv from "dotenv";
import routes from "./routes/routes.js";
import routesLogin from "./routes/routesLogin.js";
import requireAuth from "./middlewares/auth.js";

dotenv.config(); // Cargar variables de entorno

const app = express();

// Configuración del motor de vistas EJS
app.set("views", path.join(process.cwd(), "src", "views"));
app.set("view engine", "ejs");

// Configuración de la sesión en memoria (no persistente)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "Turistik", // Usa un secreto fuerte en producción
    resave: false, // No guarda la sesión si no hay cambios
    saveUninitialized: false, // No guarda sesiones vacías
    cookie: {
      secure: process.env.NODE_ENV === "production", // Usa cookies seguras solo en producción
      httpOnly: true, // Protege las cookies contra acceso desde JavaScript
      maxAge: 1000 * 60 * 60 * 24, // Duración: 1 día
    },
  })
);

// Inicializa flash para mensajes temporales
app.use(flash());

// Middleware para pasar mensajes flash a las vistas
app.use((req, res, next) => {
  res.locals.successMessage = req.flash("successMessage")[0] || "";
  res.locals.errorMessage = req.flash("errorMessage")[0] || "";
  next();
});

// Middleware para parsear JSON y datos codificados en URL
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(process.cwd(), "src", "public")));

// Middleware global para autenticación
app.use((req, res, next) => {
  // Define variables globales para las vistas
  res.locals.currentUrl = req.originalUrl; // Guarda la URL actual
  res.locals.user = req.session.user || null; // Usuario autenticado

  // Excepciones: rutas públicas y de login
  if (req.path === "/login" || req.path.startsWith("/public")) {
    return next();
  }

  // Aplica autenticación para el resto de las rutas
  requireAuth(req, res, next);
});

// Rutas públicas y de login
app.use(routesLogin);

// Rutas protegidas
app.use(routes);

// Manejo de rutas no encontradas
app.get("*", (req, res) => {
  res.status(404).render("error/404", { ruta: req.originalUrl });
});

// Iniciar el servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});

export default app;
