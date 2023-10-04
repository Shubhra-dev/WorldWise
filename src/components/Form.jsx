// ""

import { useEffect, useState } from "react";
import Button from "./button";
import Message from "./Message";
import styles from "./Form.module.css";
import BackButton from "./BackButton";
import { useUrlPosition } from "../hooks/useUrlPosition";
import Spinner from "./Spinner";
import { useNavigate } from "react-router-dom";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useCities } from "../context/CittiesContext";

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function Form() {
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [lat, lng] = useUrlPosition();
  const { createCity } = useCities();
  const [isLoadingPosition, setIsLoadingPosition] = useState(false);
  const [emoji, setEmoji] = useState("");
  const [geoError, setGeoError] = useState("");
  const navigate = useNavigate();
  const BASE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

  function handleSubmit(e) {
    e.preventDefault();
    const newCity = {
      cityName,
      country,
      date,
      notes,
      emoji,
      position: { lat, lng },
    };

    createCity(newCity);
    navigate("/app/cities");
  }

  useEffect(
    function () {
      async function fetchCityData() {
        try {
          setIsLoadingPosition(true);
          setGeoError("");
          const res = await fetch(
            `${BASE_URL}?latitude=${lat}&longitude=${lng}`
          );
          const data = await res.json();
          if (!data.countryCode) {
            console.log(data.countryCode);
            throw new Error(
              "Doesn't seem to be a city. Click somewhere else!!"
            );
          }
          setCityName(data.city || data.locality);
          setCountry(data.country);
          setEmoji(convertToEmoji(data.countryCode));
        } catch (err) {
          setGeoError(err.message);
        } finally {
          setIsLoadingPosition(false);
        }
      }
      fetchCityData();
    },
    [lat, lng]
  );

  if (isLoadingPosition) return <Spinner />;
  if (geoError) return <Message message={geoError} />;
  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        {/* <input
          id="date"
          onChange={(e) => setDate(e.target.value)}
          value={date}
        /> */}
        <DatePicker
          id="date"
          onChange={(date) => setDate(date)}
          selected={date}
          dateFormat="dd/MM/yyyy"
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <BackButton />
      </div>
    </form>
  );
}

export default Form;
