import { csv } from "d3-fetch";
import { useEffect, useState } from "react";
import { countriesWithImage, Country } from "../domain/countries";

interface DateCountry {
  country: string;
  date: string;
}

export function useCountry(): [Country | undefined] {
  const [countryCode, setCountryCode] = useState("");

  useEffect(() => {
    csv("data.csv", (d) => {
      return { country: d.country, date: d.date };
    }).then((data) => {
      setCountryCode(
        data.length
          ? (
              data[Math.floor(Math.random() * data.length)] as DateCountry
            )?.country.toUpperCase() || ""
          : ""
      );
    });
  }, []);

  const country = countriesWithImage.find(
    (country) => country.code === countryCode
  );

  return [country];
}
