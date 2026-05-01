import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GroceryFilter } from "../../components/GroceryFilter";

describe("GroceryFilter", () => {
  it("renders three tabs with accessible names", () => {
    render(<GroceryFilter value="all" onChange={vi.fn()} />);
    expect(screen.getByRole("tab", { name: /^all$/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /^active$/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /^bought$/i })).toBeInTheDocument();
  });

  it("marks the tab matching value as selected", () => {
    render(<GroceryFilter value="active" onChange={vi.fn()} />);
    expect(screen.getByRole("tab", { name: /^active$/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("tab", { name: /^all$/i })).toHaveAttribute(
      "aria-selected",
      "false"
    );
    expect(screen.getByRole("tab", { name: /^bought$/i })).toHaveAttribute(
      "aria-selected",
      "false"
    );
  });

  it("calls onChange when a different tab is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<GroceryFilter value="all" onChange={onChange} />);
    await user.click(screen.getByRole("tab", { name: /^bought$/i }));
    expect(onChange).toHaveBeenCalledWith("bought");
  });

  it("activates selection with keyboard on a focused tab", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<GroceryFilter value="all" onChange={onChange} />);
    screen.getByRole("tab", { name: /^active$/i }).focus();
    await user.keyboard(" ");
    expect(onChange).toHaveBeenCalledWith("active");
  });
});
