#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "Delgadillo";
const char* password = "RIBERA18";
const char* serverURL = "https://proyectodegradoapi.onrender.com/add";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  Serial.print("Conectando a WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConectado!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");
    int httpResponseCode = http.POST("{}");
    if (httpResponseCode > 0) {
      Serial.print("Dato enviado, respuesta: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("Error al enviar: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  }
  delay(5000);
}
