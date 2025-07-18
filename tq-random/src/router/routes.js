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

  // Dashboard Routes (Protected)
  {
    path: "/dashboard",
    name: "dashboard",
    component: () => import("@/views/DashboardView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/dashboard/test/:testId/questions",
    name: "question-management",
    component: () => import("@/views/QuestionManagementView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/dashboard/test/:testId/edit",
    name: "edit-test",
    component: () => import("@/views/auth/LoginView.vue"), // Placeholder - create EditTestView later
    meta: { requiresAuth: true },
  },

  // Error Pages
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
