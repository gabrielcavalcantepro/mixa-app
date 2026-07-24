import { describe, expect, it } from "vitest";
import { estaNaJanela, minutosDoDia } from "./janela";

describe("minutosDoDia", () => {
  it("converte HH:mm:ss em minutos desde meia-noite", () => {
    expect(minutosDoDia("07:30:00")).toBe(450);
    expect(minutosDoDia("00:00:00")).toBe(0);
    expect(minutosDoDia("23:45:00")).toBe(1425);
  });
});

describe("estaNaJanela", () => {
  it("verdadeiro quando o horário caiu nos últimos N minutos", () => {
    expect(estaNaJanela(450, 460, 15)).toBe(true); // 7:30 agendado, agora 7:40
  });

  it("falso quando o horário ainda não chegou", () => {
    expect(estaNaJanela(450, 440, 15)).toBe(false); // agendado 7:30, agora 7:20
  });

  it("falso quando o horário já passou da janela", () => {
    expect(estaNaJanela(450, 470, 15)).toBe(false); // agendado 7:30, agora 7:50
  });

  it("lida com a virada da meia-noite", () => {
    expect(estaNaJanela(1435, 5, 15)).toBe(true); // agendado 23:55, agora 00:05
  });
});
