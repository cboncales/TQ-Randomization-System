import { HomePage } from "@/views/HomePage.vue";

export const routes = [
  // Auth Pages
  {
    path: "/",
    name: "home",
  },
  {
    path: "/login",
    name: "login",
    component: HomePage,
    meta: { requiresAuth: false },
  },

  // Error Pages
  {
    path: "/forbidden",
    name: "forbidden",
    component: ForbiddenView,
  },
  {
    path: "/:catchAll(.*)",
    component: NotFoundView,
  },
];
