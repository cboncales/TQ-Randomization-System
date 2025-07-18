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
    component: () => import("@/views/auth/LoginView.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/views/auth/RegisterView.vue"),
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
