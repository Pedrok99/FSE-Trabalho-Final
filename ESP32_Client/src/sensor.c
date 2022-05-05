#include "dht11.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"
#include "esp_log.h"
#include "mqtt.h"
#include "esp_system.h"
#include "sensor.h"
#include "led.h"

extern xSemaphoreHandle conexaoMQTTSemaphore;
#define TAG "SENSOR"

void get_sensor_data(void *pvParameters)
{
    uint8_t mac[6];
    esp_read_mac(mac, ESP_MAC_WIFI_STA);

    // convert mac to string
    char mac_str[18];
    sprintf(mac_str, "%02x:%02x:%02x:%02x:%02x:%02x", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);

    DHT11_init(GPIO_NUM_4);
    int initial_temperature = DHT11_read().temperature;
    int initial_humidity = DHT11_read().humidity;

    float temperature_avg = (float)initial_temperature;
    float humidity_avg = (float)initial_humidity;

    char tmp_data[50];
    int count = 0;
    while (1)
    {
        if (count == 5)
        {
            count = 0;

            sprintf(tmp_data, "{\"data\": %f, \"mac\": \"%s\"}", temperature_avg, mac_str);
            ESP_LOGI(TAG, "Temperatura: %f", temperature_avg);
            mqtt_envia_mensagem("/fse2021/180106970/sala/temperatura", tmp_data);

            vTaskDelay(1000 / portTICK_PERIOD_MS);

            sprintf(tmp_data, "{\"data\": %f, \"mac\": \"%s\"}", humidity_avg, mac_str);
            ESP_LOGI(TAG, "Umidade: %f", humidity_avg);
            mqtt_envia_mensagem("/fse2021/180106970/sala/umidade", tmp_data);
        }

        if (xSemaphoreTake(conexaoMQTTSemaphore, portMAX_DELAY))
        {
            struct dht11_reading data = DHT11_read();
            if (data.status == -1)
            {
                ESP_LOGI(TAG, "Error reading sensor");
            }
            else
            {
                temperature_avg = (temperature_avg * 0.8) + (float)data.temperature * 0.2;
                humidity_avg = (humidity_avg * 0.8) + (float)data.humidity * 0.2;
            }

            count++;
            xSemaphoreGive(conexaoMQTTSemaphore);
        }
        vTaskDelay(2000 / portTICK_PERIOD_MS);
    }
}