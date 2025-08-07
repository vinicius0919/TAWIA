const btn = document.getElementById("start");
const dataElement = document.getElementById("data");

const calendarificKey = `E9i7oKuIWFkShu7kR8MRQCDBVRa7DGjp`;
const airQualityKey = "f2edcdbe-bdf4-4652-9ad0-a8ab0519744e";

function criarElemento(tipo, classe, conteudo = "") {
  const el = document.createElement(tipo);
  el.className = classe;
  el.innerHTML = conteudo;
  return el;
}

const translateToPortuguese = (text) => {};

function interpretarAQI(aqi) {
  if (aqi <= 50) return { status: "Boa", cor: "green" };
  if (aqi <= 100) return { status: "Moderada", cor: "yellow" };
  if (aqi <= 150)
    return { status: "Não saudável para sensíveis", cor: "orange" };
  if (aqi <= 200) return { status: "Não saudável", cor: "red" };
  if (aqi <= 300) return { status: "Muito não saudável", cor: "purple" };
  return { status: "Perigosa", cor: "brown" };
}

const consultAirQuality = async (lat, lon) => {
  const url = `https://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lon}&key=${airQualityKey}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erro na API de qualidade do ar");
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
};

const consultOpenMeteo = async (lat, lon) => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erro na API do clima");
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
};

const consultarFeriados = async (ano, pais) => {
  const url = `https://calendarific.com/api/v2/holidays?&api_key=${calendarificKey}&country=${pais}&year=${ano}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erro na API de feriados");
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
};

btn.addEventListener("click", async () => {
  dataElement.innerHTML = ""; // Limpar antes de atualizar

  const local = await fetch(`https://ipapi.co/json/`)
    .then((res) => res.json())
    .catch((err) => console.error(err));

  // Localização
  const locationTitle = criarElemento(
    "h1",
    "section-title",
    "📍 Sua Localização"
  );
  const locationInfo = criarElemento(
    "p",
    "location-info",
    `Você está em <strong>${local.city}</strong>, ${local.region}, ${local.country}.`
  );
  dataElement.append(locationTitle, locationInfo);

  // Clima
  const weatherData = await consultOpenMeteo(local.latitude, local.longitude);
  if (weatherData) {
    const weatherTitle = criarElemento(
      "h2",
      "section-subtitle",
      "🌤️ Clima de Hoje"
    );
    const clima = criarElemento(
      "p",
      "weather-info",
      `Máxima: <span class="temp-max">${weatherData.daily.temperature_2m_max[0]}°C</span>, 
       Mínima: <span class="temp-min">${weatherData.daily.temperature_2m_min[0]}°C</span>, 
       Precipitação: <span class="precip">${weatherData.daily.precipitation_sum[0]}mm</span>.`
    );
    dataElement.append(weatherTitle, clima);
  }

  // Qualidade do Ar
  const airQualityData = await consultAirQuality(
    local.latitude,
    local.longitude
  );
  if (airQualityData) {
    const aqi = airQualityData.data.current.pollution.aqius;
    const aqiInfo = interpretarAQI(aqi);
    const airTitle = criarElemento(
      "h2",
      "section-subtitle",
      "💨 Qualidade do Ar"
    );
    const airInfo = criarElemento(
      "p",
      `air-quality ${aqiInfo.cor}`,
      `Índice AQI (US): <strong>${aqi}</strong> – <span class="aqi-status">Qualidade: ${aqiInfo.status}</span>`
    );
    dataElement.append(airTitle, airInfo);
  } else {
    dataElement.append(
      criarElemento(
        "p",
        "error-msg",
        "⚠️ Não foi possível obter a qualidade do ar."
      )
    );
  }

  // Feriados
  const ano = new Date().getFullYear();
  const feriados = await consultarFeriados(ano, local.country.toUpperCase());

  if (feriados && feriados.response.holidays.length > 0) {
    const feriadoTitle = criarElemento(
      "h2",
      "section-subtitle",
      "🎉 Feriados Nacionais"
    );
    const lista = document.createElement("ul");
    lista.className = "holiday-list";

    feriados.response.holidays.forEach((feriado) => {
      const item = document.createElement("li");
      item.className = "holiday-item";
      const data = new Date(feriado.date.iso);
      const dataFormatada = data.toLocaleDateString("pt-BR");
      item.innerHTML = `<span class="holiday-date">${dataFormatada}</span> – <strong>${
        feriado.name
      }</strong> <em>(${feriado.type.join(", ")})</em>`;
      lista.appendChild(item);
    });

    dataElement.append(feriadoTitle, lista);
  } else {
    dataElement.append(
      criarElemento(
        "p",
        "info-msg",
        "📅 Nenhum feriado encontrado para este ano."
      )
    );
  }
});

document.addEventListener("DOMContentLoaded", () => {
  btn.disabled = false;
  btn.textContent = "Fale Sobre Onde Eu Estou";
});
