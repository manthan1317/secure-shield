import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getAuthUser } from "@/utils/auth";

// Define user type
interface User {
  _id?: string;
  name: string;
  email: string;
}

// Define auth state
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Check if user is already authenticated via cookie
let initialUser = null;
let initialAuthenticated = false;

// This code will only run on the client, not during SSR
if (typeof window !== "undefined") {
  try {
    const authUser = getAuthUser();
    if (authUser) {
      initialUser = authUser;
      initialAuthenticated = true;
    }
  } catch (error) {
    console.error("Error checking auth state:", error);
  }
}

// Initial state
const initialState: AuthState = {
  user: initialUser,
  isAuthenticated: initialAuthenticated,
  isLoading: false,
  error: null,
};

// Register user async thunk
export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    userData: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      console.log("Registering user...", { email: userData.email });
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log("Register response:", {
        status: response.status,
        success: data.success,
      });

      if (!response.ok) {
        console.error("Registration failed:", data.error || "Unknown error");
        return rejectWithValue(data.error || "Registration failed");
      }

      return data;
    } catch (error) {
      console.error("Network error during registration:", error);
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Login user async thunk
export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    userData: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      console.log("Logging in user...", { email: userData.email });
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log("Login response:", {
        status: response.status,
        success: data.success,
      });

      if (!response.ok) {
        console.error("Login failed:", data.error || "Unknown error");
        return rejectWithValue(data.error || "Login failed");
      }

      return data;
    } catch (error) {
      console.error("Network error during login:", error);
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;

      // Clear auth cookie
      if (typeof window !== "undefined") {
        document.cookie =
          "auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        console.log("Auth cookie cleared");
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        registerUser.fulfilled,
        (state, action: PayloadAction<{ user: User }>) => {
          state.isLoading = false;
          if (action.payload && action.payload.user) {
            state.user = action.payload.user;
            state.isAuthenticated = true;
          } else {
            // Handle unexpected response format
            state.error = "Invalid response format";
          }
        }
      )
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Registration failed";
      })
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<{ user: User }>) => {
          state.isLoading = false;
          if (action.payload && action.payload.user) {
            state.user = action.payload.user;
            state.isAuthenticated = true;
          } else {
            // Handle unexpected response format
            state.error = "Invalid response format";
          }
        }
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Login failed";
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
