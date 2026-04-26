import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GroceryFilter } from "../../components/GroceryFilter";

describe("GroceryFilter", () => {
  it("renders three radios with accessible names", () => {
    render(<GroceryFilter value="all" onChange={vi.fn()} />);
    expect(screen.getByRole("radio", { name: /^all$/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /^active$/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /^bought$/i })).toBeInTheDocument();
  });

  it("checks the radio matching value", () => {
    render(<GroceryFilter value="active" onChange={vi.fn()} />);
    expect(screen.getByRole("radio", { name: /^active$/i })).toBeChecked();
    expect(screen.getByRole("radio", { name: /^all$/i })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: /^bought$/i })).not.toBeChecked();
  });

  it("calls onChange when a different radio is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<GroceryFilter value="all" onChange={onChange} />);
    await user.click(screen.getByRole("radio", { name: /^bought$/i }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("bought");
  });

  it("activates selection with keyboard on a focused radio", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<GroceryFilter value="all" onChange={onChange} />);
    screen.getByRole("radio", { name: /^active$/i }).focus();
    await user.keyboard(" ");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("active");
  });
});
