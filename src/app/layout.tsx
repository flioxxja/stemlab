import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STEMLab — Laboratorio interactivo de física y matemáticas",
  description: "Simulaciones interactivas, retos y explicaciones paso a paso para aprender STEM jugando.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
