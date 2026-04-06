import { auth } from "../lib/firebase";

const API_URL = "/api";

const getHeaders = async () => {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Public
  getNavigation: async () => {
    const res = await fetch(`${API_URL}/navigation`);
    if (!res.ok) throw new Error("Failed to fetch navigation");
    return res.json();
  },
  getPages: async () => {
    const res = await fetch(`${API_URL}/pages`);
    if (!res.ok) throw new Error("Failed to fetch pages");
    return res.json();
  },
  getPageBySlug: async (slug: string) => {
    const res = await fetch(`${API_URL}/pages/${slug}`);
    if (!res.ok) throw new Error("Failed to fetch page");
    return res.json();
  },
  getPosts: async () => {
    const res = await fetch(`${API_URL}/posts`);
    if (!res.ok) throw new Error("Failed to fetch posts");
    return res.json();
  },
  getPostBySlug: async (slug: string) => {
    const res = await fetch(`${API_URL}/posts/${slug}`);
    if (!res.ok) throw new Error("Failed to fetch post");
    return res.json();
  },

  // Admin
  admin: {
    navigation: {
      list: async () => {
        const res = await fetch(`${API_URL}/admin/navigation`, {
          headers: await getHeaders(),
        });
        if (!res.ok) throw new Error("Failed to fetch admin navigation");
        return res.json();
      },
      create: async (data: any) => {
        const res = await fetch(`${API_URL}/admin/navigation`, {
          method: "POST",
          headers: await getHeaders(),
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to create navigation");
        return res.json();
      },
      update: async (id: string, data: any) => {
        const res = await fetch(`${API_URL}/admin/navigation/${id}`, {
          method: "PUT",
          headers: await getHeaders(),
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update navigation");
        return res.json();
      },
      delete: async (id: string) => {
        const res = await fetch(`${API_URL}/admin/navigation/${id}`, {
          method: "DELETE",
          headers: await getHeaders(),
        });
        if (!res.ok) throw new Error("Failed to delete navigation");
      },
    },
    pages: {
      list: async () => {
        const res = await fetch(`${API_URL}/admin/pages`, {
          headers: await getHeaders(),
        });
        if (!res.ok) throw new Error("Failed to fetch admin pages");
        return res.json();
      },
      create: async (data: any) => {
        const res = await fetch(`${API_URL}/admin/pages`, {
          method: "POST",
          headers: await getHeaders(),
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to create page");
        return res.json();
      },
      update: async (id: string, data: any) => {
        const res = await fetch(`${API_URL}/admin/pages/${id}`, {
          method: "PUT",
          headers: await getHeaders(),
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update page");
        return res.json();
      },
      delete: async (id: string) => {
        const res = await fetch(`${API_URL}/admin/pages/${id}`, {
          method: "DELETE",
          headers: await getHeaders(),
        });
        if (!res.ok) throw new Error("Failed to delete page");
      },
    },
    posts: {
      list: async () => {
        const res = await fetch(`${API_URL}/admin/posts`, {
          headers: await getHeaders(),
        });
        if (!res.ok) throw new Error("Failed to fetch admin posts");
        return res.json();
      },
      create: async (data: any) => {
        const res = await fetch(`${API_URL}/admin/posts`, {
          method: "POST",
          headers: await getHeaders(),
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to create post");
        return res.json();
      },
      update: async (id: string, data: any) => {
        const res = await fetch(`${API_URL}/admin/posts/${id}`, {
          method: "PUT",
          headers: await getHeaders(),
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update post");
        return res.json();
      },
      delete: async (id: string) => {
        const res = await fetch(`${API_URL}/admin/posts/${id}`, {
          method: "DELETE",
          headers: await getHeaders(),
        });
        if (!res.ok) throw new Error("Failed to delete post");
      },
    },
  },
};
