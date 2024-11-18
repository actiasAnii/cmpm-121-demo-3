// @deno-types="npm:@types/leaflet@^1.9.14"
import leaflet from "leaflet";

import "leaflet/dist/leaflet.css";
import "./leafletWorkaround.ts";
import "./style.css";

import luck from "./luck.ts";

const START_POSITION = leaflet.latLng(36.98949379578401, -122.06277128548504); // classroom at oakes

const TILE_SIZE = 1e-4;
const CACHE_PROXIMITY = 8;
const SPAWN_CHANCE = 0.1;
const ZOOM_LEVEL = 19;
let collectedCoins = 0;

// map set up
const map = leaflet.map(document.getElementById("map")!, {
  center: START_POSITION,
  zoom: ZOOM_LEVEL,
  minZoom: ZOOM_LEVEL,
  maxZoom: ZOOM_LEVEL,
  zoomControl: false,
  scrollWheelZoom: false,
});

leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const playerMarker = leaflet.marker(START_POSITION);
playerMarker.bindTooltip("You are here!").addTo(map);
const statusPanel = document.getElementById("statusPanel")!;
statusPanel.innerHTML = `coins collected: ${collectedCoins}`;

function updateStatus() {
  statusPanel.innerHTML = `coins collected: ${collectedCoins}`;
}

function createCache(i: number, j: number) {
  const cachePosition = leaflet.latLng(
    START_POSITION.lat + i * TILE_SIZE,
    START_POSITION.lng + j * TILE_SIZE,
  );

  // put cache on the map
  const cacheMarker = leaflet.circleMarker(cachePosition, {
    color: "blue",
    radius: 8,
  }).addTo(map);

  // deterministic based on location coin generation
  const coinCount = Math.floor(luck([i, j, "coins"].toString()) * 50) + 1;
  let availableCoins = coinCount;

  // handle popups
  const getPopupContent = () => `
   <div>
     <h3>Cache at (${i}, ${j})</h3>
     <p>Coins available: <span id="availableCoins-${i}-${j}">${availableCoins}</span></p>
     <button id="collectCoins-${i}-${j}" ${
    availableCoins === 0 ? "disabled" : ""
  }>Collect Coins</button>
     <button id="depositCoins-${i}-${j}" ${
    collectedCoins === 0 ? "disabled" : ""
  }>Deposit Coins</button>
   </div>
 `;
  cacheMarker.bindPopup(getPopupContent());

  // handle interaction with popuup
  cacheMarker.on("popupopen", () => {
    const collectButton = document.getElementById(
      `collectCoins-${i}-${j}`,
    ) as HTMLButtonElement;
    const depositButton = document.getElementById(
      `depositCoins-${i}-${j}`,
    ) as HTMLButtonElement;
    const coinDisplay = document.getElementById(
      `availableCoins-${i}-${j}`,
    ) as HTMLButtonElement;

    const updateButtonStates = () => {
      collectButton.disabled = availableCoins === 0;
      depositButton.disabled = collectedCoins === 0;
    };

    collectButton.addEventListener("click", () => {
      if (availableCoins > 0) {
        collectedCoins++;
        availableCoins--;
        updateStatus();
        coinDisplay.textContent = availableCoins.toString();
        updateButtonStates();
      }
    });

    depositButton.addEventListener("click", () => {
      if (collectedCoins > 0) {
        collectedCoins--;
        availableCoins++;
        updateStatus();
        coinDisplay.textContent = availableCoins.toString();
        updateButtonStates();
      }
    });
    updateButtonStates();
  });
}

// generate randome cache locations around player
function generateCaches() {
  for (let x = -CACHE_PROXIMITY; x <= CACHE_PROXIMITY; x++) {
    for (let y = -CACHE_PROXIMITY; y <= CACHE_PROXIMITY; y++) {
      if (luck(`${x},${y}`) < SPAWN_CHANCE) {
        createCache(x, y);
      }
    }
  }
}
generateCaches();
