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

  // Test Management Functions

  // Create a new test
  async function createTest(title, description) {
    try {
      if (!userData.value?.id) {
        return { error: "User not authenticated" };
      }

      const { data, error } = await supabase
        .from("tests")
        .insert([
          {
            user_id: userData.value.id,
            title: title.trim(),
            description: description.trim() || null,
          },
        ])
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Get user's tests
  async function getUserTests() {
    try {
      if (!userData.value?.id) {
        return { error: "User not authenticated" };
      }

      const { data, error } = await supabase
        .from("tests")
        .select("*")
        .eq("user_id", userData.value.id)
        .order("created_at", { ascending: false });

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Delete a test
  async function deleteTest(testId) {
    try {
      if (!userData.value?.id) {
        return { error: "User not authenticated" };
      }

      const { error } = await supabase
        .from("tests")
        .delete()
        .eq("id", testId)
        .eq("user_id", userData.value.id); // Ensure user owns the test

      if (error) {
        return { error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Update a test
  async function updateTest(testId, updates) {
    try {
      if (!userData.value?.id) {
        return { error: "User not authenticated" };
      }

      const { data, error } = await supabase
        .from("tests")
        .update(updates)
        .eq("id", testId)
        .eq("user_id", userData.value.id) // Ensure user owns the test
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Question Management Functions

  // Create a new question with answer choices
  async function createQuestion(testId, questionText, answerChoices) {
    try {
      if (!userData.value?.id) {
        return { error: "User not authenticated" };
      }

      // First verify the user owns the test
      const { data: testData, error: testError } = await supabase
        .from("tests")
        .select("id")
        .eq("id", testId)
        .eq("user_id", userData.value.id)
        .single();

      if (testError || !testData) {
        return { error: "Test not found or access denied" };
      }

      // Create the question
      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .insert([
          {
            test_id: testId,
            text: questionText.trim(),
          },
        ])
        .select()
        .single();

      if (questionError) {
        return { error: questionError.message };
      }

      // Create answer choices if provided
      if (answerChoices && answerChoices.length > 0) {
        const choicesData = answerChoices.map((choice) => ({
          question_id: questionData.id,
          text: choice.text.trim(),
        }));

        const { error: choicesError } = await supabase
          .from("answer_choices")
          .insert(choicesData);

        if (choicesError) {
          // If answer choices fail, clean up the question
          await supabase.from("questions").delete().eq("id", questionData.id);
          return { error: choicesError.message };
        }
      }

      return { data: questionData };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Get questions for a test with their answer choices
  async function getTestQuestions(testId) {
    try {
      if (!userData.value?.id) {
        return { error: "User not authenticated" };
      }

      // First verify the user owns the test
      const { data: testData, error: testError } = await supabase
        .from("tests")
        .select("id")
        .eq("id", testId)
        .eq("user_id", userData.value.id)
        .single();

      if (testError || !testData) {
        return { error: "Test not found or access denied" };
      }

      // Get questions first
      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .eq("test_id", testId)
        .order("id", { ascending: true });

      if (questionsError) {
        return { error: questionsError.message };
      }

      // Get answer choices for all questions
      const questionIds = questionsData.map((q) => q.id);
      let answerChoicesData = [];

      if (questionIds.length > 0) {
        const { data: choicesData, error: choicesError } = await supabase
          .from("answer_choices")
          .select("*")
          .in("question_id", questionIds)
          .order("id", { ascending: true });

        if (choicesError) {
          return { error: choicesError.message };
        }

        answerChoicesData = choicesData || [];
      }

      // Combine questions with their answer choices
      const questionsWithChoices = questionsData.map((question) => ({
        ...question,
        answer_choices: answerChoicesData.filter(
          (choice) => choice.question_id === question.id
        ),
      }));

      return { data: questionsWithChoices };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Get a single test (for question management view)
  async function getTest(testId) {
    try {
      if (!userData.value?.id) {
        return { error: "User not authenticated" };
      }

      const { data, error } = await supabase
        .from("tests")
        .select("*")
        .eq("id", testId)
        .eq("user_id", userData.value.id)
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Delete a question and its answer choices
  async function deleteQuestion(questionId) {
    try {
      if (!userData.value?.id) {
        return { error: "User not authenticated" };
      }

      // Verify user owns the test that contains this question
      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .select("test_id, tests!inner(user_id)")
        .eq("id", questionId)
        .single();

      if (
        questionError ||
        !questionData ||
        questionData.tests.user_id !== userData.value.id
      ) {
        return { error: "Question not found or access denied" };
      }

      // Delete answer choices first (foreign key constraint)
      await supabase
        .from("answer_choices")
        .delete()
        .eq("question_id", questionId);

      // Delete the question
      const { error } = await supabase
        .from("questions")
        .delete()
        .eq("id", questionId);

      if (error) {
        return { error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Update a question and its answer choices
  async function updateQuestion(questionId, questionText, answerChoices) {
    try {
      if (!userData.value?.id) {
        return { error: "User not authenticated" };
      }

      // Verify user owns the test that contains this question
      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .select("test_id, tests!inner(user_id)")
        .eq("id", questionId)
        .single();

      if (
        questionError ||
        !questionData ||
        questionData.tests.user_id !== userData.value.id
      ) {
        return { error: "Question not found or access denied" };
      }

      // Update the question text
      const { error: updateError } = await supabase
        .from("questions")
        .update({ text: questionText.trim() })
        .eq("id", questionId);

      if (updateError) {
        return { error: updateError.message };
      }

      // Delete existing answer choices
      await supabase
        .from("answer_choices")
        .delete()
        .eq("question_id", questionId);

      // Insert new answer choices
      if (answerChoices && answerChoices.length > 0) {
        const choicesData = answerChoices.map((choice) => ({
          question_id: questionId,
          text: choice.text.trim(),
        }));

        const { error: choicesError } = await supabase
          .from("answer_choices")
          .insert(choicesData);

        if (choicesError) {
          return { error: choicesError.message };
        }
      }

      return { success: true };
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
    // Test management functions
    createTest,
    getUserTests,
    deleteTest,
    updateTest,
    // Question management functions
    createQuestion,
    getTestQuestions,
    getTest,
    deleteQuestion,
    updateQuestion,
  };
});
