import { csv } from "d3-fetch";
import { useEffect, useState } from "react";
import { countriesWithImage, Country } from "../domain/countries";

interface DateCountry {
  country: string;
  date: string;
}

export function useCountries(): [Country | undefined, Country | undefined] {
  const [fromCountryCode, setFromCountryCode] = useState("");
  const [toCountryCode, setToCountryCode] = useState("");

  useEffect(() => {
    csv("data.csv", (d) => {
      return { country: d.country, date: d.date };
    }).then((data) => {
      const fromIdx = Math.floor(Math.random() * data.length);
      let toIdx = 0;
      do {
        toIdx = Math.floor(Math.random() * data.length);
      } while (fromIdx === toIdx);

      setFromCountryCode(
        data.length
          ? (data[fromIdx] as DateCountry)?.country.toUpperCase() || ""
          : ""
      );

      setToCountryCode(
        data.length
          ? (data[toIdx] as DateCountry)?.country.toUpperCase() || ""
          : ""
      );
    });
  }, []);

  const fromCountry = countriesWithImage.find(
    (country) => country.code === fromCountryCode
  );

  const toCountry = countriesWithImage.find(
    (country) => country.code === toCountryCode
  );

  return [fromCountry, toCountry];
}
