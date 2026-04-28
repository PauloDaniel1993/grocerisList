import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestRouter } from "../../test/TestRouter";
import { describe, expect, it } from "vitest";
import App from "../../App";
import { useAuthStore } from "../../stores/authStore";
import { setSessionToUser } from "../../test/mswServer";
import { GroceryList } from "../../components/GroceryList";

describe("GroceriesPage", () => {
  it("shows title and sample items for authenticated user", async () => {
    setSessionToUser();
    useAuthStore.setState({ user: null, status: "loading" });
    render(
      <TestRouter initialEntries={["/groceries"]}>
        <App />
      </TestRouter>
    );
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /^groceries$/i })
      ).toBeInTheDocument();
    });
    const list = screen.getByRole("list", { name: /grocery items/i });
    expect(within(list).getByText("Milk")).toBeInTheDocument();
    expect(within(list).getByText("Dairy")).toBeInTheDocument();
    expect(within(list).getByText("Spinach")).toBeInTheDocument();
    expect(within(list).getByText("Produce")).toBeInTheDocument();
  });

  it("appends a new item to the list after add form submit", async () => {
    const user = userEvent.setup();
    setSessionToUser();
    useAuthStore.setState({ user: null, status: "loading" });
    render(
      <TestRouter initialEntries={["/groceries"]}>
        <App />
      </TestRouter>
    );
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /^groceries$/i })
      ).toBeInTheDocument();
    });
    await user.type(screen.getByLabelText(/^name$/i), "Lemons");
    await user.selectOptions(
      screen.getByLabelText(/^category$/i),
      "produce"
    );
    await user.click(screen.getByRole("button", { name: /^add$/i }));
    expect(screen.getByText("Lemons")).toBeInTheDocument();
  });

  it("sends unauthenticated user from groceries to login", async () => {
    useAuthStore.setState({ user: null, status: "loading" });
    render(
      <TestRouter initialEntries={["/groceries"]}>
        <App />
      </TestRouter>
    );
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /sign in/i })
      ).toBeInTheDocument();
    });
  });

  it("marks an item as bought then unmarks it (round-trip toggle)", async () => {
    const user = userEvent.setup();
    setSessionToUser();
    useAuthStore.setState({ user: null, status: "loading" });
    render(
      <TestRouter initialEntries={["/groceries"]}>
        <App />
      </TestRouter>
    );
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /^groceries$/i })
      ).toBeInTheDocument();
    });

    const checkbox = screen.getByRole("checkbox", {
      name: /mark milk as bought/i,
    });
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(
      screen.getByRole("checkbox", { name: /mark milk as not bought/i })
    ).toBeChecked();

    await user.click(
      screen.getByRole("checkbox", { name: /mark milk as not bought/i })
    );
    expect(
      screen.getByRole("checkbox", { name: /mark milk as bought/i })
    ).not.toBeChecked();
  });

  it("can add an item and then mark it as bought", async () => {
    const user = userEvent.setup();
    setSessionToUser();
    useAuthStore.setState({ user: null, status: "loading" });
    render(
      <TestRouter initialEntries={["/groceries"]}>
        <App />
      </TestRouter>
    );
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /^groceries$/i })
      ).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/^name$/i), "Oranges");
    await user.click(screen.getByRole("button", { name: /^add$/i }));
    expect(screen.getByText("Oranges")).toBeInTheDocument();

    const checkbox = screen.getByRole("checkbox", {
      name: /mark oranges as bought/i,
    });
    await user.click(checkbox);
    expect(
      screen.getByRole("checkbox", { name: /mark oranges as not bought/i })
    ).toBeChecked();
  });

  it("Active filter hides bought items", async () => {
    const user = userEvent.setup();
    setSessionToUser();
    useAuthStore.setState({ user: null, status: "loading" });
    render(
      <TestRouter initialEntries={["/groceries"]}>
        <App />
      </TestRouter>
    );
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /^groceries$/i })
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("checkbox", { name: /mark milk as bought/i })
    );
    await user.click(screen.getByRole("radio", { name: /^active$/i }));

    const list = screen.getByRole("list", { name: /grocery items/i });
    expect(within(list).queryByText("Milk")).not.toBeInTheDocument();
    expect(within(list).getByText("Spinach")).toBeInTheDocument();
  });

  it("Active filter shows empty message when every item is bought", async () => {
    const user = userEvent.setup();
    setSessionToUser();
    useAuthStore.setState({ user: null, status: "loading" });
    render(
      <TestRouter initialEntries={["/groceries"]}>
        <App />
      </TestRouter>
    );
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /^groceries$/i })
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("checkbox", { name: /mark milk as bought/i })
    );
    await user.click(
      screen.getByRole("checkbox", { name: /mark spinach as bought/i })
    );
    await user.click(
      screen.getByRole("checkbox", { name: /mark bread as bought/i })
    );
    await user.click(
      screen.getByRole("checkbox", { name: /mark paper towels as bought/i })
    );
    await user.click(screen.getByRole("radio", { name: /^active$/i }));
    expect(screen.getByText("No active items.")).toBeInTheDocument();
  });

  it("Bought filter shows empty message when nothing is bought", async () => {
    const user = userEvent.setup();
    setSessionToUser();
    useAuthStore.setState({ user: null, status: "loading" });
    render(
      <TestRouter initialEntries={["/groceries"]}>
        <App />
      </TestRouter>
    );
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /^groceries$/i })
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("radio", { name: /^bought$/i }));
    expect(screen.getByText("No bought items.")).toBeInTheDocument();
    expect(
      screen.queryByRole("list", { name: /grocery items/i })
    ).not.toBeInTheDocument();
  });

  it("switching back to All restores full list after Bought filter", async () => {
    const user = userEvent.setup();
    setSessionToUser();
    useAuthStore.setState({ user: null, status: "loading" });
    render(
      <TestRouter initialEntries={["/groceries"]}>
        <App />
      </TestRouter>
    );
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /^groceries$/i })
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("radio", { name: /^bought$/i }));
    expect(screen.getByText("No bought items.")).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: /^all$/i }));
    const list = screen.getByRole("list", { name: /grocery items/i });
    expect(within(list).getByText("Milk")).toBeInTheDocument();
  });

  it("marking an item bought on Active filter removes it from the visible list", async () => {
    const user = userEvent.setup();
    setSessionToUser();
    useAuthStore.setState({ user: null, status: "loading" });
    render(
      <TestRouter initialEntries={["/groceries"]}>
        <App />
      </TestRouter>
    );
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /^groceries$/i })
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("radio", { name: /^active$/i }));
    const list = screen.getByRole("list", { name: /grocery items/i });
    expect(within(list).getByText("Spinach")).toBeInTheDocument();

    await user.click(
      screen.getByRole("checkbox", { name: /mark spinach as bought/i })
    );
    expect(within(list).queryByText("Spinach")).not.toBeInTheDocument();
  });
});

describe("GroceryList", () => {
  it("shows empty state when there are no items", () => {
    render(<GroceryList items={[]} />);
    expect(screen.getByText("Your list is empty.")).toBeInTheDocument();
  });
});
