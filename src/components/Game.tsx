import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  countries,
  getCountryName,
  sanitizeCountryName,
  countryISOMapping,
  fictionalCountries,
} from "../domain/countries";
import { useGuesses } from "../hooks/useGuesses";
import { CountryInput } from "./CountryInput";
import * as geolib from "geolib";
import { Share } from "./Share";
import { Guesses } from "./Guesses";
import { useTranslation } from "react-i18next";
import { SettingsData } from "../hooks/useSettings";
import { useMode } from "../hooks/useMode";
import { useCountries } from "../hooks/useCountry";
import axios from "axios";

const MAX_TRY_COUNT = 6;

interface GameProps {
  settingsData: SettingsData;
}

export function Game({ settingsData }: GameProps) {
  const { t, i18n } = useTranslation();
  const isAprilFools = false;
  const dayString = "2022-04-01";

  const countryInputRef = useRef<HTMLInputElement>(null);

  const targetCountries = useCountries();

  const [ipData, setIpData] = useState(null);
  const [won, setWon] = useState(false);
  const [currentFromGuess, setCurrentFromGuess] = useState<string>("");
  const [currentToGuess, setCurrentToGuess] = useState<string>("");
  const [fromCountryValue, setFromCountryValue] = useState<string>("");
  const [toCountryValue, setToCountryValue] = useState<string>("");
  const [guesses, addGuess] = useGuesses(dayString);
  const [hideImageMode, setHideImageMode] = useMode(
    "hideImageMode",
    dayString,
    settingsData.noImageMode
  );
  const [rotationMode, setRotationMode] = useMode(
    "rotationMode",
    dayString,
    settingsData.rotationMode
  );

  const gameEnded =
    guesses.length === MAX_TRY_COUNT ||
    (guesses[guesses.length - 1]?.fromDistance === 0 &&
      guesses[guesses.length - 1]?.toDistance === 0);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!targetCountries[0] || !targetCountries[1]) return;
      const getIpData = async () => {
        const res = await axios.get("https://geolocation-db.com/json/");
        setIpData(res.data);
      };
      const items = isAprilFools ? fictionalCountries : countries;
      const guessedFromCountry = items.find(
        (country) =>
          sanitizeCountryName(
            getCountryName(i18n.resolvedLanguage, country)
          ) === sanitizeCountryName(currentFromGuess)
      );
      const guessedToCountry = items.find(
        (country) =>
          sanitizeCountryName(
            getCountryName(i18n.resolvedLanguage, country)
          ) === sanitizeCountryName(currentToGuess)
      );

      if (guessedFromCountry == null || guessedToCountry == null) {
        toast.error(t("unknownCountry"));
        return;
      }

      const newGuess = {
        fromName: currentFromGuess,
        toName: currentToGuess,
        fromDistance: geolib.getDistance(
          guessedFromCountry,
          targetCountries[0]
        ),
        toDistance: geolib.getDistance(guessedToCountry, targetCountries[1]),
        fromDirection: geolib.getCompassDirection(
          guessedFromCountry,
          targetCountries[0]
        ),
        toDirection: geolib.getCompassDirection(
          guessedToCountry,
          targetCountries[1]
        ),
      };

      addGuess(newGuess);
      setCurrentFromGuess("");
      setCurrentToGuess("");
      setFromCountryValue("");
      setToCountryValue("");

      if (newGuess.fromDistance === 0 && newGuess.toDistance === 0) {
        setWon(true);
        getIpData();
        toast.success(t("welldone"), { delay: 2000 });
      }
    },
    [
      addGuess,
      targetCountries,
      currentFromGuess,
      currentToGuess,
      i18n.resolvedLanguage,
      t,
      isAprilFools,
    ]
  );

  useEffect(() => {
    const getIpData = async () => {
      const res = await axios.get("https://geolocation-db.com/json/");
      setIpData(res.data);
    };
    if (
      guesses.length === MAX_TRY_COUNT &&
      guesses[guesses.length - 1].fromDistance > 0
    ) {
      const countryName = targetCountries[0]
        ? getCountryName(i18n.resolvedLanguage, targetCountries[0])
        : "";
      if (countryName) {
        toast.info(countryName.toUpperCase(), {
          autoClose: false,
          delay: 2000,
        });
      }
      getIpData();
    }

    if (
      guesses.length === MAX_TRY_COUNT &&
      guesses[guesses.length - 1].toDistance > 0
    ) {
      const countryName = targetCountries[1]
        ? getCountryName(i18n.resolvedLanguage, targetCountries[1])
        : "";
      if (countryName) {
        toast.info(countryName.toUpperCase(), {
          autoClose: false,
          delay: 2000,
        });
      }
      getIpData();
    }
  }, [targetCountries, guesses, i18n.resolvedLanguage]);

  useEffect(() => {
    if (ipData) {
      axios
        .post("/tradle/score", {
          date: new Date(),
          guesses,
          ip: ipData,
          answer: targetCountries,
          won,
        })
        .catch(function (error) {
          if (error.response) {
            // Request made and server responded
            console.log(
              `⚠️ ${error.response.status}: Unable to post tradle score.`
            );
          } else if (error.request) {
            // The request was made but no response was received
            console.log(error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log("Error", error.message);
          }
        });
    }
  }, [guesses, ipData, won, targetCountries]);

  let iframeSrc = "https://oec.world/en/tradle/aprilfools.html";
  let oecFromLink = "https://oec.world/";
  let oecToLink = "https://oec.world/";
  const fromCountry3LetterCode = targetCountries[0]?.code
    ? countryISOMapping[targetCountries[0].code].toLowerCase()
    : "";
  const toCountry3LetterCode = targetCountries[1]?.code
    ? countryISOMapping[targetCountries[1].code].toLowerCase()
    : "";

  if (!isAprilFools) {
    iframeSrc = `https://oec.world/en/visualize/embed/tree_map/hs92/export/${fromCountry3LetterCode}/${toCountry3LetterCode}/show/2021/?controls=false&title=false&click=false`;
    oecFromLink = `https://oec.world/en/profile/country/${fromCountry3LetterCode}`;
    oecToLink = `https://oec.world/en/profile/country/${toCountry3LetterCode}`;
  }

  return (
    <div className="flex-grow flex flex-col mx-2 relative">
      {hideImageMode && !gameEnded && (
        <button
          className="border-2 uppercase my-2 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-slate-800 dark:active:bg-slate-700"
          type="button"
          onClick={() => setHideImageMode(false)}
        >
          {t("showCountry")}
        </button>
      )}
      {/* <div className="my-1 mx-auto"> */}
      <h2 className="font-bold text-center">
        Which country exports these goods to which country?
      </h2>
      <div
        style={{
          position: "relative",
          paddingBottom: "70%",
          paddingTop: "25px",
          height: 0,
        }}
      >
        {fromCountry3LetterCode ? (
          <iframe
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
            title="Country to guess"
            width="390"
            height="315"
            src={iframeSrc}
            frameBorder="0"
          />
        ) : null}
      </div>
      {rotationMode && !hideImageMode && !gameEnded && (
        <button
          className="border-2 uppercase mb-2 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-slate-800 dark:active:bg-slate-700"
          type="button"
          onClick={() => setRotationMode(false)}
        >
          {t("cancelRotation")}
        </button>
      )}
      <Guesses
        rowCount={MAX_TRY_COUNT}
        guesses={guesses}
        settingsData={settingsData}
        countryInputRef={countryInputRef}
        isAprilFools={isAprilFools}
      />
      <div className="my-2">
        {gameEnded ? (
          <>
            <Share
              guesses={guesses}
              dayString={dayString}
              settingsData={settingsData}
              hideImageMode={hideImageMode}
              rotationMode={rotationMode}
              isAprilFools={isAprilFools}
            />
            <a
              className="underline w-full text-center block mt-4 flex justify-center"
              href={oecFromLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              {t("showOnGoogleMaps")}
            </a>
            {isAprilFools ? (
              <div className="w-full text-center block mt-4 flex flex-col justify-center text-2xl font-bold">
                <div>🐶 🚲 🌪 🏚</div>
                <div>Happy April Fools!</div>
                <div>👠 🤖 🦁 🎍</div>
              </div>
            ) : null}
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="">
              <CountryInput
                placeholder="Exporting country"
                countryValue={fromCountryValue}
                setCountryValue={setFromCountryValue}
                setCurrentGuess={setCurrentFromGuess}
                isAprilFools={isAprilFools}
              />
              <CountryInput
                placeholder="Importing country"
                countryValue={toCountryValue}
                setCountryValue={setToCountryValue}
                setCurrentGuess={setCurrentToGuess}
                isAprilFools={isAprilFools}
              />
              <div className="text-left">
                <button className="my-2 inline-block justify-end bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded items-center">
                  {isAprilFools ? "🪄" : "🌍"} <span>Guess</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
