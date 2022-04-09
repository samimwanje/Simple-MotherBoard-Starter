#include <HTTPClient.h>

#include <WiFi.h>

#include "EmonLib.h"

#include <SoftwareSerial.h>

#define mothPIN 13 // Used for the motherboard switch.
#define tempPin 32 // Used for the temp switch.
#define currPin 35 // Used to read the current.

const String chipId = "XXXXX";
const char * ssid = "XXXXXXX";
const char * password = "XXXXXXX";
String HOST_NAME = "http://XXXXXXX:5000"; // Hostname to the webpage.
/**
 * Used to set up the wifi, not the same as in the software.
 */
void connectWiFi() {
    WiFi.begin(ssid, password); // Connecting to the WiFi

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.println("Connecting to WiFi...");
    }

    Serial.println("Connected to WiFi");

}

/**
 *Used to read the current tempereture,
 *returns a main with the read 10 read values.
 */
String readTemp() {
    float tempMain = 0;
    for (int x = 0; x < 10; x++) {
        int tempVal; // temperature sensor raw readings
        float volts; // variable for storing voltage 
        float temp; // actual temperature variable

        //read the temp sensor and store it in tempVal
        tempVal = analogRead(tempPin);
        volts = tempVal / 1023.0; // normalize by the maximum temperature raw reading range
        temp = (volts - 0.5) * 100; //calculate temperature celsius from voltage as per the equation found on the sensor spec sheet.

        tempMain += temp; // Main used for temp
    }

    return String(tempMain / 10);
}

SoftwareSerial mySerial(17, 16); // TX, RX
EnergyMonitor emon1;
float readings = 10.0;
/**
 *Used to read the current energy in WATTS,
 *returns a main with the read 10 read values.
 */
String readEnergy() {
    float wattMain = 0; // Holding the Main of the last 10 watts readings.

    for (int x = 0; x < readings; x++) // Loops to create a main of 10.
    {

        
        float amps = emon1.calcIrms(1480);
        wattMain += (amps * 235);
        
 
    }
    if ((wattMain / readings) > 300) // Fixes false value at start of program.
        wattMain = 50 * readings;

    String mained = String(wattMain / readings);
    return mained;
}

unsigned int pm1 = 0;
unsigned int pm2_5 = 0;
unsigned int pm10 = 0;
/**
 *Dust sensor, PM1, PM2.5 AND 10.
 */
String dustSensor() {
    int index = 0;
    char value;
    char previousValue;

    while (mySerial.available()) {
        value = mySerial.read();
        if ((index == 0 && value != 0x42) || (index == 1 && value != 0x4d)) {
            //   Serial.println("Cannot find the data header.");
            break;
        }

        if (index == 4 || index == 6 || index == 8 || index == 10 || index == 12 || index == 14) {
            previousValue = value;
        } else if (index == 5) {
            pm1 = 256 * previousValue + value;
            //    Serial.print("{ ");
            //    Serial.print("\"pm1\": ");
            // Serial.print(pm1);
            //    Serial.print(" ug/m3");
            //    Serial.print(", ");
        } else if (index == 7) {
            pm2_5 = 256 * previousValue + value;
            //     Serial.print("\"pm2_5\": ");
            // Serial.print(pm2_5);
            //   Serial.print(" ug/m3");
            //   Serial.print(", ");
        } else if (index == 9) {
            pm10 = 256 * previousValue + value;
            // Serial.print("\"pm10\": ");
            // Serial.print(pm10);
            //     Serial.print(" ug/m3");
        } else if (index > 15) {
            break;
        }

        index++;
    }

    while (mySerial.available()) mySerial.read();
    //    Serial.println(" }");

    return String(pm2_5);

}

int offline;
String GET__SWITCH = "/functions/userSwitch/"; // contacts the status.
/**
 *Function that checks the value of the,
 *online switch from the server.
 */
String onlineSwitch() {
    HTTPClient http;

    http.begin(HOST_NAME + GET__SWITCH + chipId); //HTTP
    int httpCode = http.GET();
    String payload = "NULL";

    // httpCode will be negative on error
    if (httpCode > 0) {
        // file found at server
        if (httpCode == HTTP_CODE_OK) {
            payload = http.getString();

        } else {
            // HTTP header has been send and Server response header has been handled
            Serial.printf("[HTTP] GET..sad. code: %d\n", httpCode);
        }
    } else {
        Serial.printf("[HTTP] GET..da. failed, error: %s\n", http.errorToString(httpCode).c_str());
        offline = 1;
    }

    http.end();

    return payload;
}

String preToggleState = "0";
/**
 *Used when the online switch makes a change,
 *The pc will then turn on.
 */
void pcStart(String s) {
    String currToggleState = s;

    if (offline == 1) {
        // If server was offline ignore toggle.
        preToggleState = s;
        offline = 0;
    } else {
        if (preToggleState != currToggleState) {
            pinMode(mothPIN, OUTPUT);
            digitalWrite(mothPIN, LOW);
            if (digitalRead(12) == 0) {
                Serial.println("STARTING PC VIA WEB CALL...");
                delay(100);
            } else {
                Serial.println("FORCE SHUT DOWN VIA WEB CALL...");
                delay(10000);
            }

            pinMode(mothPIN, INPUT);

        }
    }

    preToggleState = currToggleState;

}

int prevState = 0;
String POST_STATE = "/functions/userOnline/" + chipId + "?online=";
/*If PC is manually started, it will be noted to the webb.
 *This if for the web indicator.
 */
int posted = 0;
int postState() {
    int currState = digitalRead(12);
    if (currState != prevState || posted == 0) {
        // Serial.println("POSTING!!!!");
        HTTPClient http;

        http.begin(HOST_NAME + POST_STATE + currState); //HTTP
        int httpCode = http.GET();

        // httpCode will be negative on error
        if (httpCode > 0) {
            // file found at server
            if (httpCode == HTTP_CODE_OK) {
                String payload = http.getString();
                posted = 1;
            } else {
                // HTTP header has been send and Server response header has been handled
                Serial.printf("[HTTP] GET... code: %d\n", httpCode);
            }
        } else {
            Serial.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
        }

        http.end();
    }

    prevState = currState;
    return currState;
}

/**
 *Used to post the sensor data to the website,
 *temp, energy, dust.
 */
void postSensors(String temp, String energy, String pm2) {
    String POST_SENSORS = "/functions/userSensors/" + chipId + "?temp=" + temp + "&energy=" + energy + "&pm2=" + pm2;

    HTTPClient http;

    http.begin(HOST_NAME + POST_SENSORS); //HTTP
    int httpCode = http.GET();

    // httpCode will be negative on error
    if (httpCode > 0) {
        // file found at server
        if (httpCode == HTTP_CODE_OK) {
            String payload = http.getString();
        } else {
            // HTTP header has been send and Server response header has been handled
            Serial.printf("[HTTP] GET... code: %d\n", httpCode);
        }
    } else {
        Serial.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
    }

    http.end();

}
/**
 * Set up wifi and energy sensor.
 */

unsigned long startMillis; //some global variables available anywhere in the program
unsigned long currentMillis;
void setup() {
    Serial.begin(115200);
    while (!Serial);
    mySerial.begin(9600);

    connectWiFi(); // Connect to wifi.
    pinMode(12, INPUT); // Used to read the pc status.
    emon1.current(currPin, 250); // Current sensor calibration.
    preToggleState = onlineSwitch(); // Save previous toggle state.
    startMillis = millis(); //initial start time
}

/**
 * Loop where sensors and switched is checked and uploaded to db.
 */
const unsigned long period = 100; //the value is a number of milliseconds
void loop() {

    if (WiFi.status() == WL_CONNECTED) // If connected to internet and server is online.
    {

        String live = onlineSwitch(); // Check if online switch is toggled.
        if (live != "NULL") {
            pcStart(live); // Read online switch, and turn on computer if needed.
            currentMillis = millis(); //get the current "time" (actually the number of milliseconds since the program started)
            if ((postState() == 1) && (currentMillis - startMillis >= period) && (mySerial.available())) {

                // Pc is on, server is on and 60 s passed.
                postSensors(readTemp(), readEnergy(), dustSensor()); // Read and post all sensor data.   
                startMillis = currentMillis; // Restart minute timer.  
            }

        } else {
            Serial.println("Server offline.");
        }

    } else {
        Serial.println("WiFi Offline.");
    }
    delay(2000);
}
