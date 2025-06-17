#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <ESP8266HTTPClient.h>

const char* ssid = "Name"; //WIFI NAME
const char* password = "Pass"; //WIFI PASS

// ✅ Use the hosted HTTPS endpoint
const char* serverName = "https://ecomintcarbon.vercel.app/api/dashboard/cronjob/[userID]";

WiFiClientSecure client;

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);

  Serial.begin(9600);
  delay(2000);
  Serial.println("\nBooting...");

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    if (++retries > 60) return;
  }

  Serial.println("\nWiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  // ✅ Insecure (bypass SSL certificate verification)
  client.setInsecure();

  digitalWrite(LED_BUILTIN, HIGH);
}

void loop() {
  int rawValue = analogRead(A0);

  double ppm = rawValue * (1000.0 / 1023.0);       
  double mg = ppm * 1.96 * 0.1;                    
  double tons = mg / 1e9;                          
  double credits = tons * 100;                     

  Serial.print("Raw: ");
  Serial.print(rawValue);
  Serial.print("  PPM: ");
  Serial.print(ppm);
  Serial.print("  Tons: ");
  Serial.print(tons, 9);
  Serial.print("  Credits: ");
  Serial.println(credits, 9);

  String jsonData = "{\"credits\":" + String(credits, 9) + "}";

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient https;
    https.begin(client, serverName);
    https.addHeader("Content-Type", "application/json");

    Serial.print("Sending JSON data: ");
    Serial.println(jsonData);

    int httpCode = https.POST(jsonData);

    Serial.print("HTTP Response code: ");
    Serial.println(httpCode);

    if (httpCode > 0) {
      String response = https.getString();
      Serial.println("Response: " + response);
    } else {
      Serial.print("Error on sending POST: ");
      Serial.println(https.errorToString(httpCode).c_str());
    }

    https.end();
  } else {
    Serial.println("WiFi disconnected, reconnecting...");
    WiFi.reconnect();
  }

  delay(30000); // wait 30 seconds before sending again
}
