import { buscarClimaCache, salvarClimaCache } from "./cache";
import type { ClimaDoDia, Coordenada, PesoClima } from "./tipos";

/**
 * OpenWeatherMap, camada gratuita (ver SPEC — permite uso comercial,
 * já inclui geocodificação, cota de sobra pro volume atual). Sem
 * OPENWEATHER_API_KEY configurada, cai num clima fixo pra não travar o
 * onboarding/motor de decisão em dev antes da chave existir — loga um
 * aviso uma vez.
 */
const CLIMA_FALLBACK: ClimaDoDia = {
  pesoClima: "meia_estacao",
  temperaturaC: 22,
  descricao: "Ameno (OPENWEATHER_API_KEY não configurada — ver .env.example)",
};

let avisouFallback = false;
function avisarFallbackUmaVez() {
  if (avisouFallback) return;
  avisouFallback = true;
  console.warn(
    "[clima] OPENWEATHER_API_KEY não configurada — usando clima fixo de desenvolvimento.",
  );
}

function pesoClimaPorTemperatura(temperaturaC: number): PesoClima {
  if (temperaturaC < 15) return "pesada";
  if (temperaturaC <= 25) return "meia_estacao";
  return "leve";
}

export class OpenWeatherClient {
  private get apiKey(): string | undefined {
    return process.env.OPENWEATHER_API_KEY || undefined;
  }

  /**
   * Resolve lat/lon de um município já escolhido pela usuária (o
   * autocomplete em si usa a lista real do IBGE, não esta API — ver
   * `onboarding/cidade/_lib/municipios-ibge.ts`). Chamado 1x no submit
   * de `salvarCidade`, nunca por tecla digitada.
   */
  async geocodificarMunicipio(cidade: string, uf: string): Promise<Coordenada | null> {
    if (!this.apiKey) {
      avisarFallbackUmaVez();
      return { lat: 0, lon: 0 };
    }

    const url = new URL("https://api.openweathermap.org/geo/1.0/direct");
    url.searchParams.set("q", `${cidade},${uf},BR`);
    url.searchParams.set("limit", "1");
    url.searchParams.set("appid", this.apiKey);

    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error(`Geocodificação falhou (${resposta.status})`);

    const resultados = (await resposta.json()) as { lat: number; lon: number }[];
    const [primeiro] = resultados;
    return primeiro ? { lat: primeiro.lat, lon: primeiro.lon } : null;
  }

  async climaDoDia(input: { cidade: string; lat: number; lon: number; data: string }): Promise<ClimaDoDia> {
    const emCache = await buscarClimaCache(input.cidade, input.data);
    if (emCache) return emCache;

    const clima = await this.buscarClimaAtual(input);
    await salvarClimaCache(input.cidade, input.data, clima);
    return clima;
  }

  private async buscarClimaAtual(input: { lat: number; lon: number }): Promise<ClimaDoDia> {
    if (!this.apiKey) {
      avisarFallbackUmaVez();
      return CLIMA_FALLBACK;
    }

    const url = new URL("https://api.openweathermap.org/data/2.5/weather");
    url.searchParams.set("lat", String(input.lat));
    url.searchParams.set("lon", String(input.lon));
    url.searchParams.set("units", "metric");
    url.searchParams.set("appid", this.apiKey);

    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error(`Consulta de clima falhou (${resposta.status})`);

    const dados = (await resposta.json()) as {
      main: { temp: number };
      weather: { description: string }[];
    };

    return {
      pesoClima: pesoClimaPorTemperatura(dados.main.temp),
      temperaturaC: Math.round(dados.main.temp),
      descricao: dados.weather[0]?.description ?? "",
    };
  }
}

let instancia: OpenWeatherClient | undefined;

export function getWeatherClient(): OpenWeatherClient {
  if (!instancia) instancia = new OpenWeatherClient();
  return instancia;
}
