
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "time.h"

const char* ssid = "Flia. Sanjines";
const char* password = "Rsan20255";

const char* API_KEY = "mi_api_key_de_prueba"; // si usas seguridad, pon aquí (o dejar "")
const char* deviceName = "esp32_1";

const char* urlActive = "https://proyectodegradoapi.onrender.com/send_request/active?device=esp32_1";
const char* urlUpdate = "https://proyectodegradoapi.onrender.com/send_update";
const char* urlLevel = "https://proyectodegradoapi.onrender.com/level";

// pines
const int flowPin = 14;   // interrupt pin for flow sensor
const int pumpPin = 12;   // relay control
const int levelAnalogPin = 33; // sensor de nivel si es analógico

volatile unsigned long pulseCount = 0;
float pulsesPerLiter = 450.0; // ajustar según sensor
unsigned long lastReportMs = 0;
const unsigned long reportIntervalMs = 5000; // enviar delta cada 5s

// NTP
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = -4 * 3600;
const int daylightOffset_sec = 0;

void IRAM_ATTR onPulse() {
  pulseCount++;
}

void setup() {
  Serial.begin(115200);
  pinMode(pumpPin, OUTPUT);
  digitalWrite(pumpPin, LOW);
  pinMode(flowPin, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(flowPin), onPulse, RISING);

  WiFi.begin(ssid, password);
  Serial.print("Conectando WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500); Serial.print(".");
  }
  Serial.println(" conectado");

  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
}

String getTimestampISO(){
  struct tm timeinfo;
  if(!getLocalTime(&timeinfo)) return "";
  char buf[30];
  strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%S", &timeinfo);
  return String(buf);
}

float readLevelSensor(){
  // ejemplo si el sensor da 0-4095 -> map a porcentaje o valor real
  int raw = analogRead(levelAnalogPin);
  // map raw to 0..100 (ajusta fórmula según tu sensor)
  float level = (raw / 4095.0) * 100.0;
  return level;
}

void loop() {
  // 1) Consultar orden activa
  bool shouldRun = false;
  float target = 0.0;
  float accumulated = 0.0;
  String reqId = "";

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(urlActive);
    int code = http.GET();
    String body = http.getString();
    http.end();
    if (code == 200) {
      StaticJsonDocument<512> doc;
      DeserializationError err = deserializeJson(doc, body);
      if (!err && doc.size()>0) {
        if (doc.containsKey("target")) {
          target = doc["target"].as<float>();
          accumulated = doc["accumulated"].as<float>();
          reqId = doc["_id"] | "";
          String status = doc["status"] | "";
          if (status == "pending" || status == "running") shouldRun = true;
        }
      }
    }
  }

  // Encender o apagar bomba
  if (shouldRun) digitalWrite(pumpPin, HIGH);
  else digitalWrite(pumpPin, LOW);

  // 2) Cada interval: enviar segmento medido por el flujo
  unsigned long nowMs = millis();
  if (nowMs - lastReportMs >= reportIntervalMs) {
    detachInterrupt(digitalPinToInterrupt(flowPin));
    unsigned long pulses = pulseCount;
    pulseCount = 0;
    attachInterrupt(digitalPinToInterrupt(flowPin), onPulse, RISING);
    lastReportMs = nowMs;

    float liters = ((float)pulses) / pulsesPerLiter; // unidad: litros (según sensor)
    if (liters > 0.0) {
      // enviar send_update
      if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(urlUpdate);
        http.addHeader("Content-Type","application/json");
        if (strlen(API_KEY) > 0) http.addHeader("x-api-key", API_KEY);

        StaticJsonDocument<256> doc;
        doc["device"] = deviceName;
        doc["delta"] = liters;
        String out; serializeJson(doc, out);
        int code = http.POST(out);
        String resp = http.getString();
        Serial.printf("POST update code=%d, liters=%.4f body=%s\n", code, liters, resp.c_str());
        http.end();
      }
    }
  }

  // 3) Enviar nivel (cada ciclo, o reducir frecuencia)
  static unsigned long lastLevelMs = 0;
  if (millis() - lastLevelMs > 3000) {
    lastLevelMs = millis();
    float level = readLevelSensor();
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(urlLevel);
      http.addHeader("Content-Type","application/json");
      if (strlen(API_KEY) > 0) http.addHeader("x-api-key", API_KEY);

      StaticJsonDocument<200> j;
      j["device"] = deviceName;
      j["level"] = level;
      String out; serializeJson(j, out);
      int code = http.POST(out);
      Serial.printf("POST level code=%d level=%.2f\n", code, level);
      http.end();
    }
  }

  delay(200);
}
