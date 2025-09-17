import { createRouter, createWebHistory } from "vue-router";
import { useAuthUserStore } from "@/stores/authUser";
import { routes } from "./routes";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

router.beforeEach(async (to) => {
  const authUser = useAuthUserStore();
  const isLoggedIn = await authUser.isAuthenticated();

  // If logged in and trying to access auth pages or home, redirect to dashboard
  if (
    isLoggedIn &&
    (to.name === "login" || to.name === "register" || to.name === "home")
  ) {
    return { name: "dashboard" };
  }

  // Allow public access to home page only if not logged in
  if (to.name === "home") {
    return true;
  }

  // Allow access to auth pages if not logged in
  if (to.name === "login" || to.name === "register") {
    return true;
  }

  // Allow public access to other public pages
  if (to.name === "food" || to.name === "contact") {
    return true;
  }

  // If not logged in and trying to access protected routes
  if (!isLoggedIn && to.meta.requiresAuth) {
    return { name: "login" };
  }

  // If logged in, check user roles for restricted routes
  if (isLoggedIn) {
    const result = await authUser.getUserInformation();

    // If getting user information failed, redirect to login
    if (result?.error) {
      console.warn(
        "User information retrieval failed, redirecting to login:",
        result.error
      );
      return { name: "login" };
    }

    const isAdmin = authUser.userData?.is_admin || false;

    // Restrict access to admin-only routes
    if (!isAdmin && to.meta.requiresAdmin) {
      return { name: "forbidden" };
    }
  }

  // Redirect to 404 Not Found if the route does not exist
  if (router.resolve(to).matched.length === 0) {
    return { name: "not-found" };
  }
});

export default router;
