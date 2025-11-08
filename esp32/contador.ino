#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "Flia. Sanjines";
const char* password = "Rsan20255";
const char* serverName = "https://proyectodegradoapi.onrender.com";

// Pines
const int TDS_PIN = 33;           // Conductividad
const int FLUJO_PIN = 32;         // Flujometro (pulsos)
const int RELAY_PIN = 25;         // Relay bomba
const int TANQUE1 = 26;           // Nivel TK100
const int TANQUE2 = 27;           // Nivel TK101
const int TANQUE3 = 14;           // Nivel TK900

// Variables
int numSamples = 10;
float ECValue = 0.0;
volatile int pulso = 0;
float flujoActual = 0;
float litrosSolicitados = 0;
bool enviando = false;

// Interrupción flujometro
void IRAM_ATTR contarPulso() {
  pulso++;
}

void setup() {
  Serial.begin(115200);
  
  pinMode(TDS_PIN, INPUT);
  pinMode(FLUJO_PIN, INPUT_PULLUP);
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(TANQUE1, INPUT_PULLUP);
  pinMode(TANQUE2, INPUT_PULLUP);
  pinMode(TANQUE3, INPUT_PULLUP);

  attachInterrupt(digitalPinToInterrupt(FLUJO_PIN), contarPulso, RISING);

  // Conexión WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected!");
}

void loop() {
  // Leer conductividad
  long sum = 0;
  for(int i=0;i<numSamples;i++){
    sum += analogRead(TDS_PIN);
    delay(10);
  }
  float avgAnalog = sum / (float)numSamples;
  float voltage = avgAnalog * (3.3 / 4095.0);
  ECValue = (voltage / 3.3) * 1000;

  // Leer nivel tanques
  int nivel1 = digitalRead(TANQUE1);
  int nivel2 = digitalRead(TANQUE2);
  int nivel3 = digitalRead(TANQUE3);

  // Leer orden de envío de agua desde servidor
  if(WiFi.status()==WL_CONNECTED){
    HTTPClient http;
    http.begin(String(serverName)+"/enviar");
    int httpCode = http.GET();
    if(httpCode == 200){
      String payload = http.getString();
      StaticJsonDocument<200> doc;
      deserializeJson(doc, payload);
      float solicitados = doc["litros"];
      if(solicitados > 0 && !enviando){
        litrosSolicitados = solicitados;
        pulso = 0;
        enviando = true;
        digitalWrite(RELAY_PIN, HIGH); // activar bomba
      }
    }
    http.end();
  }

  // Controlar flujo
  if(enviando){
    flujoActual = pulso * 0.1; // suponer 0.1 litros por pulso
    if(flujoActual >= litrosSolicitados){
      digitalWrite(RELAY_PIN, LOW);
      enviando = false;
      litrosSolicitados = 0;
      pulso = 0;
    }
  }

  // Enviar datos al servidor
  if(WiFi.status()==WL_CONNECTED){
    HTTPClient http;
    http.begin(String(serverName)+"/data");
    http.addHeader("Content-Type", "application/json");

    String json;
    StaticJsonDocument<300> doc;
    doc["ec"] = ECValue;
    doc["nivel1"] = nivel1;
    doc["nivel2"] = nivel2;
    doc["nivel3"] = nivel3;
    doc["flujo"] = flujoActual;
    serializeJson(doc,json);

    int httpCode = http.POST(json);
    Serial.print("HTTP Response code: "); Serial.println(httpCode);
    http.end();
  }

  delay(3000);
}
