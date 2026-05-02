import { http, HttpResponse } from "msw";
import { server } from "./mswServer";
import type { GroceryItem } from "../types/grocery";
import type { BoughtList } from "../types/boughtList";

export const testListId = "test-list-1";
const t = "2024-01-10T10:00:00.000Z";

const initial: GroceryItem[] = [
  {
    id: "g1",
    listId: testListId,
    name: "Milk",
    category: "dairy",
    bought: false,
    createdAt: t,
  },
  {
    id: "g2",
    listId: testListId,
    name: "Spinach",
    category: "produce",
    bought: false,
    createdAt: t,
  },
  {
    id: "g3",
    listId: testListId,
    name: "Bread",
    category: "bakery",
    bought: false,
    createdAt: t,
  },
  {
    id: "g4",
    listId: testListId,
    name: "Paper towels",
    category: "household",
    bought: false,
    createdAt: t,
  },
];

let mockItems: GroceryItem[] = initial.map((i) => ({ ...i }));
let listCounter = 0;
let boughtListCounter = 0;

function cloneState() {
  mockItems = initial.map((i) => ({ ...i }));
  listCounter = 0;
  boughtListCounter = 0;
}

export function resetGroceryListMsw() {
  cloneState();
}

function handlersForList(listId: string) {
  return [
    http.get(`/api/grocery-lists/${listId}`, () => {
      return HttpResponse.json({
        list: {
          id: listId,
          name: "Test list",
          createdAt: t,
          updatedAt: t,
        },
      });
    }),
    http.get(`/api/grocery-lists/${listId}/items`, () => {
      return HttpResponse.json({ items: mockItems });
    }),
    http.post(
      `/api/grocery-lists/${listId}/items`,
      async ({ request }) => {
        const body = (await request.json()) as {
          name?: string;
          category?: string;
        };
        const name = (body.name ?? "").trim();
        const category = (body.category ?? "other") as GroceryItem["category"];
        const newItem: GroceryItem = {
          id: `g-new-${listCounter++}`,
          listId,
          name,
          category,
          bought: false,
          createdAt: new Date().toISOString(),
        };
        mockItems = [...mockItems, newItem];
        return HttpResponse.json({ item: newItem }, { status: 201 });
      }
    ),
    http.patch(
      "/api/grocery-lists/:listId/items/:itemId",
      async ({ request, params }) => {
        if (params.listId !== listId) {
          return HttpResponse.json({ error: "List not found" }, { status: 404 });
        }
        const itemId = String(params.itemId);
        const body = (await request.json()) as { bought?: boolean };
        const idx = mockItems.findIndex((i) => i.id === itemId);
        if (idx === -1) {
          return HttpResponse.json({ error: "Item not found" }, { status: 404 });
        }
        const prev = mockItems[idx]!;
        const next: GroceryItem = {
          id: prev.id,
          listId: prev.listId,
          name: prev.name,
          category: prev.category,
          bought:
            body.bought !== undefined ? body.bought : prev.bought,
          createdAt: prev.createdAt,
        };
        mockItems = mockItems.map((i) => (i.id === itemId ? next : i));
        return HttpResponse.json({ item: next });
      }
    ),
    http.post(`/api/grocery-lists/${listId}/end-grocery`, async ({ request }) => {
      const body = (await request.json()) as { location?: string };
      const boughtItems = mockItems.filter((item) => item.bought);
      if (boughtItems.length === 0) {
        return HttpResponse.json(
          { error: "Cannot end grocery without bought items" },
          { status: 400 }
        );
      }
      const boughtListId = `bought-${boughtListCounter++}`;
      const boughtList: BoughtList = {
        id: boughtListId,
        groceryListId: listId,
        name: "Test list - 2024-01-10",
        location: body.location?.trim() || null,
        createdAt: t,
        items: boughtItems.map((item, index) => ({
          id: `bought-item-${index}`,
          boughtListId,
          name: item.name,
          category: item.category,
          price: null,
          createdAt: t,
        })),
      };
      mockItems = mockItems.filter((item) => !item.bought);
      return HttpResponse.json({ boughtList }, { status: 201 });
    }),
  ];
}

/**
 * Mocks one grocery list and its items for GroceriesPage tests. Call `resetGroceryListMsw` in `beforeEach`.
 */
export function useGroceryListDetailMocks() {
  resetGroceryListMsw();
  server.use(...handlersForList(testListId));
}
