#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "Delgadillo";
const char* password = "RIBERA18";
const char* serverURL = "https://proyectodegradoapi.onrender.com/contador";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Conectado a WiFi");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(server);
    http.addHeader("Content-Type", "application/json");
    
    int pulsos = random(0, 100); // ejemplo de valor
    String json = "{\"pulsos\": " + String(pulsos) + "}";
    
    int code = http.POST(json);
    Serial.print("Dato enviado, respuesta: ");
    Serial.println(code);
    
    http.end();
  }
  delay(5000);
}
