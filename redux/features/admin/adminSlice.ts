import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Define admin user type
interface AdminUser {
  _id?: string;
  name: string;
  email: string;
  role: string;
}

// Define admin auth state
interface AdminAuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Check if admin is already authenticated via cookie
let initialUser = null;
let initialAuthenticated = false;

// This code will only run on the client, not during SSR
if (typeof window !== "undefined") {
  try {
    const adminCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("adminAuth="));

    if (adminCookie) {
      const adminToken = adminCookie.split("=")[1];
      // Use the browser's atob for base64 decoding
      const decodedData = atob(adminToken);
      const adminData = JSON.parse(decodedData);

      if (adminData) {
        initialUser = adminData;
        initialAuthenticated = true;
      }
    }
  } catch (error) {
    console.error("Error checking admin auth state:", error);
  }
}

// Initial state
const initialState: AdminAuthState = {
  user: initialUser,
  isAuthenticated: initialAuthenticated,
  isLoading: false,
  error: null,
};

// Register admin async thunk
export const registerAdmin = createAsyncThunk(
  "admin/register",
  async (
    userData: {
      name: string;
      email: string;
      password: string;
      adminCode: string;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log("Registering admin...", { email: userData.email });
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log("Admin register response:", {
        status: response.status,
        success: data.success,
      });

      if (!response.ok) {
        console.error(
          "Admin registration failed:",
          data.error || "Unknown error"
        );
        return rejectWithValue(data.error || "Registration failed");
      }

      return data;
    } catch (error) {
      console.error("Network error during admin registration:", error);
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Login admin async thunk
export const loginAdmin = createAsyncThunk(
  "admin/login",
  async (
    userData: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      console.log("Logging in admin...", { email: userData.email });
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log("Admin login response:", {
        status: response.status,
        success: data.success,
      });

      if (!response.ok) {
        console.error("Admin login failed:", data.error || "Unknown error");
        return rejectWithValue(data.error || "Login failed");
      }

      return data;
    } catch (error) {
      console.error("Network error during admin login:", error);
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Admin auth slice
const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    adminLogout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;

      // Clear admin auth cookie
      if (typeof window !== "undefined") {
        document.cookie =
          "adminAuth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        console.log("Admin auth cookie cleared");
      }
    },
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register cases
      .addCase(registerAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        registerAdmin.fulfilled,
        (state, action: PayloadAction<{ user: AdminUser }>) => {
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
      .addCase(registerAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Registration failed";
      })
      // Login cases
      .addCase(loginAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        loginAdmin.fulfilled,
        (state, action: PayloadAction<{ user: AdminUser }>) => {
          state.isLoading = false;
          if (action.payload && action.payload.user) {
            state.user = action.payload.user;
            state.isAuthenticated = true;

            // Store admin auth in cookie
            if (typeof window !== "undefined") {
              try {
                const userString = JSON.stringify(action.payload.user);
                // Use the browser's btoa for base64 encoding
                const encodedUserData = btoa(userString);
                document.cookie = `adminAuth=${encodedUserData}; path=/; max-age=86400`; // 1 day expiry
                console.log("Admin auth cookie set successfully");
              } catch (cookieError) {
                console.error("Error setting admin auth cookie:", cookieError);
              }
            }
          } else {
            // Handle unexpected response format
            state.error = "Invalid response format";
          }
        }
      )
      .addCase(loginAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Login failed";
      });
  },
});

export const { adminLogout, clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
