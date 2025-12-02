import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import GoToTopButton from "../go-to-top";

describe("GoToTopButton", () => {
  let scrollToSpy: jest.SpyInstance;

  beforeEach(() => {
    scrollToSpy = jest.spyOn(window, "scrollTo").mockImplementation();
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  afterEach(() => {
    scrollToSpy.mockRestore();
  });

  it("renders the button", () => {
    render(<GoToTopButton />);

    const button = screen.getByRole("button", { name: /go to top/i });
    expect(button).toBeInTheDocument();
  });

  it("is hidden when page is at top", () => {
    render(<GoToTopButton />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("opacity-0");
  });

  it("becomes visible when scrolled down past threshold", () => {
    render(<GoToTopButton />);

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 500, writable: true });
      fireEvent.scroll(window);
    });

    const button = screen.getByRole("button");
    expect(button).toHaveClass("opacity-100");
  });

  it("remains hidden when scrolled less than threshold", () => {
    render(<GoToTopButton />);

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 300, writable: true });
      fireEvent.scroll(window);
    });

    const button = screen.getByRole("button");
    expect(button).toHaveClass("opacity-0");
  });

  it("scrolls to top when clicked", async () => {
    const user = userEvent.setup();
    render(<GoToTopButton />);

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 500, writable: true });
      fireEvent.scroll(window);
    });

    const button = screen.getByRole("button");
    await user.click(button);

    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
  });

  it("has fixed positioning", () => {
    const { container } = render(<GoToTopButton />);

    const button = container.querySelector("button");
    expect(button).toHaveClass("fixed");
  });

  it("is positioned in bottom-right corner", () => {
    const { container } = render(<GoToTopButton />);

    const button = container.querySelector("button");
    expect(button).toHaveClass("bottom-4", "right-4");
  });

  it("has rounded shape", () => {
    const { container } = render(<GoToTopButton />);

    const button = container.querySelector("button");
    expect(button).toHaveClass("rounded-full");
  });

  it("has proper z-index for layering", () => {
    const { container } = render(<GoToTopButton />);

    const button = container.querySelector("button");
    expect(button).toHaveClass("z-50");
  });

  it("renders ArrowUp icon", () => {
    const { container } = render(<GoToTopButton />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("has pointer-events-none when hidden", () => {
    render(<GoToTopButton />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("pointer-events-none");
  });

  it("removes pointer-events-none when visible", () => {
    render(<GoToTopButton />);

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 500, writable: true });
      fireEvent.scroll(window);
    });

    const button = screen.getByRole("button");
    expect(button).not.toHaveClass("pointer-events-none");
  });

  it("cleans up scroll event listener on unmount", () => {
    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");
    const { unmount } = render(<GoToTopButton />);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function)
    );
    removeEventListenerSpy.mockRestore();
  });
});
