import HomePage from "@/views/HomePage.vue";

export const routes = [
  // Home Page
  {
    path: "/",
    name: "home",
    component: HomePage,
    meta: { requiresAuth: false },
  },
  {
    path: "/login",
    name: "login",
    component: HomePage, // Temporarily using HomePage - you'll want to create a proper login component
    meta: { requiresAuth: false },
  },

  // Error Pages - You'll need to create these components
  {
    path: "/forbidden",
    name: "forbidden",
    component: () => import("@/views/errors/ForbiddenView.vue"),
  },
  {
    path: "/not-found",
    name: "not-found",
    component: () => import("@/views/errors/NotFoundView.vue"),
  },
  {
    path: "/:catchAll(.*)",
    component: () => import("@/views/errors/NotFoundView.vue"),
  },
];
