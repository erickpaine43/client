import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Header } from "../header";

// Mock the copy text
jest.mock("../data/copy", () => ({
  copyText: {
    page: {
      title: "Clients Management",
    },
  },
}));

describe("Header", () => {
  it("renders the header", () => {
    render(<Header />);
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });

  it("displays the page title from copy text", () => {
    render(<Header />);
    expect(screen.getByText("Clients Management")).toBeInTheDocument();
  });

  it("renders heading with correct styling", () => {
    render(<Header />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveClass("text-2xl", "font-bold");
  });

  it("has proper layout structure", () => {
    const { container } = render(<Header />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("flex", "items-center", "justify-between");
  });
});
