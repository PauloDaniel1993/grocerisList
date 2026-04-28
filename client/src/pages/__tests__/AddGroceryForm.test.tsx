import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AddGroceryForm } from "../../components/AddGroceryForm";

describe("AddGroceryForm", () => {
  let onAdd: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onAdd = vi.fn();
  });

  it("rejects empty name and shows a validation message", async () => {
    const user = userEvent.setup();
    render(<AddGroceryForm onAdd={onAdd} />);
    await user.click(screen.getByRole("button", { name: /^add$/i }));
    expect(screen.getByText("Name is required")).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("rejects whitespace-only name", async () => {
    const user = userEvent.setup();
    render(<AddGroceryForm onAdd={onAdd} />);
    await user.type(screen.getByLabelText(/^name$/i), "   ");
    await user.click(screen.getByRole("button", { name: /^add$/i }));
    expect(screen.getByText("Name is required")).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("calls onAdd with trimmed name and selected category and clears the form", async () => {
    const user = userEvent.setup();
    render(<AddGroceryForm onAdd={onAdd} />);
    const name = screen.getByLabelText(/^name$/i);
    await user.type(name, "  Blueberries  ");
    await user.selectOptions(
      screen.getByLabelText(/^category$/i),
      "dairy"
    );
    await user.click(screen.getByRole("button", { name: /^add$/i }));
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith({
      name: "Blueberries",
      category: "dairy",
    });
    expect(name).toHaveValue("");
    expect(screen.getByLabelText(/^category$/i)).toHaveValue("other");
  });
});
