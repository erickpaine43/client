import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import PersonalizationTags, {
  personalizationTags,
} from "../PersonalizationTags";

// Mock sonner toast - use inline jest.fn() to avoid hoisting issues
jest.mock("sonner", () => ({
  toast: {
    message: jest.fn(),
  },
}));

import { toast } from "sonner";
const mockToastMessage = toast.message as jest.Mock;

describe("PersonalizationTags", () => {
  const mockOnInsertTag = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all personalization tags", () => {
    render(<PersonalizationTags onInsertTag={mockOnInsertTag} />);

    personalizationTags.forEach((tag) => {
      expect(screen.getByText(tag.name)).toBeInTheDocument();
    });
  });

  it("displays the default label", () => {
    render(<PersonalizationTags onInsertTag={mockOnInsertTag} />);
    expect(screen.getByText("Personalization Tags")).toBeInTheDocument();
  });

  it("displays custom label when provided", () => {
    render(
      <PersonalizationTags onInsertTag={mockOnInsertTag} label="Custom Label" />
    );
    expect(screen.getByText("Custom Label")).toBeInTheDocument();
  });

  it("calls onInsertTag when a tag button is clicked", async () => {
    const user = userEvent.setup();
    render(<PersonalizationTags onInsertTag={mockOnInsertTag} />);

    const firstNameButton = screen.getByText("First Name");
    await user.click(firstNameButton);

    expect(mockOnInsertTag).toHaveBeenCalledWith("{First Name}");
    expect(mockOnInsertTag).toHaveBeenCalledTimes(1);
  });

  it("shows toast notification when tag is inserted", async () => {
    const user = userEvent.setup();
    render(<PersonalizationTags onInsertTag={mockOnInsertTag} />);

    const companyButton = screen.getByText("Company");
    await user.click(companyButton);

    expect(mockToastMessage).toHaveBeenCalledWith("Tag inserted", {
      description: "{Company} has been inserted into your template.",
    });
  });

  it("renders all 10 personalization tags", () => {
    render(<PersonalizationTags onInsertTag={mockOnInsertTag} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(personalizationTags.length);
  });

  it("applies custom className when provided", () => {
    const { container } = render(
      <PersonalizationTags
        onInsertTag={mockOnInsertTag}
        className="custom-class"
      />
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("custom-class");
  });

  it("renders tag icons", () => {
    render(<PersonalizationTags onInsertTag={mockOnInsertTag} />);

    // All buttons should have the Tag icon (lucide-react renders as svg)
    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button.querySelector("svg")).toBeInTheDocument();
    });
  });

  it("handles multiple tag insertions", async () => {
    const user = userEvent.setup();
    render(<PersonalizationTags onInsertTag={mockOnInsertTag} />);

    await user.click(screen.getByText("First Name"));
    await user.click(screen.getByText("Last Name"));
    await user.click(screen.getByText("Company"));

    expect(mockOnInsertTag).toHaveBeenCalledTimes(3);
    expect(mockOnInsertTag).toHaveBeenNthCalledWith(1, "{First Name}");
    expect(mockOnInsertTag).toHaveBeenNthCalledWith(2, "{Last Name}");
    expect(mockOnInsertTag).toHaveBeenNthCalledWith(3, "{Company}");
  });

  it("renders without label when label is empty string", () => {
    render(<PersonalizationTags onInsertTag={mockOnInsertTag} label="" />);

    expect(screen.queryByText("Personalization Tags")).not.toBeInTheDocument();
  });
});
