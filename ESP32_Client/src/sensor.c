#include "dht11.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"
#include "esp_log.h"
#include "mqtt.h"
#include "esp_system.h"

extern xSemaphoreHandle conexaoMQTTSemaphore;
#define TAG "Sensor"

void get_sensor_data(void *pvParameters)
{
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

            sprintf(tmp_data, "{\"data\": %f}", temperature_avg);
            ESP_LOGI(TAG, "Temperatura: %f", temperature_avg);
            mqtt_envia_mensagem("/fse2021/180106970/sala/temperatura", tmp_data);

            sprintf(tmp_data, "{\"data\": %f}", humidity_avg);
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

            vTaskDelay(2000 / portTICK_PERIOD_MS);
            count++;
            xSemaphoreGive(conexaoMQTTSemaphore);
        }
    }
}