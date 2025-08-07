const btn = document.getElementById("start");
const dataElement = document.getElementById("data");

const consultOpenMeteo = async (lat, lon) => {
  const baseOpenMeteo = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto
`;
  try {
    const response = await fetch(baseOpenMeteo);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
    return null;
  }
};
btn.addEventListener("click", async () => {
  const local = await fetch(`https://ipapi.co/json/`)
    .then((response) => response.json())
    .catch((err) => console.log(err));
  console.log(local);
  dataElement.textContent =
    "Você está em: " +
    local.city +
    ", " +
    local.region +
    ", " +
    local.country +
    ".";

  const weatherData = await consultOpenMeteo(local.latitude, local.longitude);
  console.log(weatherData);
  dataElement.appendChild(document.createElement("br"));
  dataElement.append(
    `Temperatura máxima: ${weatherData.daily.temperature_2m_max[0]}°C, Temperatura mínima: ${weatherData.daily.temperature_2m_min[0]}°C, Precipitação: ${weatherData.daily.precipitation_sum[0]}mm.`
  );
});
document.addEventListener("DOMContentLoaded", () => {
  console.log("Document loaded");
  btn.disabled = false; // Enable the button after the document is loaded
  btn.textContent = "Clique para saber onde estou";
});
