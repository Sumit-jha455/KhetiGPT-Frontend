import { createContext, useContext, useEffect, useMemo, useState } from "react";

import api, {
  ENDPOINTS,
  setAuthToken,
  clearAuthToken,
} from "../services/api";

const AppContext = createContext(null);

const EMPTY_USER = {
  name: "",
  email: "",
  location: "",
  language: "English",
  farmSize: null,
  farmSizeUnit: "acre",
  soilType: "",
  waterAvailability: "",
  currentCrop: "",
  season: "",
};

const EMPTY_FARM = {
  farmSize: "",
  farmUnit: "acre",
  soilType: "",
  currentCrop: "",
  waterAvailability: "",
  season: "",
};

const mapProfile = (profile = {}) => ({
  user: {
    ...EMPTY_USER,
    ...profile,
    name: profile.name || profile.fullName || "",
    language: profile.language || profile.preferredLanguage || "English",
  },
  farm: {
    ...EMPTY_FARM,
    farmSize: profile.farmSize ?? "",
    farmUnit: profile.farmSizeUnit || "acre",
    soilType: profile.soilType || "",
    currentCrop: profile.currentCrop || "",
    waterAvailability:
      profile.waterAvailability || profile.irrigationType || "",
    season: profile.season || "",
  },
});

export function AppProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(EMPTY_USER);
  const [farm, setFarm] = useState(EMPTY_FARM);

  const applyProfile = (profile) => {
    const mapped = mapProfile(profile);
    setUser(mapped.user);
    setFarm(mapped.farm);
    return mapped.user;
  };

  useEffect(() => {
    api
      .get(ENDPOINTS.PROFILE)
      .then(({ data }) => {
        const profile = data?.data?.user;
        if (!profile) throw new Error("The server returned no user profile.");

        applyProfile(profile);
        setIsAuthenticated(true);
      })
      .catch(() => {
        clearAuthToken();
        setIsAuthenticated(false);
        setUser(EMPTY_USER);
        setFarm(EMPTY_FARM);
      })
      .finally(() => setAuthLoading(false));

    return undefined;
  }, []);

  useEffect(() => {
    const handleUnauthorised = () => {
      setIsAuthenticated(false);
      setUser(EMPTY_USER);
      setFarm(EMPTY_FARM);
    };

    window.addEventListener("khetigpt:unauthorised", handleUnauthorised);
    return () =>
      window.removeEventListener("khetigpt:unauthorised", handleUnauthorised);
  }, []);

  const login = async (details = {}, remember = false) => {
    const response = await api.post(ENDPOINTS.LOGIN, {
      email: details.email,
      password: details.password,
    });
    const { token, user: profile } = response.data.data;

    setAuthToken(token, remember);
    applyProfile(profile);
    setIsAuthenticated(true);
    return profile;
  };

  const register = async (details = {}, remember = false) => {
    const response = await api.post(ENDPOINTS.REGISTER, {
      ...details,
      name: details.name || details.fullName,
    });
    const { token, user: profile } = response.data.data;

    setAuthToken(token, remember);
    applyProfile(profile);
    setIsAuthenticated(true);
    return profile;
  };

  const logout = async () => {
    try {
      if (getAuthToken()) await api.post(ENDPOINTS.LOGOUT);
    } finally {
      clearAuthToken();
      setIsAuthenticated(false);
      setUser(EMPTY_USER);
      setFarm(EMPTY_FARM);
    }
  };

  const updateProfile = async (patch) => {
    const response = await api.put(ENDPOINTS.PROFILE, patch);
    const profile = response.data?.data?.user;
    if (!profile) throw new Error("The server returned no updated profile.");

    applyProfile(profile);
    return profile;
  };

  const updateFarm = (patch) => {
    setFarm((current) => ({ ...current, ...patch }));
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      authLoading,
      login,
      register,
      logout,
      user,
      farm,
      updateProfile,
      updateFarm,
    }),
    [isAuthenticated, authLoading, user, farm]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside <AppProvider>");
  return context;
}
