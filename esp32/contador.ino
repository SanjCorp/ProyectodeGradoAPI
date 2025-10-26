#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "time.h"

const char* ssid = "Flia. Sanjines";
const char* password = "Rsan20255";
const char* serverName = "https://proyectodegradoapi.onrender.com/data";

const int TDS_PIN = 33;
int numSamples = 10;  
float ECValue = 0.0;

// Configuración de NTP
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = -14400; // GMT-4
const int daylightOffset_sec = 0;

void setup() {
  Serial.begin(115200);
  pinMode(TDS_PIN, INPUT);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected!");

  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
}

String getTimeStamp() {
  struct tm timeinfo;
  if(!getLocalTime(&timeinfo)){
    return "0000-00-00 00:00:00";
  }
  char buf[20];
  strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M:%S", &timeinfo);
  return String(buf);
}

void loop() {
  long sum = 0;
  for (int i = 0; i < numSamples; i++) {
    sum += analogRead(TDS_PIN);
    delay(10);
  }
  
  float avgAnalog = sum / (float)numSamples;
  float voltage = avgAnalog * (3.3 / 4095.0);
  ECValue = (voltage / 3.3) * 1000;  

  Serial.print("Stable EC: ");
  Serial.println(ECValue);

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    // Crear JSON con EC y timestamp
    String json;
    StaticJsonDocument<200> doc;
    doc["ec"] = ECValue;
    doc["timestamp"] = getTimeStamp();
    serializeJson(doc, json);

    int httpResponseCode = http.POST(json);
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);

    http.end();
  }

  delay(3000);  // enviar cada 3 segundos
}
