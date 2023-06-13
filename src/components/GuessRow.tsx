import {
  computeProximityPercent,
  Direction,
  formatDistance,
  generateSquareCharacters,
} from "../domain/geography";
import { Guess } from "../domain/guess";
import React, { useCallback, useEffect, useState } from "react";
import CountUp from "react-countup";
import { SettingsData } from "../hooks/useSettings";
import { getCountryPrettyName } from "../domain/countries";

const DIRECTION_ARROWS: Record<Direction, string> = {
  N: "⬆️",
  NNE: "↗️",
  NE: "↗️",
  ENE: "↗️",
  E: "➡️",
  ESE: "↘️",
  SE: "↘️",
  SSE: "↘️",
  S: "⬇️",
  SSW: "↙️",
  SW: "↙️",
  WSW: "↙️",
  W: "⬅️",
  WNW: "↖️",
  NW: "↖️",
  NNW: "↖️",
};

const DIRECTION_ARROWS_APRIL_FOOLS: Record<number, string> = {
  0: "🐶",
  1: "🌪",
  2: "🏚",
  3: "🚲",
  4: "👠",
  5: "🦁",
  6: "🤖",
};

const SQUARE_ANIMATION_LENGTH = 250;
type AnimationState = "NOT_STARTED" | "RUNNING" | "ENDED";

interface GuessRowProps {
  index: number;
  guess?: Guess;
  settingsData: SettingsData;
  countryInputRef?: React.RefObject<HTMLInputElement>;
  isAprilFools?: boolean;
}

export function GuessRow({
  index,
  guess,
  settingsData,
  countryInputRef,
  isAprilFools = false,
}: GuessRowProps) {
  const { distanceUnit, theme } = settingsData;
  const fromProximity =
    guess != null ? computeProximityPercent(guess.fromDistance) : 0;
  const toProximity =
    guess != null ? computeProximityPercent(guess.toDistance) : 0;
  const fromSquares = generateSquareCharacters(fromProximity, theme);
  const toSquares = generateSquareCharacters(toProximity, theme);

  const [animationState, setAnimationState] =
    useState<AnimationState>("NOT_STARTED");

  useEffect(() => {
    if (guess == null) {
      return;
    }

    setAnimationState("RUNNING");
    const timeout = setTimeout(() => {
      setAnimationState("ENDED");
    }, SQUARE_ANIMATION_LENGTH * 6);

    return () => {
      clearTimeout(timeout);
    };
  }, [guess]);

  const handleClickOnEmptyRow = useCallback(() => {
    if (countryInputRef?.current != null) {
      countryInputRef?.current.focus();
    }
  }, [countryInputRef]);

  switch (animationState) {
    case "NOT_STARTED":
      return (
        <div
          onClick={handleClickOnEmptyRow}
          className={`bg-stone-200 rounded-lg my-1 col-span-7 h-8`}
        />
      );
    case "RUNNING":
      return (
        <>
          <div
            className={`flex text-2xl w-full justify-evenly items-center col-span-6 border-2 h-8`}
          >
            {fromSquares.map((character, index) => (
              <div
                key={index}
                className="opacity-0 animate-reveal"
                style={{
                  animationDelay: `${SQUARE_ANIMATION_LENGTH * index}ms`,
                }}
              >
                {character}
              </div>
            ))}
          </div>
          <div className="border-2 h-8 col-span-1 animate-reveal">
            <CountUp
              end={isAprilFools ? 100 : fromProximity}
              suffix="%"
              duration={(SQUARE_ANIMATION_LENGTH * 5) / 1000}
            />
          </div>
          <div
            className={`flex text-2xl w-full justify-evenly items-center col-span-6 border-2 h-8`}
          >
            {toSquares.map((character, index) => (
              <div
                key={index}
                className="opacity-0 animate-reveal"
                style={{
                  animationDelay: `${SQUARE_ANIMATION_LENGTH * index}ms`,
                }}
              >
                {character}
              </div>
            ))}
          </div>
          <div className="border-2 h-8 col-span-1 animate-reveal">
            <CountUp
              end={isAprilFools ? 100 : toProximity}
              suffix="%"
              duration={(SQUARE_ANIMATION_LENGTH * 5) / 1000}
            />
          </div>
        </>
      );
    case "ENDED":
      return (
        <>
          <div
            className={
              guess?.fromDistance === 0
                ? "bg-oec-yellow rounded-lg flex items-center h-8 col-span-3 animate-reveal pl-2"
                : "bg-gray-200 rounded-lg flex items-center h-8 col-span-3 animate-reveal pl-2"
            }
          >
            <p className="text-ellipsis overflow-hidden whitespace-nowrap">
              {getCountryPrettyName(guess?.fromName, isAprilFools)}
            </p>
          </div>
          <div
            className={
              guess?.fromDistance === 0
                ? "bg-oec-yellow rounded-lg flex items-center justify-center h-8 col-span-2 animate-reveal"
                : "bg-gray-200 rounded-lg flex items-center justify-center h-8 col-span-2 animate-reveal"
            }
          >
            {guess && isAprilFools
              ? "⁇"
              : guess
              ? formatDistance(guess.fromDistance, distanceUnit)
              : null}
          </div>
          <div
            className={
              guess?.fromDistance === 0
                ? "bg-oec-yellow rounded-lg flex items-center justify-center h-8 col-span-1 animate-reveal"
                : "bg-gray-200 rounded-lg flex items-center justify-center h-8 col-span-1 animate-reveal"
            }
          >
            {guess?.fromDistance === 0
              ? "🎉"
              : guess && isAprilFools
              ? "⁇"
              : guess
              ? DIRECTION_ARROWS[guess.fromDirection]
              : null}
          </div>
          <div
            className={
              guess?.fromDistance === 0
                ? "bg-oec-yellow rounded-lg flex items-center justify-center h-8 col-span-1 animate-reveal animate-pop"
                : "bg-gray-200 rounded-lg flex items-center justify-center h-8 col-span-1 animate-reveal animate-pop"
            }
          >
            {isAprilFools
              ? DIRECTION_ARROWS_APRIL_FOOLS[index]
              : `${fromProximity}%`}
          </div>

          <div
            className={
              guess?.toDistance === 0
                ? "bg-oec-yellow rounded-lg flex items-center h-8 col-span-3 animate-reveal pl-2"
                : "bg-gray-200 rounded-lg flex items-center h-8 col-span-3 animate-reveal pl-2"
            }
          >
            <p className="text-ellipsis overflow-hidden whitespace-nowrap">
              {getCountryPrettyName(guess?.toName, isAprilFools)}
            </p>
          </div>
          <div
            className={
              guess?.toDistance === 0
                ? "bg-oec-yellow rounded-lg flex items-center justify-center h-8 col-span-2 animate-reveal"
                : "bg-gray-200 rounded-lg flex items-center justify-center h-8 col-span-2 animate-reveal"
            }
          >
            {guess && isAprilFools
              ? "⁇"
              : guess
              ? formatDistance(guess.toDistance, distanceUnit)
              : null}
          </div>
          <div
            className={
              guess?.toDistance === 0
                ? "bg-oec-yellow rounded-lg flex items-center justify-center h-8 col-span-1 animate-reveal"
                : "bg-gray-200 rounded-lg flex items-center justify-center h-8 col-span-1 animate-reveal"
            }
          >
            {guess?.toDistance === 0
              ? "🎉"
              : guess && isAprilFools
              ? "⁇"
              : guess
              ? DIRECTION_ARROWS[guess.toDirection]
              : null}
          </div>
          <div
            className={
              guess?.toDistance === 0
                ? "bg-oec-yellow rounded-lg flex items-center justify-center h-8 col-span-1 animate-reveal animate-pop"
                : "bg-gray-200 rounded-lg flex items-center justify-center h-8 col-span-1 animate-reveal animate-pop"
            }
          >
            {isAprilFools
              ? DIRECTION_ARROWS_APRIL_FOOLS[index]
              : `${toProximity}%`}
          </div>
        </>
      );
  }
}
