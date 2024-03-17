import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Autosuggest from "react-autosuggest";
import "./App.css";
import MyMap from "./Map"; // Importez le composant Map

function App() {
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [suggestionsVehicle, setSuggestionsVehicle] = useState([]);
  const [lastSelectedSuggestionVehicle, setLastSelectedSuggestionVehicle] =
    useState(null);

  const headers = {
    "Content-Type": "application/json",
    "x-client-id": "659fe12003f11572e9c6a568",
    "x-app-id": "659fe12003f11572e9c6a56a",
  };

  const getVehicleSuggestions = ({ page, size = 10, search = "" }) => {
    const vehicleListQuery = {
      query: `
      query vehicleList($page: Int, $size: Int, $search: String) {
        vehicleList(page: $page, size: $size, search: $search, filter: { drivetrain: BEV }) {
          id
          naming {
            make
            model
            chargetrip_version
          }
          media {
            image {
              thumbnail_url
            }
          }
          connectors {
            standard
            power
            max_electric_power
            time
            speed
          }
          adapters {
            standard
            power
            max_electric_power
            time
            speed
          }
          range {
            chargetrip_range {
              best
              worst
            }
          }
        }
      }
      `,
      variables: { page, size, search },
    };

    fetch("https://api.chargetrip.io/graphql", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(vehicleListQuery),
    })
      .then((response) => response.json())
      .then((data) => {
        setSuggestionsVehicle(data.data?.vehicleList || []);
      })
      .catch((error) =>
        console.error("Erreur lors de la requête à Chargetrip:", error)
      );
  };

  const onSuggestionsVehicleFetchRequested = ({ value }) => {
    getVehicleSuggestions({ page: 1, size: 10, search: value });
  };

  const onSuggestionsVehicleClearRequested = () => {
    setSuggestionsVehicle([]);
  };

  const onSuggestionVehicleSelected = (_, { suggestion }) => {
    setVehicleSearch(suggestion.naming.model);
    setLastSelectedSuggestionVehicle(suggestion);
  };

  const renderSuggestionVehicle = (suggestion) => (
    <div className="suggestion-item">
      <img
        className="suggestion-thumbnail"
        src={suggestion.media.image.thumbnail_url}
        alt={`Thumbnail ${suggestion.naming.make} ${suggestion.naming.model}`}
      />
      <div className="suggestion-details">
        <p className="suggestion-make">{suggestion.naming.make}</p>
        <p className="suggestion-model">{suggestion.naming.model}</p>
        <p className="suggestion-version">
          {suggestion.naming.chargetrip_version}
        </p>
      </div>
    </div>
  );

  const apiKey = "5b3ce3597851110001cf6248605adc0eb50d4a4a81560f838d7d4ca3";

  const [startSearchValue, setStartSearchValue] = useState("");
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [startRes, setStartRes] = useState(null);

  const getStartSuggestions = async (value) => {
    try {
      const response = await fetch(
        `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(
          value
        )}`
      );
      const data = await response.json();

      if (data && data.features) {
        const suggestions = data.features.map((feature) => ({
          label: feature.properties.label,
          coordinates: feature.geometry.coordinates,
        }));
        setStartSuggestions(suggestions);
      } else {
        setStartSuggestions([]);
      }
    } catch (error) {
      console.error("Erreur lors de la recherche de suggestions:", error);
    }
  };

  const onStartSuggestionsFetchRequested = ({ value }) => {
    getStartSuggestions(value);
  };

  const onStartSuggestionsClearRequested = () => {
    setStartSuggestions([]);
  };

  const onStartSuggestionSelected = (_, { suggestion }) => {
    // Utilisez les coordonnées du lieu sélectionné

    setStartRes(suggestion);
  };

  const getStartSuggestionValue = (suggestion) => suggestion.label;

  const renderStartSuggestion = (suggestion) => <div>{suggestion.label}</div>;

  const [destinationSearchValue, setDestinationSearchValue] = useState("");
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [destinationRes, setDestinationRes] = useState(null);

  const getDestinationSuggestions = async (value) => {
    try {
      const response = await fetch(
        `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(
          value
        )}`
      );
      const data = await response.json();

      if (data && data.features) {
        const suggestions = data.features.map((feature) => ({
          label: feature.properties.label,
          coordinates: feature.geometry.coordinates,
        }));
        setDestinationSuggestions(suggestions);
      } else {
        setDestinationSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching destination suggestions:", error);
    }
  };

  const onDestinationSuggestionsFetchRequested = ({ value }) => {
    getDestinationSuggestions(value);
  };

  const onDestinationSuggestionsClearRequested = () => {
    setDestinationSuggestions([]);
  };

  const onDestinationSuggestionSelected = (_, { suggestion }) => {
    // Utilize the coordinates of the selected destination

    setDestinationRes(suggestion);
  };

  const getDestinationSuggestionValue = (suggestion) => suggestion.label;

  const renderDestinationSuggestion = (suggestion) => (
    <div>{suggestion.label}</div>
  );

  const [routeGeometry, setRouteGeometry] = useState(null);
  const [nameRoute, setNameRoute] = useState([]);

  const retrieveCloseStationsFromRadiusAndCenter = async (radius, center) => {
    try {
      const verifiedRadius = radius <= 0 ? radius + 1 : radius;
      const point = `POINT(${center[0]} ${center[1]})`;
      const distance = `distance(geo_point_borne,geom'${point}', ${verifiedRadius}km)`;

      const response = await fetch(
        `https://odre.opendatasoft.com/api/explore/v2.1/catalog/datasets/bornes-irve/records?limit=100&where=${distance}`,
        {
          headers: {
            Accept: "application/json; charset=utf-8",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        return result.results;
      } else {
        console.error(`Erreur de requête : ${response.statusText}`);
        return [];
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des stations de charge:",
        error
      );
      return [];
    }
  };

  const areCoordinatesEqual = (coord1, coord2) => {
    return coord1[0] === coord2[0] && coord1[1] === coord2[1];
  };

  const getPointWithDistance = (geometry, distanceVehicle) => {
    let accumulatedDistance = 0;
    let i = 1;

    while (i < geometry.length - 1 && accumulatedDistance < distanceVehicle) {
      const segmentDistance = calculateDistance(geometry[i - 1], geometry[i]);

      accumulatedDistance += segmentDistance;
      i++;
    }

    return geometry[i - 1];
  };

  let chargingStations = [];

  const getBornesDirection = async () => {
    let currentPosition = startRes?.coordinates;
    const finalPosition = destinationRes?.coordinates;
    const distanceMaxVehicle =
      lastSelectedSuggestionVehicle.range.chargetrip_range.worst;
    const destinationCoordinates = destinationRes?.coordinates; // Utilisez la première suggestion comme destination

    let start = `${currentPosition[0]},${currentPosition[1]}`;
    const destination = `${destinationCoordinates[0]},${destinationCoordinates[1]}`;
    const options = '&options={"geometry_format":"geojson","geometry":"true"}';
    const apiUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start}&end=${destination}${options}`;

    const response = await fetch(apiUrl);
    const dataStart = await response.json();

    let distanceTotalTraj =
      dataStart.features[0].properties.summary.distance / 1000;
    let radius = 0;
    if (distanceMaxVehicle < 50) {
      radius = distanceMaxVehicle;
    } else {
      radius = 50;
    }

    const distanceRecherche = distanceMaxVehicle - radius;
    let tpm = 0;
    let dataTmp = dataStart;
    while (distanceTotalTraj > distanceMaxVehicle && tpm < 5) {
      let coordPointTest = getPointWithDistance(
        dataTmp.features[0].geometry.coordinates,
        distanceRecherche
      );

      const chargeStationTemp = await retrieveCloseStationsFromRadiusAndCenter(
        radius,
        coordPointTest
      );

      let closestStation = [0.0, 0.0];
      let minDistance = Infinity;

      for (let i = 0; i < chargeStationTemp.length; i++) {
        let station = chargeStationTemp[i];

        const stationCoords = [station.xlongitude, station.ylatitude];

        // Calculer la distance entre la station et la destination
        const distanceToDestination = calculateDistance(
          stationCoords,
          finalPosition
        );

        // Comparer la distance avec la plus petite distance actuelle
        if (
          distanceToDestination < minDistance &&
          !areCoordinatesEqual(closestStation, currentPosition)
        ) {
          minDistance = distanceToDestination;
          closestStation = stationCoords;
        }
      }
      // Mettre à jour l'état avec les coordonnées de la station la plus proche
      chargingStations.push(closestStation);
      currentPosition = closestStation;

      let starttmp = `${closestStation[0]},${closestStation[1]}`;

      const apiUrl2 = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${starttmp}&end=${destination}${options}`;

      const responsetmp = await fetch(apiUrl2);
      dataTmp = await responsetmp.json(); // Renommez la variable à l'intérieur de la boucle
      distanceTotalTraj =
        dataTmp.features[0].properties.summary.distance / 1000;

      tpm += 1;
    }
  };

  // Fonction pour calculer la distance entre deux points (utilisez la formule Haversine)
  const calculateDistance = (point1, point2) => {
    const [lat1, lon1] = point1;
    const [lat2, lon2] = point2;

    const R = 6371; // Rayon de la Terre en kilomètres
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  };

  const testDirection = async () => {
    // Vérifier si lastSelectedSuggestionVehicle, startRes et destinationRes ne sont pas null
    if (!lastSelectedSuggestionVehicle || !startRes || !destinationRes) {
      toast.error("Veuillez compléter tous les champs.");
      return;
    }
    const startCoordinates = startRes?.coordinates;
    const destinationCoordinates = destinationRes?.coordinates;

    await getBornesDirection();

    const coordinatesArray = [startCoordinates];
    const namesArray = [startRes?.label]; // Tableau pour stocker les noms correspondants

    for (let i = 0; i < chargingStations.length; i++) {
      const station = chargingStations[i];
      coordinatesArray.push(station);
      namesArray.push(`Borne ${i + 1}`);
    }
    coordinatesArray.push(destinationCoordinates);
    namesArray.push(destinationRes?.label);

    const coordObject = {
      coordinates: coordinatesArray,
    };
    const coordJSON = JSON.stringify(coordObject);

    try {
      setRouteGeometry(null);
      setNameRoute([]);

      const response = await fetch(
        "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
        {
          method: "POST",
          headers: {
            Accept:
              "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
            "Content-Type": "application/json",
            Authorization: apiKey,
          },
          body: coordJSON,
        }
      );

      const data = await response.json();

      if (data && data.features && data.features.length > 0) {
        const routeGeometryRes = data;
        setRouteGeometry(routeGeometryRes);
        await setNameRoute(namesArray);
        let nbBornes = namesArray.length - 2;
        let totaltemps =
          routeGeometryRes.features[0].properties.summary.duration / 60;
        let tempsRecharge =
          (lastSelectedSuggestionVehicle.connectors[0].time +
            lastSelectedSuggestionVehicle.connectors[1].time) /
          2;
        handleSendTravelData(nbBornes, totaltemps, tempsRecharge);
      }

      // Le reste de votre code
    } catch (error) {
      console.error("Erreur lors de la récupération de l'itinéraire:", error);
    }
  };

  const [totalTimeTravelH, setTotalTimeTravelH] = useState(0);
  const [totalTimeTravelM, setTotalTimeTravelM] = useState(0);
  const handleSendTravelData = async (a, b, c) => {
    const apiUrl = `http://localhost:3003/totalTime/${encodeURIComponent(
      a
    )}/${encodeURIComponent(b)}/${encodeURIComponent(c)}`;
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      const hours = Math.floor(data / 60);
      const minutes = Math.round((data / 60 - hours) * 60);
      setTotalTimeTravelH(hours);
      setTotalTimeTravelM(minutes);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div className="App">
      <ToastContainer />
      <div className="containerTout">
        <div style={{ paddingRight: "100px" }}>
          <h3>véhicule électrique :</h3>
          <Autosuggest
            suggestions={suggestionsVehicle}
            onSuggestionsFetchRequested={onSuggestionsVehicleFetchRequested}
            onSuggestionsClearRequested={onSuggestionsVehicleClearRequested}
            onSuggestionSelected={onSuggestionVehicleSelected}
            getSuggestionValue={(value) => value}
            renderSuggestion={renderSuggestionVehicle}
            inputProps={{
              placeholder: "Nom du véhicule",
              value: vehicleSearch,
              onChange: (_, { newValue }) => {
                // Mettre à jour vehicleSearch sans toucher à lastSelectedSuggestion
                setVehicleSearch(newValue);
              },
            }}
          />
          <h3>Lieu départ :</h3>
          <Autosuggest
            suggestions={startSuggestions}
            onSuggestionsFetchRequested={onStartSuggestionsFetchRequested}
            onSuggestionsClearRequested={onStartSuggestionsClearRequested}
            onSuggestionSelected={onStartSuggestionSelected}
            getSuggestionValue={getStartSuggestionValue}
            renderSuggestion={renderStartSuggestion}
            inputProps={{
              placeholder: "Nom du lieu de départ",
              value: startSearchValue,
              onChange: (_, { newValue }) => setStartSearchValue(newValue),
            }}
          />
          <h3>Lieu destination :</h3>
          <Autosuggest
            suggestions={destinationSuggestions}
            onSuggestionsFetchRequested={onDestinationSuggestionsFetchRequested}
            onSuggestionsClearRequested={onDestinationSuggestionsClearRequested}
            onSuggestionSelected={onDestinationSuggestionSelected}
            getSuggestionValue={getDestinationSuggestionValue}
            renderSuggestion={renderDestinationSuggestion}
            inputProps={{
              placeholder: "Nom du lieu de destination",
              value: destinationSearchValue,
              onChange: (_, { newValue }) => {
                setDestinationSearchValue(newValue);
              },
            }}
          />

          <button id="getDestination" onClick={testDirection}>
            Obtenir l'itinéraire
          </button>
          <button
            id="getDestination"
            onClick={() => console.log("clé api : " + apiKey)}
          >
            test
          </button>

          {totalTimeTravelM > 0 && (
            <div className="totalTempsContainer">
              <p className="totalTempsLabel">Temps de trajet estimé :</p>
              <p className="totalTemps">
                {totalTimeTravelH > 0 && (
                  <>
                    <span className="hours">{totalTimeTravelH}h</span>
                    {totalTimeTravelM > 0 && (
                      <span className="separator"> et </span>
                    )}
                  </>
                )}
                <span className="minutes">{totalTimeTravelM}min</span>
              </p>
            </div>
          )}
        </div>
        <MyMap
          className="map"
          routeGeometry={routeGeometry}
          routeName={nameRoute}
        />
      </div>
    </div>
  );
}

export default App;
