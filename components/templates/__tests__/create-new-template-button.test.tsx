import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CreateNewTemplateButton from "../create-new-template-button";

describe("CreateNewTemplateButton", () => {
  it("renders the button text", () => {
    render(<CreateNewTemplateButton />);
    expect(screen.getByText("Create New Template")).toBeInTheDocument();
  });

  it("renders without crashing", () => {
    const { container } = render(<CreateNewTemplateButton />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
