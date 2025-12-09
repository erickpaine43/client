import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Footer from "../footer";

describe("Footer", () => {
  it("renders copyright text with current year", () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`${currentYear} Penguin Mails`))
    ).toBeInTheDocument();
  });

  it("displays all navigation links", () => {
    render(<Footer />);

    expect(
      screen.getByRole("link", { name: /terms of service/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /privacy policy/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /contact us/i })
    ).toBeInTheDocument();
  });

  it("has correct href for terms link", () => {
    render(<Footer />);

    const termsLink = screen.getByRole("link", { name: /terms of service/i });
    expect(termsLink).toHaveAttribute("href", "/terms");
  });

  it("has correct href for privacy link", () => {
    render(<Footer />);

    const privacyLink = screen.getByRole("link", { name: /privacy policy/i });
    expect(privacyLink).toHaveAttribute("href", "/privacy");
  });

  it("has correct href for contact link", () => {
    render(<Footer />);

    const contactLink = screen.getByRole("link", { name: /contact us/i });
    expect(contactLink).toHaveAttribute("href", "/contact");
  });

  it("has proper footer styling", () => {
    const { container } = render(<Footer />);

    const footer = container.querySelector("footer");
    expect(footer).toHaveClass("border-t");
  });

  it("displays copyright symbol", () => {
    render(<Footer />);

    expect(screen.getByText(/©/)).toBeInTheDocument();
  });

  it("has responsive layout classes", () => {
    const { container } = render(<Footer />);

    const contentContainer = container.querySelector(".sm\\:flex-row");
    expect(contentContainer).toBeInTheDocument();
  });

  it("aligns navigation to the right on larger screens", () => {
    const { container } = render(<Footer />);

    const nav = container.querySelector("nav");
    expect(nav).toHaveClass("sm:ml-auto");
  });
});
