import type {
  Cake,
  CakeOffer,
  Feedback,
  NewCake,
  NewSpecialOffer,
  NewUser,
  Order,
  SpecialOffer,
  User,
} from "../types";
import { getAccessToken } from "../auth";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";

interface ApiResponse<T> {
  response: T;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const authorization = await getAccessToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(authorization ? { Authorization: `Bearer ${authorization}` } : {}),
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new ApiError(
      message || `Request failed with status ${response.status}`,
      response.status,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json()) as ApiResponse<T> | T;
  if (
    payload !== null &&
    typeof payload === "object" &&
    "response" in payload
  ) {
    return (payload as ApiResponse<T>).response;
  }
  return payload as T;
}

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

export const api = {
  users: {
    list: async () => {
      const payload = await request<unknown>("/admin/getUsers");
      if (Array.isArray(payload)) return payload as User[];
      if (payload && typeof payload === "object") {
        const users =
          (payload as { users?: unknown; data?: unknown }).users ??
          (payload as { data?: unknown }).data;
        if (Array.isArray(users)) return users as User[];
      }
      throw new ApiError("Unexpected response while loading users.", 200);
    },
    create: (user: NewUser) => request<User>("/users", json("POST", user)),
    update: (id: string, user: Partial<NewUser>) =>
      request<User>(`/users/${id}`, json("PATCH", user)),
    remove: (email: string) =>
      request<void>(`/admin/deleteUser/${encodeURIComponent(email)}`, {
        method: "DELETE",
      }),
  },
  cakes: {
    list: () => request<Cake[]>("/allCakes"),
    create: (cake: NewCake, image: File) => {
      const body = new FormData();
      body.append("cake_name", cake.cake_name);
      body.append("cake_description", cake.cake_description);
      body.append("cake_flavour", cake.cake_flavour);
      body.append("cake_price", Number(cake.cake_price ?? 0).toString());
      body.append("cake_size", Number(cake.cake_size ?? 0).toString());
      body.append("img", image);
      return request<Cake>("/addCake", { method: "POST", body });
    },
    update: (id: string, cake: Partial<NewCake>) =>
      request<string>(
        "/editCake",
        json("PATCH", { cake_id: Number(id), ...cake }),
      ),
    remove: (id: string) =>
      request<string>(`/deleteCake?cakeId=${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
  },
  offers: {
    list: () => request<CakeOffer[]>("/offers"),
    create: (offer: NewSpecialOffer) =>
      request<string>(
        "/createOffer",
        json("POST", {
          expiry_date: offer.ends_at,
          cake_id: Number(offer.cake_id),
          cake_price: Number(offer.offer_price),
          add_ons: offer.description || null,
        }),
      ),
    update: (id: string, offer: Partial<NewSpecialOffer>) =>
      request<SpecialOffer>(`/offers/${id}`, json("PATCH", offer)),
    remove: (id: string) => request<void>(`/offers/${id}`, json("DELETE")),
  },
  feedback: {
    list: () => request<Feedback[]>("/feedback"),
    respond: (id: string, response: string) =>
      request<Feedback>(
        "/replyReviews",
        json("PATCH", { reviewId: Number(id), reviewReply: response }),
      ),
  },
  orders: {
    list: () => request<Order[]>("/allOrders"),
  },
};
