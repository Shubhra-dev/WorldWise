import { createContext, useContext } from "react";
import { useEffect, useState } from "react";

const CitiesContext = createContext();
function CitiesProvider({ children }) {
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCity, setCurrentCity] = useState({});
  const BASE_URL = "http://localhost:9000";

  useEffect(function () {
    async function fetchCities() {
      try {
        setIsLoading(true);
        const res = await fetch(`${BASE_URL}/cities`);
        const data = await res.json();
        setCities(data);
      } catch {
        alert("Problem Fetching Data");
      } finally {
        setIsLoading(false);
      }
    }
    fetchCities();
  }, []);

  async function getCurrentCity(id) {
    try {
      setIsLoading(true);
      const res = await fetch(`${BASE_URL}/cities/${id}`);
      const data = await res.json();
      setCurrentCity(data);
    } catch {
      alert("Problem Fetching Data");
    } finally {
      setIsLoading(false);
    }
  }

  async function createCity(newCity) {
    try {
      setIsLoading(true);
      const res = await fetch(`${BASE_URL}/cities`, {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: {
          "Content-type": "application/json",
        },
      });
      const data = await res.json();
      setCities([...cities, data]);
    } catch {
      alert("Problem Creating Data");
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteCity(id) {
    try {
      setIsLoading(true);
      await fetch(`${BASE_URL}/cities/${id}`, {
        method: "DELETE",
      });
      setCities(cities.filter((city) => city.id !== id));
    } catch {
      alert("Problem Deleting Data");
    } finally {
      setIsLoading(false);
    }
  }

  function calculateDistance(point1, point2) {
    const R = 6371; // Radius of the Earth in kilometers
    const lat1 = toRadians(point1.lat);
    const lat2 = toRadians(point2.lat);
    const lon1 = toRadians(point1.lng);
    const lon2 = toRadians(point2.lng);

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in kilometers
    return distance;
  }

  function toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  function nearestCity(position) {
    const filteredCity = cities.filter((city) => {
      const distance = calculateDistance(position, city.position);
      return distance <= 5;
    });

    setFilteredCities(filteredCity);
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        filteredCities,
        setCities,
        isLoading,
        currentCity,
        getCurrentCity,
        createCity,
        deleteCity,
        nearestCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}
function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined) {
    throw new Error("Outiside Context Scope");
  }
  return context;
}

export { CitiesProvider, useCities };
