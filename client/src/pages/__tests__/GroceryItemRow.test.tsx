import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GroceryItemRow } from "../../components/GroceryItemRow";
import type { GroceryItem } from "../../types/grocery";

const baseItem: GroceryItem = {
  id: "test-1",
  listId: "l1",
  name: "Eggs",
  category: "dairy",
  bought: false,
  createdAt: "2024-01-10T10:00:00.000Z",
};

describe("GroceryItemRow", () => {
  it("renders an unchecked checkbox with accessible name referencing the item name", () => {
    render(<GroceryItemRow item={baseItem} onToggleBought={vi.fn()} />);
    const checkbox = screen.getByRole("checkbox", {
      name: /mark eggs as bought/i,
    });
    expect(checkbox).not.toBeChecked();
  });

  it("calls onToggleBought with the item id when clicked", async () => {
    const user = userEvent.setup();
    const onToggleBought = vi.fn();
    render(<GroceryItemRow item={baseItem} onToggleBought={onToggleBought} />);
    await user.click(screen.getByRole("checkbox"));
    expect(onToggleBought).toHaveBeenCalledTimes(1);
    expect(onToggleBought).toHaveBeenCalledWith("test-1");
  });

  it("calls onToggleBought when checkbox is activated via keyboard", async () => {
    const user = userEvent.setup();
    const onToggleBought = vi.fn();
    render(<GroceryItemRow item={baseItem} onToggleBought={onToggleBought} />);
    screen.getByRole("checkbox").focus();
    await user.keyboard(" ");
    expect(onToggleBought).toHaveBeenCalledTimes(1);
    expect(onToggleBought).toHaveBeenCalledWith("test-1");
  });

  it("renders a checked checkbox and bought class when item.bought is true", () => {
    render(
      <GroceryItemRow
        item={{ ...baseItem, bought: true }}
        onToggleBought={vi.fn()}
      />
    );
    const checkbox = screen.getByRole("checkbox", {
      name: /mark eggs as not bought/i,
    });
    expect(checkbox).toBeChecked();
    expect(screen.getByRole("listitem")).toHaveClass("grocery-row--bought");
  });

  it("does not apply bought class when item.bought is false", () => {
    render(<GroceryItemRow item={baseItem} onToggleBought={vi.fn()} />);
    expect(screen.getByRole("listitem")).not.toHaveClass("grocery-row--bought");
  });
});
