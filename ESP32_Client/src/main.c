#include "dht11.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "nvs_flash.h"
#include "wifi.h"
#include "freertos/semphr.h"
#include "esp_log.h"
#include "esp_system.h"
#include "mqtt.h"

#include <pthread.h>

#define TAG "Main"

xSemaphoreHandle wifi_semaphore;
xSemaphoreHandle conexaoMQTTSemaphore;

void get_sensor_data(void *pvParameters)
{
    DHT11_init(GPIO_NUM_4);
    int initial_temperature = DHT11_read().temperature;
    int initial_humidity = DHT11_read().humidity;

    float temperature_avg = (float)initial_temperature;
    float humidity_avg = (float)initial_humidity;

    char tmp_data[50];
    while (1)
    {
        if (xSemaphoreTake(conexaoMQTTSemaphore, portMAX_DELAY))
        {
            struct dht11_reading data = DHT11_read();
            if (data.status == -1)
            {
                ESP_LOGE(TAG, "Error reading sensor");
            }
            else
            {
                temperature_avg = (temperature_avg * 0.8) + (float)data.temperature * 0.2;
                humidity_avg = (humidity_avg * 0.8) + (float)data.humidity * 0.2;
            }
            sprintf(tmp_data, "{\"data\": %f}", temperature_avg);
            ESP_LOGI(TAG, "Temperatura: %f", temperature_avg);
            mqtt_envia_mensagem("/fse2021/180106970/sala/temperatura", tmp_data);
            vTaskDelay(2000 / portTICK_PERIOD_MS);

            sprintf(tmp_data, "{\"data\": %f}", humidity_avg);
            ESP_LOGI(TAG, "Umidade: %f", humidity_avg);
            mqtt_envia_mensagem("/fse2021/180106970/sala/umidade", tmp_data);

            vTaskDelay(2000 / portTICK_PERIOD_MS);
            xSemaphoreGive(conexaoMQTTSemaphore);
        }
    }
}

void onWifiConnected(void *params)
{
    while (true)
    {
        if (xSemaphoreTake(wifi_semaphore, portMAX_DELAY))
        {
            ESP_LOGI(TAG, "Conectado ao wifi");

            mqtt_start();

            ESP_LOGI(TAG, "Conecção com o broker mqtt feita");
        }

        vTaskDelay(2000 / portTICK_PERIOD_MS);
    }
}

void app_main()
{

    // init NVS
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND)
    {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);
    conexaoMQTTSemaphore = xSemaphoreCreateBinary();
    wifi_semaphore = xSemaphoreCreateBinary();

    wifi_start();

    xTaskCreate(&onWifiConnected, "onWifiConnected", 2048, NULL, 1, NULL);
    xTaskCreate(&get_sensor_data, "get_sensor_data", 2048, NULL, 1, NULL);
}
