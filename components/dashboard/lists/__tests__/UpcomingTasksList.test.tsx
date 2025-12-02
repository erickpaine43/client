import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import UpcomingTasksList from "../UpcomingTasksList";

describe("UpcomingTasksList", () => {
  const mockTasks = [
    {
      id: 1,
      title: "Launch Q1 Campaign",
      type: "campaign" as const,
      dueDate: "Jan 15, 2025",
    },
    {
      id: 2,
      title: "Send follow-up emails",
      type: "email" as const,
      dueDate: "Tomorrow",
    },
    {
      id: 3,
      title: "Update email template",
      type: "template" as const,
      dueDate: "Jan 20, 2025",
    },
    {
      id: 4,
      title: "Configure new domain",
      type: "domain" as const,
      dueDate: "Next week",
    },
  ];

  it("renders the component header", () => {
    render(<UpcomingTasksList tasks={mockTasks} />);
    expect(screen.getByText("Upcoming Tasks")).toBeInTheDocument();
  });

  it("renders all tasks", () => {
    render(<UpcomingTasksList tasks={mockTasks} />);

    expect(screen.getByText("Launch Q1 Campaign")).toBeInTheDocument();
    expect(screen.getByText("Send follow-up emails")).toBeInTheDocument();
    expect(screen.getByText("Update email template")).toBeInTheDocument();
    expect(screen.getByText("Configure new domain")).toBeInTheDocument();
  });

  it("displays task due dates", () => {
    render(<UpcomingTasksList tasks={mockTasks} />);

    expect(screen.getByText(/Jan 15, 2025/)).toBeInTheDocument();
    expect(screen.getByText(/Tomorrow/)).toBeInTheDocument();
    expect(screen.getByText(/Jan 20, 2025/)).toBeInTheDocument();
    expect(screen.getByText(/Next week/)).toBeInTheDocument();
  });

  it("displays task types with capitalization", () => {
    render(<UpcomingTasksList tasks={mockTasks} />);

    // Use getAllByText since "Campaign" appears in both title and type
    expect(screen.getAllByText(/Campaign/)[0]).toBeInTheDocument();
    expect(screen.getByText(/Email/)).toBeInTheDocument();
    expect(screen.getByText(/Template/)).toBeInTheDocument();
    expect(screen.getByText(/Domain/)).toBeInTheDocument();
  });

  it("renders icons for each task", () => {
    const { container } = render(<UpcomingTasksList tasks={mockTasks} />);

    // Should have one icon per task
    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBe(mockTasks.length);
  });

  it("renders empty state when no tasks", () => {
    render(<UpcomingTasksList tasks={[]} />);

    expect(screen.getByText("No upcoming tasks found.")).toBeInTheDocument();
  });

  it("applies correct icon colors based on task type", () => {
    const { container } = render(<UpcomingTasksList tasks={mockTasks} />);

    const icons = container.querySelectorAll("svg");
    expect(icons[0]).toHaveClass("text-blue-500"); // campaign
    expect(icons[1]).toHaveClass("text-green-500"); // email
    expect(icons[2]).toHaveClass("text-purple-500"); // template
    expect(icons[3]).toHaveClass("text-orange-500"); // domain
  });

  it("has scrollable container for many tasks", () => {
    const { container } = render(<UpcomingTasksList tasks={mockTasks} />);

    const scrollContainer = container.querySelector(
      '[class*="overflow-y-auto"]'
    );
    expect(scrollContainer).toBeInTheDocument();
  });

  it("has fixed height container", () => {
    const { container } = render(<UpcomingTasksList tasks={mockTasks} />);

    const mainContainer = container.querySelector('[class*="h-64"]');
    expect(mainContainer).toBeInTheDocument();
  });

  it("renders tasks with proper spacing", () => {
    const { container } = render(<UpcomingTasksList tasks={mockTasks} />);

    const tasksList = container.querySelector('[class*="space-y"]');
    expect(tasksList).toBeInTheDocument();
  });

  it("handles single task", () => {
    const singleTask = [mockTasks[0]];
    render(<UpcomingTasksList tasks={singleTask} />);

    expect(screen.getByText("Launch Q1 Campaign")).toBeInTheDocument();
    expect(screen.queryByText("Send follow-up emails")).not.toBeInTheDocument();
  });
});
