import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { supabase } from "@/utils/supabase";

export const useAuthUserStore = defineStore("authUser", () => {
  // States
  const userData = ref(null);
  const authPages = ref([]);

  // Getters
  // Computed Properties; Use for getting the state but not modifying its reactive state
  const userRole = computed(() => {
    return userData.value?.is_admin
      ? "Super Administrator"
      : userData.value.user_role;
  });

  // Reset State Action
  function $reset() {
    userData.value = null;
    authPages.value = [];
  }

  // Actions
  // Retrieve User Session if Logged
  async function isAuthenticated() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session:", error.message);
      return false;
    }

    if (data.session) {
      const { id, email, user_metadata } = data.session.user;
      userData.value = { id, email, ...user_metadata };
    }

    return !!data.session;
  }

  // Retrieve User Information
  async function getUserInformation() {
    const {
      data: {
        // Retrieve Id, Email and Metadata thru Destructuring
        user: { id, email, user_metadata },
      },
    } = await supabase.auth.getUser();

    // Set the retrieved information to state
    userData.value = { id, email, ...user_metadata };
  }

  // Retrieve User Roles Pages
  async function getAuthPages(name) {
    const { data } = await supabase
      .from("user_roles")
      .select("*, pages: user_role_pages (page)")
      .eq("user_role", name);

    // Set the retrieved data to state
    authPages.value = data[0].pages.map((p) => p.page);
  }

  // Update User Information
  async function updateUserInformation(updatedData) {
    const {
      data: {
        // Retrieve Id, Email and Metadata thru Destructuring
        user: { id, email, user_metadata },
      },
      error,
    } = await supabase.auth.updateUser({
      data: {
        ...updatedData,
      },
    });

    // Check if it has error
    if (error) {
      return { error };
    }
    // If no error set updatedData to userData state
    else if (user_metadata) {
      userData.value = { id, email, ...user_metadata };

      return { data: userData.value };
    }
  }

  // Update User Profile Image
  async function updateUserImage(file) {
    // Get the file extension from the uploaded file
    // const fileExtension = file.name.split('.').pop()

    // Upload the file with the user ID and file extension
    const { data, error } = await supabase.storage
      .from("cafezy")
      .upload("avatars/" + userData.value.id + "-avatar.png", file, {
        cacheControl: "3600",
        upsert: true,
      });

    // Check if it has error
    if (error) {
      return { error };
    }
    // If no error set data to userData state with the image_url
    else if (data) {
      // Retrieve Image Public Url
      const { data: imageData } = supabase.storage
        .from("cafezy")
        .getPublicUrl(data.path);

      // Update the user information with the new image_url
      return await updateUserInformation({
        ...userData.value,
        image_url: imageData.publicUrl,
      });
    }
  }

  // Login function
  async function login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        const { id, email: userEmail, user_metadata } = data.user;
        userData.value = { id, email: userEmail, ...user_metadata };
        return { data: userData.value };
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  // Register function
  async function register(email, password, firstName, lastName) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      return { data: data.user };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Logout function
  async function logout() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { error: error.message };
      }

      // Reset the store
      $reset();
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Google Sign In
  async function signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Reset Password
  async function resetPassword(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: error.message };
    }
  }

  return {
    userData,
    userRole,
    authPages,
    $reset,
    isAuthenticated,
    getUserInformation,
    getAuthPages,
    updateUserInformation,
    updateUserImage,
    login,
    register,
    logout,
    signInWithGoogle,
    resetPassword,
  };
});
